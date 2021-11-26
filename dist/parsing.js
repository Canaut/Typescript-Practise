"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSZip = require("jszip");
const fs = __importStar(require("fs-extra"));
const assert_1 = require("assert");
let result = fs.readFileSync("./rooms.zip").toString("base64");
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
    for (let key of Object.keys(zip.files)) {
        if (key == "rooms/index.htm") {
            zip.file("rooms/index.htm").async("string").then((result) => {
                console.log(result);
            }).catch((err) => {
                (0, assert_1.rejects)(err);
            });
        }
    }
});
//# sourceMappingURL=parsing.js.map