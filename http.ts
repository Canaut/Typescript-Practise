import http = require("http");

let link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/2194%20Health%20Sciences%20Mall"

let promise = http.get(link, (res) => {
    let rawData = '';
    res.on('data', (chunk: any) => {
        rawData += chunk;
        console.log(rawData);
    });
})



