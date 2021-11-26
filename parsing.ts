import parse5= require ("parse5")
import JSZip =  require("jszip");
import * as fs from "fs-extra";
import e = require("express");

// random change//


interface Element {
    [key:string]:Room;
}

interface Room {
    "fullname": string;
	"shortname": string;
	"number": string;
	"name": string;
	"address": string;
	"lat": number;
	"lon": number;
	"seats": number;
	"type": string;
	"furniture": string;
	"href": string;

}

let tempDataset = {} as Element;



let result = fs.readFileSync("./rooms.zip").toString("base64");
// console.log(result);
// console.log(JSZip.loadAsync(result, { base64: true }))
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
    let indexPromiseArray: any = [];
    let indexPromise = getBuildingNames(zip);
    indexPromiseArray.push(indexPromise);

    Promise.all(indexPromiseArray).then(function () {
        if (tempDataset != {}) {
            getRooms(zip);
        }
    })
});

function getRooms(zip: JSZip) {
    let roomKey = "rooms/campus/discover/buildings-and-classrooms";
    let folder = zip.folder(roomKey);
    if(folder != null) {
        folder.forEach(function (relativePath: any, file: any) {
            if(tempDataset[relativePath] != null) {
                console.log(tempDataset[relativePath]);
            }
        })
    };
}

function getBuildingNames(zip: JSZip) {
    let indexKey = "rooms/index.htm"
    if (zip.file(indexKey) != null) {
        let promise = zip.file(indexKey).async("string").then((content) => {
            parseShortName(parse5.parse(content));
        }).catch((err) => {
            console.log("error in loadAsync");
        });
        return promise;
    }
}



function parseShortName(content: parse5.Document) {
    // console.log("ran parseShortName(...)")
    for (let element of content.childNodes)
        if(element.nodeName == "html") {
            parseShortNameHelper(element);
        }
}

function parseShortNameHelper(content: parse5.Element) {
    // console.log("ran parseShortNameHelper(...) on ", content.nodeName)
    if (content == null) {
        return;
    }
    for (let element of content.childNodes) {
        switch(element.nodeName) {
            case "tbody": createBuildings(element);
            case "body": 
            case "div": 
            case "table": 
            case "section": parseShortNameHelper(element); break;
        }
    }
}

function createBuildings(node: parse5.Element) {
    for (let tr of node.childNodes) {
        if (tr.nodeName == "tr") {
            addBuilding(tr as parse5.Element);
        }
    }
}

function addBuilding(node: parse5.Element) {
    let element = {} as Room;
    for (let td of node.childNodes) {
        if (td.nodeName == "td") {
            if (td.attrs[0]["value"] == "views-field views-field-field-building-code") {
                element.shortname = getShortName(td) as string;
            } else if (td.attrs[0]["value"] == "views-field views-field-title") {
                element.fullname = getLongName(td) as string;
            } else if (td.attrs[0]["value"] == "views-field views-field-field-building-address") {
                element.address = getAddress(td) as string;
            }
        }
    }
    if (element.shortname != null) {
        tempDataset[element.shortname] = element;
    }
}

function getAddress(node: parse5.Element) {
    for (let child of node.childNodes) {
        if (child.nodeName == "#text") {
            let text = (child as parse5.TextNode).value;
            text = text.replace("\n", "").trim();
            return text
        }
    }
}

function getShortName(node: parse5.Element) {
    for (let child of node.childNodes) {
        if (child.nodeName == "#text") {
            let text = child as parse5.TextNode;
            let str:string = text.value.replace("\n", "").trim();
            return str;
        }
    }
}

function getLongName(node: parse5.Element) {
    for(let a of node.childNodes) {
        if (a.nodeName == "a") {
            return getLongNameHelper(a)
        }
    }
}

function getLongNameHelper(node: parse5.Element) {
    if (node.attrs[1]["value"] == "Building Details and Map") {
        for (let t of node.childNodes) {
            if (t.nodeName == "#text") {
                let text = (t as parse5.TextNode).value
                return text
            }
        }
    }
}





