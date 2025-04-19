const ValidatorLib = require('validator');
const ALLOWED_VALIDATORS = ["len", "notNull", "isNumeric", "isAlphanumeric", "isEmail"];
const DATETYPES = require('./data-types');

function validateModel(modelDefinition, newEntry) {
    for (const key in newEntry) {
        const value = newEntry[key] || "";
        const validateDefinition = modelDefinition[key]['validate'];
        if (validateDefinition != null) {
            for (const validator of ALLOWED_VALIDATORS) {
                if (validateDefinition[validator]) {
                    switch (validator) {
                        case "len":
                            const lenArr = validateDefinition[validator];
                            if (!(value.length > lenArr[0] && value.length < lenArr[1])) {
                                throw new Error(`Length should be between ${lenArr[0]} and ${lenArr[1]}`);
                            }
                            break;
                        case "notNull":
                            if (validateDefinition["notNull"] && !value) {
                                throw new Error(`Null values are not allowrd`);
                            }
                            break;
                        case "isNumeric":
                            if (validateDefinition["isNumeric"] && !ValidatorLib.isNumeric(value)) {
                                throw new Error(`Value is expected to be a numeric`);
                            }
                            break;
                        case "isAlphanumeric":
                            if (validateDefinition["isAlphanumeric"] && !ValidatorLib.isAlphanumeric(value)) {
                                throw new Error(`Value is ex`);
                            }
                            break;
                        case "isEmail":
                            if (validateDefinition["isEmail"] && !ValidatorLib.isEmail(value)) {
                                throw new Error(`Value should be an email`);
                            }
                            break;
                    }
                }
            }
        }
    }
}

function validateModelType(modelDefinition, newEntry) {
    for (const key in newEntry) {
        const value = newEntry[key];
        const type = modelDefinition[key]['type'];
        switch (type) {
            case DATETYPES.NUMBER:
                if (!ValidatorLib.isNumeric(""+value)) {
                    throw new Error(`Expected a numer but got a string`);
                }
                break;
        }
    }
}

module.exports = {
    validateModel,
    validateModelType
}