"use strict";
exports.__esModule = true;
exports.SaveAndLoad = void 0;
var fs = require("fs-extra");
var SaveAndLoad = /** @class */ (function () {
    function SaveAndLoad() {
        this.directory = "./data/savedData.json";
    }
    SaveAndLoad.prototype.save = function (listDataset) {
        try {
            var data = JSON.stringify(listDataset);
            console.log(data);
            fs.writeFileSync(this.directory, data);
        }
        catch (error) {
            console.log("error thrown");
        }
    };
    SaveAndLoad.prototype.load = function () {
        try {
            var result = fs.readFileSync(this.directory).toString();
            return result;
        }
        catch (error) {
        }
    };
    return SaveAndLoad;
}());
exports.SaveAndLoad = SaveAndLoad;
