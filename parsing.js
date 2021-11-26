"use strict";
exports.__esModule = true;
var parse5 = require("parse5");
var JSZip = require("jszip");
var fs = require("fs-extra");
var tempDataset = {};
var result = fs.readFileSync("./rooms.zip").toString("base64");
// console.log(result);
// console.log(JSZip.loadAsync(result, { base64: true }))
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
    var indexPromiseArray = [];
    var indexPromise = getBuildingNames(zip);
    indexPromiseArray.push(indexPromise);
    Promise.all(indexPromiseArray).then(function () {
        if (tempDataset != {}) {
            getRooms(zip);
        }
    });
});
function getRooms(zip) {
    var roomKey = "rooms/campus/discover/buildings-and-classrooms";
    var folder = zip.folder(roomKey);
    if (folder != null) {
        folder.forEach(function (relativePath, file) {
            if (tempDataset[relativePath] != null) {
                console.log(tempDataset[relativePath]);
            }
        });
    }
    ;
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
