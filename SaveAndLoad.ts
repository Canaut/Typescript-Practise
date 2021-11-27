import {DatasetObject, Room} from "./Interfaces";
import fs = require("fs-extra");

export class SaveAndLoad {
    private directory = "./data/savedData.json";

	public save(listDataset: Room[]) {
        try {
            let data = JSON.stringify(listDataset);
            console.log(data);
            fs.writeFileSync(this.directory, data);
        } catch (error) {
            console.log("error thrown");
        }
	}

    public load() {
        try {
            let result = fs.readFileSync(this.directory).toString() as unknown as Room[];
            return result;
        } catch (error) {
             
        }

    }
}