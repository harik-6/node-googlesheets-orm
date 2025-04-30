const { GoogleSpreadsheet } = require('google-spreadsheet');
const Model = require('./model');

class SheetORM {
    #config;
    #sheetMap = {};
    constructor(sheetConfig) {
        this.#config = sheetConfig;
        this.#validateConfig();
    }

    async init() {
        const doc = new GoogleSpreadsheet(
            this.#config["sheetId"], 
            this.#config["serviceAccount"]
        );
        await doc.loadInfo();
        const allSheets = doc.sheetsByIndex;
        for(const sheet of allSheets) {
            const title = sheet["_rawProperties"]["title"];
            this.#sheetMap[title] = sheet;
        }
    }

    defineModel(modelDefinition,modelOptions){
        const name = modelOptions["name"];
        const sheet = this.#sheetMap[name];
        if(!sheet) {
            throw new Error(`Sheet with name ${name} is not found in your google spreadhseet`);
        }
        // console.log("Loaded sheet",this.#sheetMap);
        return new Model(modelDefinition,{
            ...modelOptions,
            sheet,
            sheetMap : this.#sheetMap
        })
    }

    #validateConfig() {
        const sheetId = this.#config["sheetId"];
        const serviceAccount = this.#config["serviceAccount"];

        if (!sheetId) {
            throw new Error("Sheet id is missing during initilization");
        }

        if(!serviceAccount) {
            throw new Error("Service account is missing during initilization")
        }

        if(typeof sheetId !== 'string') {
            throw new Error("Invalid sheet id");
        }

        if(typeof serviceAccount !== 'object') {
            throw new Error("Invalid service account type");
        }

    }

}


module.exports = SheetORM;

