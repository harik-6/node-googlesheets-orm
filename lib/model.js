const Validator = require('./validator');

class Model {
    #modelDefinition;
    #modelOptions;
    #primaryKey
    #sheet = null;

    constructor(definition, options) {
        this.#modelDefinition = definition;
        this.#modelOptions = options;
        this.#validateModelDefinition();
        this.#sheet = options["sheet"];
    }

    async findById(id) {
        if (!id) {
            throw new Error("Primary key is missing");
        }
        const allRows = await this.#sheet.getRows();
        for (const row of allRows) {
            if (row.toObject()["id"] === id) {
                return row.toObject();
            }
        }
        return null;
    }


    async findAll() {
        const allRows = await this.#sheet.getRows();
        const dataRows = [];
        for (const row of allRows) {
            dataRows.push(row.toObject());
        }
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
}
module.exports = Model;