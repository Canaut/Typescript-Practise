"use strict";
exports.__esModule = true;
var RoomClassHelper = /** @class */ (function () {
    function RoomClassHelper() {
        this.building = {};
    }
    RoomClassHelper.prototype.getModifiedText = function (td) {
        for (var _i = 0, _a = td.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.nodeName === "#text") {
                var type = child.value.replace("\n", "").trim();
                return type;
            }
        }
    };
    RoomClassHelper.prototype.parseBuilding = function (content) {
        // console.log("ran parseShortName(...)")
        for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
            var element = _a[_i];
            if (element.nodeName === "html") {
                this.parseBuildingHelper(element);
            }
        }
    };
    RoomClassHelper.prototype.parseBuildingHelper = function (content) {
        // console.log("ran parseShortNameHelper(...) on ", content.nodeName)
        if (content == null) {
            return;
        }
        for (var _i = 0, _a = content.childNodes; _i < _a.length; _i++) {
            var element = _a[_i];
            switch (element.nodeName) {
                case "tbody":
                    this.createBuildings(element);
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
    RoomClassHelper.prototype.createBuildings = function (node) {
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var tr = _a[_i];
            if (tr.nodeName === "tr") {
                this.addBuilding(tr);
            }
        }
    };
    RoomClassHelper.prototype.addBuilding = function (node) {
        var element = {};
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var td = _a[_i];
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
            this.building[element.shortname] = element;
        }
    };
    RoomClassHelper.prototype.getLongName = function (node) {
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var a = _a[_i];
            if (a.nodeName === "a") {
                return this.getLongNameHelper(a);
            }
        }
    };
    RoomClassHelper.prototype.getLongNameHelper = function (node) {
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
    return RoomClassHelper;
}());
exports["default"] = RoomClassHelper;
