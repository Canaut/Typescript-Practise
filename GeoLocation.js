"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.GeoLocation = void 0;
var roomhelper_1 = require("./roomhelper");
var http = require("http");
var GeoLocation = /** @class */ (function (_super) {
    __extends(GeoLocation, _super);
    function GeoLocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GeoLocation.prototype.getGeoInfo = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/";
            var promiseArray = [];
            for (var shortName in _this.building) {
                var element = _this.building[shortName];
                var address = encodeURIComponent(element.address);
                var targetLink = link + address;
                var geoResult = {};
                promiseArray.push(_this.extractGeoFromHTTP(targetLink, geoResult, element));
            }
            Promise.all(promiseArray).then(function () {
                resolve(1);
            });
        });
    };
    GeoLocation.prototype.extractGeoFromHTTP = function (targetLink, geoResult, element) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            http.get(targetLink, function (res) {
                res.on("data", function (chunk) {
                    geoResult = JSON.parse(chunk);
                    var addLatLon = _this.getLatAndLon(geoResult, element);
                    if (addLatLon === "valid") {
                        resolve(1);
                    }
                    else if (addLatLon === geoResult.error) {
                        resolve(addLatLon);
                    }
                });
            });
        });
    };
    GeoLocation.prototype.getLatAndLon = function (geoResult, element) {
        if (geoResult.lat === undefined || geoResult.lon === undefined) {
            return geoResult.error;
        }
        else {
            element.lat = geoResult.lat;
            element.lon = geoResult.lon;
        }
        this.building[element.shortname] = element;
        return "valid";
    };
    return GeoLocation;
}(roomhelper_1["default"]));
exports.GeoLocation = GeoLocation;
