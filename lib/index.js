const { GoogleSpreadsheet } = require('google-spreadsheet');
const Model = require('./model');

class SheetORM {
    #doc;
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
        this.#doc = doc;
    }

    async defineModel(modelDefinition,modelOptions){
        const name = modelOptions["name"];
        let sheet = this.#sheetMap[name];
        if(!sheet) {
            console.log(`Sheet with name '${name}' is not found in your google spreadhseet.Creating a new sheet`);
            await this.#createNewSheet(modelDefinition,name);
            sheet = this.#sheetMap[name];
        }
        return new Model(modelDefinition,{
            ...modelOptions,
            sheet,
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

    async #createNewSheet(modelDefinition,modelName) {
        const rowKeys = Object.keys(modelDefinition);
        const addedSheet = await this.#doc.addSheet({ title:modelName,headerValues: rowKeys});
        this.#sheetMap[modelName] = addedSheet;
    }

}


module.exports = SheetORM;

