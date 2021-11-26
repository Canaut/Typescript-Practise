"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var parse5 = require("parse5");
var JSZip = require("jszip");
var http = require("http");
var fs = require("fs-extra");
var RoomClass = /** @class */ (function () {
    function RoomClass() {
        this.tempDataset = {};
        this.listRooms = [];
    }
    RoomClass.prototype.getGeoInfo = function (zip) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/";
            var promiseArray = [];
            for (var shortName in _this.tempDataset) {
                var element = _this.tempDataset[shortName];
                var address = encodeURIComponent(element.address);
                var targetLink = link + address;
                var geoResult = {};
                promiseArray.push(_this.extractGeoFromHTTP(targetLink, geoResult, element));
            }
            Promise.all(promiseArray).then(function () {
                _this.makeRooms(zip);
            });
        });
    };
    RoomClass.prototype.extractGeoFromHTTP = function (targetLink, geoResult, element) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            http.get(targetLink, function (res) {
                res.on("data", function (chunk) {
                    geoResult = JSON.parse(chunk);
                    var addLatLon = _this.getLatAndLon(geoResult, element);
                    if (addLatLon === "valid") {
                        resolve(1);
                    }
                    else {
                        reject(addLatLon);
                    }
                });
            });
        });
    };
    RoomClass.prototype.getLatAndLon = function (geoResult, element) {
        if (geoResult.lat === undefined || geoResult.lon === undefined) {
            return geoResult.error;
        }
        if (geoResult.lat !== undefined) {
            element.lat = geoResult.lat;
        }
        if (geoResult.lon !== undefined) {
            element.lon = geoResult.lon;
        }
        this.tempDataset[element.shortname] = element;
        return "valid";
    };
    RoomClass.prototype.makeRooms = function (zip) {
        var roomPromiseArray = [];
        if (this.tempDataset !== {}) {
            roomPromiseArray.push(this.getRooms(zip));
            // let promise = getRooms(zip);
            // roomPromiseArray.push(promise);
        }
        Promise.all(roomPromiseArray).then(function () {
            // this contains full list of rooms
            // console.log(this.listRooms);
            // console.log("final");
        });
    };
    RoomClass.prototype.getRooms = function (zip) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var promiseArray = [];
                        var roomKey = "rooms/campus/discover/buildings-and-classrooms";
                        var folder = zip.folder(roomKey);
                        if (folder != null) {
                            folder.forEach(function (relativePath, file) {
                                if (_this.tempDataset[relativePath] != null) {
                                    promiseArray.push(file.async("string")
                                        .then(function (content) {
                                        _this.parseRoom(_this.tempDataset[relativePath], parse5.parse(content));
                                    }));
                                }
                            });
                        }
                        Promise.all(promiseArray).then(function () {
                            resolve(100);
                        });
                    })];
            });
        });
    };
    RoomClass.prototype.getRoomHelper = function (room, file) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = file.async("string").then(function (content) {
                    _this.parseRoom(room, parse5.parse(content));
                });
                Promise.all([promise]).then(function () {
                    return;
                });
                return [2 /*return*/];
            });
        });
    };
    RoomClass.prototype.parseRoom = function (room, content) {
        // console.log("ran parseShortName(...)")
        for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
            var element = _a[_i];
            if (element.nodeName === "html") {
                return this.parseRoomHelper(room, element);
            }
        }
    };
    RoomClass.prototype.parseRoomHelper = function (room, node) {
        if (node == null) {
            return new Error();
        }
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var element = _a[_i];
            switch (element.nodeName) {
                case "tbody": this.createRooms(room, element);
                case "body":
                case "div":
                case "table":
                case "section": {
                    this.parseRoomHelper(room, element);
                    break;
                }
            }
        }
    };
    RoomClass.prototype.createRooms = function (room, node) {
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var tr = _a[_i];
            if (tr.nodeName === "tr") {
                this.addRooms(room, tr);
            }
        }
    };
    RoomClass.prototype.addRooms = function (room, node) {
        var currentRoom = room;
        // default seats is 0, will be changed if the room contains capacity field
        currentRoom.seats = 0;
        var number = "views-field views-field-field-room-number";
        var capacity = "views-field views-field-field-room-capacity";
        var furniture = "views-field views-field-field-room-furniture";
        var type = "views-field views-field-field-room-type";
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var td = _a[_i];
            if (td.nodeName === "td") {
                switch (td.attrs[0]["value"]) {
                    case (number): {
                        var nameAndHref = this.getRoomNameAndHREF(td);
                        currentRoom.name = currentRoom.shortname + "_" + nameAndHref["name"];
                        currentRoom.href = nameAndHref["href"];
                        break;
                    }
                    case (capacity): {
                        var seats = Number(this.getModifiedText(td));
                        if (seats !== undefined) {
                            currentRoom.seats = seats;
                        }
                        break;
                    }
                    case (furniture): {
                        var currFurniture = this.getModifiedText(td);
                        if (currFurniture !== undefined) {
                            currentRoom.furniture = currFurniture;
                        }
                        break;
                    }
                    case (type): {
                        var currType = this.getModifiedText(td);
                        if (currType !== undefined) {
                            currentRoom.type = currType;
                        }
                        break;
                    }
                }
            }
        }
        this.listRooms.push(currentRoom);
    };
    RoomClass.prototype.getModifiedText = function (td) {
        for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.nodeName === "#text") {
                var type = child.value.replace("\n", "").trim();
                return type;
            }
        }
    };
    RoomClass.prototype.getRoomNameAndHREF = function (td) {
        var nameAndHref = {
            name: "",
            href: ""
        };
        for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.nodeName === "a") {
                var roomName = this.getRoomNameHelper(child);
                if (roomName !== undefined) {
                    nameAndHref["name"] = roomName;
                }
                nameAndHref["href"] = child.attrs[0].value;
            }
        }
        return nameAndHref;
    };
    RoomClass.prototype.getRoomNameHelper = function (aNode) {
        for (var _i = 0, _a = aNode.childNodes; _i < _a.length; _i++) {
            var text = _a[_i];
            if (text.nodeName === "#text") {
                return text.value;
            }
        }
    };
    RoomClass.prototype.getBuildingNames = function (zip) {
        var _this = this;
        var indexKey = "rooms/index.htm";
        if (zip.file(indexKey) != null) {
            var promise = zip.file(indexKey).async("string").then(function (content) {
                _this.parseBuilding(parse5.parse(content));
            })["catch"](function (err) {
                console.log("error in loadAsync");
            });
            return promise;
        }
    };
    RoomClass.prototype.parseBuilding = function (content) {
        // console.log("ran parseShortName(...)")
        for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
            var element = _a[_i];
            if (element.nodeName === "html") {
                this.parseBuildingHelper(element);
            }
        }
    };
    RoomClass.prototype.parseBuildingHelper = function (content) {
        // console.log("ran parseShortNameHelper(...) on ", content.nodeName)
        if (content == null) {
            return;
        }
        for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
            var element = _a[_i];
            switch (element.nodeName) {
                case "tbody": this.createBuildings(element);
                case "body":
                case "div":
                case "table":
                case "section": {
                    this.parseBuildingHelper(element);
                    break;
                }
            }
        }
    };
    RoomClass.prototype.createBuildings = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var promiseArray, _i, _a, tr;
            return __generator(this, function (_b) {
                promiseArray = [];
                for (_i = 0, _a = node.childNodes; _i < _a.length; _i++) {
                    tr = _a[_i];
                    if (tr.nodeName === "tr") {
                        promiseArray.push(this.addBuilding(tr));
                    }
                }
                Promise.all(promiseArray).then(function () {
                    // console.log("ran createBuildings");
                    return;
                });
                return [2 /*return*/];
            });
        });
    };
    RoomClass.prototype.addBuilding = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var element, _i, _a, td;
            return __generator(this, function (_b) {
                element = {};
                for (_i = 0, _a = node.childNodes; _i < _a.length; _i++) {
                    td = _a[_i];
                    if (td.nodeName === "td") {
                        if (td.attrs[0]["value"] === "views-field views-field-field-building-code") {
                            element.shortname = this.getModifiedText(td);
                        }
                        else if (td.attrs[0]["value"] === "views-field views-field-title") {
                            element.fullname = this.getLongName(td);
                        }
                        else if (td.attrs[0]["value"] === "views-field views-field-field-building-address") {
                            element.address = this.getModifiedText(td);
                        }
                    }
                }
                if (element.shortname != null) {
                    this.tempDataset[element.shortname] = element;
                }
                return [2 /*return*/];
            });
        });
    };
    RoomClass.prototype.getLongName = function (node) {
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var a = _a[_i];
            if (a.nodeName === "a") {
                return this.getLongNameHelper(a);
            }
        }
    };
    RoomClass.prototype.getLongNameHelper = function (node) {
        if (node.attrs[1]["value"] === "Building Details and Map") {
            for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
                var t = _a[_i];
                if (t.nodeName === "#text") {
                    var text = t.value;
                    return text;
                }
            }
        }
    };
    return RoomClass;
}());
exports["default"] = RoomClass;
var start = new RoomClass;
var result = fs.readFileSync("./rooms.zip").toString("base64");
// console.log(result);
// console.log(JSZip.loadAsync(result, { base64: true }))
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
    var indexPromiseArray = [];
    var indexPromise = start.getBuildingNames(zip);
    indexPromiseArray.push(indexPromise);
    Promise.all(indexPromiseArray).then(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                start.getGeoInfo(zip);
                console.log(start.listRooms);
                return [2 /*return*/];
            });
        });
    });
});
