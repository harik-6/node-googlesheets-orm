const DATATYPES = require('./data-types');
const Validator = require('./validator');

class Model {
    #modelDefinition;
    #modelOptions;
    #sheet = null;
    #sheetMap = null;
    #oneToOneModel = null;
    #destinationModel = null;

    constructor(definition, options) {
        this.#modelDefinition = definition;
        this.#modelOptions = options;
        this.#validateModelDefinition();
        this.#sheet = options["sheet"];
        this.#sheetMap = options["sheetMap"];

    }

    getName() {
        return this.#modelOptions['name'];
    }

    async findById(id) {
        if (!id) {
            throw new Error("Primary key is missing");
        }
        const allRows = await this.findAll();
        for (const row of allRows) {
            if (row["id"] === id) {
                return row;
            }
        }
        return null;
    }


    async findAll() {
        const allRows = await this.#sheet.getRows();
        let dataRows = [];
        for (const row of allRows) {
            dataRows.push(row.toObject());
        }
        await this.#updateWithOneToOne(dataRows);
        return dataRows;
    }

    async create(newEntry) {
        this.#validateBeforeSave(newEntry);
        const addedRow = await this.#sheet.addRow(newEntry);
        return addedRow.toObject();
    }

    async update(updatedEntry) {
        const id = updatedEntry["id"];
        if (!id) {
            throw new Error(`Model can not be updated without the primary key`);
        }
        const allRows = await this.#sheet.getRows();
        let toBeUpdated = null;
        for (const row of allRows) {
            if (row.toObject()["id"] === id) {
                toBeUpdated = row;
            }
        }
        this.#validateBeforeSave(toBeUpdated.toObject());
        for (const key in model) {
            if (key !== 'id') {
                toBeUpdated.set(key, model[key]);
            }
        }
        toBeUpdated.save();
        return this.findById(id);
    }

    oneToOne(destinationModel=null) {
        if(destinationModel === null) {
            throw new Error(`Model missing in one to one mapping`);
        }
        const relModelName = "rel_"+this.getName()+"_"+destinationModel.getName();
        this.#destinationModel = destinationModel;
        this.#oneToOneModel = new Model({
            [this.getName()+"_id"] : {
                type : DATATYPES.NUMBER
            },
            [destinationModel.getName()+"_id"] : {
                type : DATATYPES.NUMBER
            }
        },{
            name : relModelName,
            sheet : this.#sheetMap[relModelName],
            sheetMap: this.#sheetMap
        });
    }

    #validateModelDefinition() {
        for (const key in this.#modelDefinition) {
            //validate if all the attributes are of type object
            const attributes = this.#modelDefinition[key];
            if (typeof attributes !== 'object') {
                throw new Error(`Model attributes can only be object.Invalid attribute found for key ${key}`);
            }
            // interate through attributes and make sure primary key is present
            let typefound = false;
            for (const keyAttrs in attributes) {
                if (keyAttrs === 'type') {
                    typefound = true;
                }
            }
            if (!typefound) {
                throw new Error(`Model attribute type not found.type is required and NUMBER,STRING are supported`)
            }
        }
    }

    #validateBeforeSave(newEntry) {
        Validator.validateModel(this.#modelDefinition, newEntry);
        Validator.validateModelType(this.#modelDefinition, newEntry)
    }

    async #updateWithOneToOne(dataRow=[]) {
        if(this.#oneToOneModel!=null) {
            const allOneToOneMapped = (await this.#oneToOneModel.findAll()) || [];
            let sourceModelToDestModelIdMap = {};
            allOneToOneMapped.forEach(record => {
                if(sourceModelToDestModelIdMap[record['employees_id']]==undefined) {
                    sourceModelToDestModelIdMap[record['employees_id']] = [record['roles_id']]
                } else {
                    sourceModelToDestModelIdMap[record['employees_id']].push([record['roles_id']])
                }
            });
            const allRoles = await this.#destinationModel.findAll();
            let idToRecordMap = {};
            allRoles.forEach(record => {
                idToRecordMap[record['id']] = record;
            })
            dataRow.forEach(row => {
                const roleIds = sourceModelToDestModelIdMap[row['id']];
                if(roleIds!==undefined) {
                    let roles = roleIds.map(id => idToRecordMap[id]);
                    row['roles'] = roles;
                } else {
                    row['roles'] = [];
                }
            })
        }
    }

}
module.exports = Model;