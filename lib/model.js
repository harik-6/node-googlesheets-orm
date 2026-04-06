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
        await toBeUpdated.save();
        return this.findById(rowNumber);
    }

    async where(whereObject) {
        const allRows = await this.findAll()
        const filteredRow = [];
        for(const row of allRows) {
            let match = true;
            for (const key in whereObject) {
                if (String(row[key]) !== String(whereObject[key])) {
                    match = false;
                    break;
                }
            }
            if (match) {
                filteredRow.push(row);
            }
        }
        return filteredRow;
    }

    async limit(count) {
        if (typeof count !== 'number' || count < 1) {
            throw new Error('limit() requires a positive number');
        }
        const allRows = await this.findAll();
        return allRows.slice(0, count);
    }

    async orderBy(field, direction = 'ASC') {
        const dir = direction.toUpperCase();
        if (dir !== 'ASC' && dir !== 'DESC') {
            throw new Error("orderBy() direction must be 'ASC' or 'DESC'");
        }
        const allRows = await this.findAll();
        return allRows.sort((a, b) => {
            const aVal = isNaN(a[field]) ? a[field] : Number(a[field]);
            const bVal = isNaN(b[field]) ? b[field] : Number(b[field]);
            if (aVal < bVal) return dir === 'ASC' ? -1 : 1;
            if (aVal > bVal) return dir === 'ASC' ? 1 : -1;
            return 0;
        });
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