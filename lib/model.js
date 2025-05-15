const Validator = require('./validator');

class Model {
    #modelDefinition;
    #modelOptions;
    #sheet = null;

    constructor(definition, options) {
        this.#modelDefinition = definition;
        this.#modelOptions = options;
        this.#validateModelDefinition();
        this.#sheet = options["sheet"];
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
            if (row["_id"] === id) {
                return row;
            }
        }
        return null;
    }


    async findAll() {
        const allRows = await this.#sheet.getRows();
        let dataRows = [];
        for (const row of allRows) {
            dataRows.push({
                _id: row["_rowNumber"],
                ...row.toObject()
            });
        }
        return dataRows;
    }

    async create(newEntry) {
        this.#validateBeforeSave(newEntry);
        const addedRow = await this.#sheet.addRow(newEntry);
        return {
            _id: addedRow["_rowNumber"],
            ...addedRow.toObject()
        };
    }

    async update(updatedEntry) {
        const rowNumber = updatedEntry["_id"];
        if (!rowNumber) {
            throw new Error(`Model can not be updated without the field _id`);
        }
        const allRows = await this.#sheet.getRows();
        let toBeUpdated = null;
        for (const row of allRows) {
            if (row["_rowNumber"] === rowNumber) {
                toBeUpdated = row;
            }
        }
        this.#validateBeforeSave(toBeUpdated.toObject());
        for (const key in this.#modelDefinition) {
            if (key !== '_id' && updatedEntry[key]!==null) {
                toBeUpdated.set(key, updatedEntry[key]);
            }
        }
        toBeUpdated.save();
        return this.findById(rowNumber);
    }

    #validateModelDefinition() {
        for (const key in this.#modelDefinition) {
            //validate if all the attributes are of type object
            const attributes = this.#modelDefinition[key];
            if (typeof attributes !== 'object') {
                throw new Error(`Model attributes can only be object.Invalid attribute found for key ${key}`);
            }
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

}
module.exports = Model;