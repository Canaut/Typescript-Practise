"use strict";
exports.__esModule = true;
var http = require("http");
var link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/2194%20Health%20Sciences%20Mall";
var promise = http.get(link, function (res) {
    var rawData = '';
    res.on('data', function (chunk) {
        rawData += chunk;
        console.log(rawData);
    });
});
