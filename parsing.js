"use strict";
exports.__esModule = true;
var parse5 = require("parse5");
var JSZip = require("jszip");
var fs = require("fs-extra");
var tempDataset = {};
var listRooms = [];
var result = fs.readFileSync("./rooms.zip").toString("base64");
// console.log(result);
// console.log(JSZip.loadAsync(result, { base64: true }))
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
    var indexPromiseArray = [];
    var indexPromise = getBuildingNames(zip);
    indexPromiseArray.push(indexPromise);
    Promise.all(indexPromiseArray).then(function () {
        if (tempDataset != {}) {
            var roomPromiseArray = [];
            var roomPromise = getRooms(zip);
            roomPromiseArray.push(roomPromise);
            Promise.all(roomPromiseArray).then(function () {
                console.log(listRooms);
            });
        }
    });
});
function getRooms(zip) {
    var roomKey = "rooms/campus/discover/buildings-and-classrooms";
    var folder = zip.folder(roomKey);
    if (folder != null) {
        folder.forEach(function (relativePath, file) {
            if (tempDataset[relativePath] != null) {
                var promise = getRoomHelper(tempDataset[relativePath], file);
                return promise;
            }
        });
    }
    ;
}
function getRoomHelper(room, file) {
    var promise = file.async("string").then(function (content) {
        parseRoom(room, parse5.parse(content));
    });
    return promise;
}
function parseRoom(room, content) {
    // console.log("ran parseShortName(...)")
    for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
        var element = _a[_i];
        if (element.nodeName == "html") {
            parseRoomHelper(room, element);
        }
    }
}
function parseRoomHelper(room, node) {
    if (node == null) {
        return;
    }
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var element = _a[_i];
        switch (element.nodeName) {
            case "tbody": createRooms(room, element);
            case "body":
            case "div":
            case "table":
            case "section":
                parseRoomHelper(room, element);
                break;
        }
    }
}
function createRooms(room, node) {
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var tr = _a[_i];
        if (tr.nodeName == "tr") {
            addRooms(room, tr);
        }
    }
}
function addRooms(room, node) {
    var currentRoom = room;
    //default seats is 0, will be changed if the room contains capacity field
    currentRoom.seats = 0;
    var number = "views-field views-field-field-room-number";
    var capacity = "views-field views-field-field-room-capacity";
    var furniture = "views-field views-field-field-room-furniture";
    var type = "views-field views-field-field-room-type";
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var td = _a[_i];
        if (td.nodeName == "td") {
            switch (td.attrs[0]["value"]) {
                case (number): {
                    var nameAndHref = getRoomNameAndHREF(td);
                    currentRoom.name = currentRoom.shortname + "_" + nameAndHref["name"];
                    currentRoom.href = nameAndHref["href"];
                    break;
                }
                case (capacity): {
                    var seats = getRoomCapacity(td);
                    if (seats != undefined) {
                        currentRoom.seats = seats;
                    }
                    break;
                }
                case (furniture): {
                    var furniture_1 = getRoomFurniture(td);
                    if (furniture_1 != undefined) {
                        currentRoom.furniture = furniture_1;
                    }
                    break;
                }
                case (type): {
                    var type_1 = getRoomType(td);
                    if (type_1 != undefined) {
                        currentRoom.type = furniture;
                    }
                    break;
                }
            }
        }
    }
    listRooms.push(currentRoom);
}
function getRoomType(td) {
    for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName == "#text") {
            var type = child.value.replace("\n", "").trim();
            return type;
        }
    }
}
function getRoomFurniture(td) {
    for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName == "#text") {
            var furniture = child.value.replace("\n", "").trim();
            return furniture;
        }
    }
}
function getRoomCapacity(td) {
    for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName == "#text") {
            var capacity = child.value.replace("\n", "").trim();
            return Number(capacity);
        }
    }
}
function getRoomNameAndHREF(td) {
    var result = {
        "name": "",
        "href": ""
    };
    for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName == "a") {
            var roomName = getRoomNameHelper(child);
            if (roomName != undefined) {
                result["name"] = roomName;
            }
            result["href"] = child.attrs[0].value;
        }
    }
    return result;
}
function getRoomNameHelper(aNode) {
    for (var _i = 0, _a = aNode.childNodes; _i < _a.length; _i++) {
        var text = _a[_i];
        if (text.nodeName == "#text") {
            return text.value;
        }
    }
}
function getBuildingNames(zip) {
    var indexKey = "rooms/index.htm";
    if (zip.file(indexKey) != null) {
        var promise = zip.file(indexKey).async("string").then(function (content) {
            parseShortName(parse5.parse(content));
        })["catch"](function (err) {
            console.log("error in loadAsync");
        });
        return promise;
    }
}
function parseShortName(content) {
    // console.log("ran parseShortName(...)")
    for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
        var element = _a[_i];
        if (element.nodeName == "html") {
            parseShortNameHelper(element);
        }
    }
}
function parseShortNameHelper(content) {
    // console.log("ran parseShortNameHelper(...) on ", content.nodeName)
    if (content == null) {
        return;
    }
    for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
        var element = _a[_i];
        switch (element.nodeName) {
            case "tbody": createBuildings(element);
            case "body":
            case "div":
            case "table":
            case "section":
                parseShortNameHelper(element);
                break;
        }
    }
}
function createBuildings(node) {
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var tr = _a[_i];
        if (tr.nodeName == "tr") {
            addBuilding(tr);
        }
    }
}
function addBuilding(node) {
    var element = {};
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var td = _a[_i];
        if (td.nodeName == "td") {
            if (td.attrs[0]["value"] == "views-field views-field-field-building-code") {
                element.shortname = getShortName(td);
            }
            else if (td.attrs[0]["value"] == "views-field views-field-title") {
                element.fullname = getLongName(td);
            }
            else if (td.attrs[0]["value"] == "views-field views-field-field-building-address") {
                element.address = getAddress(td);
            }
        }
    }
    if (element.shortname != null) {
        tempDataset[element.shortname] = element;
    }
}
function getAddress(node) {
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName == "#text") {
            var text = child.value;
            text = text.replace("\n", "").trim();
            return text;
        }
    }
}
function getShortName(node) {
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName == "#text") {
            var text = child;
            var str = text.value.replace("\n", "").trim();
            return str;
        }
    }
}
function getLongName(node) {
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var a = _a[_i];
        if (a.nodeName == "a") {
            return getLongNameHelper(a);
        }
    }
}
function getLongNameHelper(node) {
    if (node.attrs[1]["value"] == "Building Details and Map") {
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var t = _a[_i];
            if (t.nodeName == "#text") {
                var text = t.value;
                return text;
            }
        }
    }
}
