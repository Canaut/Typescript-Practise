"use strict";
exports.__esModule = true;
exports.InsightDatasetKind = void 0;
// Object that is created when called by addDataset in InsightFacade
// Object is stored in a Dataset object containing a list of DatasetObjects
// Based on the InsightDatasetKind, either rooms or courses will be filled with content
var InsightDatasetKind;
(function (InsightDatasetKind) {
    InsightDatasetKind["Courses"] = "courses";
    InsightDatasetKind["Rooms"] = "rooms";
})(InsightDatasetKind = exports.InsightDatasetKind || (exports.InsightDatasetKind = {}));
