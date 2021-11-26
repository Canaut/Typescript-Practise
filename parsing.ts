import parse5= require ("parse5")
import JSZip =  require("jszip");
import * as fs from "fs-extra";
import http = require("http");
import { raw } from "body-parser";
import { resolve } from "path";
import { promisify } from "util";

let count = 0;

interface Element {
    [key:string]:Room;
}

interface GeoResponse {

    lat?: number;

    lon?: number;

    error?: string;

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
let listRooms = [] as Room[];



let result = fs.readFileSync("./rooms.zip").toString("base64");
// console.log(result);
// console.log(JSZip.loadAsync(result, { base64: true }))
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
    let indexPromiseArray: any = [];
    let indexPromise = getBuildingNames(zip);
    indexPromiseArray.push(indexPromise);

    Promise.all(indexPromiseArray).then(async function () {
        getGeoInfo(zip)
    })

    
});

function getGeoInfo(zip:JSZip) {
    return new Promise(async (resolve, reject) => {
        let link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/";
        let promiseArray:any = [];
        for (let shortName in tempDataset) {
            let element = tempDataset[shortName];
            let address = encodeURIComponent(element.address);
            let targetLink = link + address;
            let geoResult = {} as GeoResponse;
            promiseArray.push(new Promise(function (resolve, reject) {
                http.get(targetLink, (result) => {
                    result.on("data", (chunk: any) => {
                        geoResult = JSON.parse(chunk);
                        getLatAndLon(geoResult, reject, element);
                        tempDataset[shortName] = element;
                        resolve(1);
                    })
                })
            }))
        }

        Promise.all(promiseArray).then(() => {
            makeRooms(zip)
        })
    })
}

function getLatAndLon(geoResult: GeoResponse, reject: (reason?: any) => void, element: Room) {
    if (geoResult.lat == undefined || geoResult.lon == undefined) {
        reject(geoResult.error);
    }
    if (geoResult.lat != undefined) {
        element.lat = geoResult.lat;
    }
    if (geoResult.lon != undefined) {
        element.lon = geoResult.lon;
    }
}

function makeRooms(zip: JSZip) {
    let roomPromiseArray = []
    if (tempDataset != {}) {
        roomPromiseArray.push(getRooms(zip));
        // let promise = getRooms(zip);
        // roomPromiseArray.push(promise); 
    }
    Promise.all(roomPromiseArray).then(() => {
        // this contains full list of rooms
        console.log(listRooms);
        // console.log("final");
    });
}

async function getRooms(zip: JSZip) {
    return new Promise((resolve, reject) => {
        let promiseArray: any = [];
        let roomKey = "rooms/campus/discover/buildings-and-classrooms";
        let folder = zip.folder(roomKey);
        if(folder != null) {
            folder.forEach(function (relativePath: any, file: any) {
                if(tempDataset[relativePath] != null) {
                    promiseArray.push(file.async("string")
                    .then(function (content) {
                        parseRoom(tempDataset[relativePath], parse5.parse(content));
                    }));
                }
            });
        };

        Promise.all(promiseArray).then(() => {
            
            resolve(100);
        })
    })
    
}

async function getRoomHelper(room: Room, file: any) {
    let promise = file.async("string").then((content) => {
        parseRoom(room, parse5.parse(content));
    });

    Promise.all([promise]).then(() => {
        return;
    })
}

function parseRoom(room: Room, content: parse5.Document) {
    // console.log("ran parseShortName(...)")
    for (let element of content.childNodes)
        if(element.nodeName == "html") {
            return parseRoomHelper(room, element);
        }
}

function parseRoomHelper(room: Room, node: parse5.Element) {
    if (node == null) {
        return new Error();
    }
    for (let element of node.childNodes) {
        switch(element.nodeName) {
            case "tbody": createRooms(room, element); 
            case "body": 
            case "div": 
            case "table": 
            case "section": parseRoomHelper(room, element); break;
        }
    }
}

function createRooms(room: Room, node: parse5.Element) {
    for (let tr of node.childNodes) {
        if (tr.nodeName == "tr") {
            addRooms(room, tr as parse5.Element);
        }
    }
}

function addRooms(room: Room, node: parse5.Element) {
    let currentRoom = room;
    //default seats is 0, will be changed if the room contains capacity field
    currentRoom.seats = 0;
    let number = "views-field views-field-field-room-number";
    let capacity = "views-field views-field-field-room-capacity";
    let furniture = "views-field views-field-field-room-furniture";
    let type = "views-field views-field-field-room-type";

    for (let td of node.childNodes) {
        if (td.nodeName == "td") {
            switch(td.attrs[0]["value"]){
                case(number): {
                    let nameAndHref = getRoomNameAndHREF(td);
                    currentRoom.name = currentRoom.shortname + "_" + nameAndHref["name"];
                    currentRoom.href = nameAndHref["href"];
                    break;
                }
                case(capacity): {
                    let seats = Number(getModifiedText(td));
                    if (seats != undefined) {
                        currentRoom.seats = seats
                    }
                    break;
                } 
                case(furniture): {
                    let furniture = getModifiedText(td);
                    if (furniture != undefined) {
                        currentRoom.furniture = furniture;
                    }
                    break;
                }
                case(type): {
                    let type = getModifiedText(td);
                    if (type != undefined) {
                        currentRoom.type = furniture;
                    }
                    break;
                }
            }
        }
    }

    listRooms.push(currentRoom);
}

function getModifiedText(td: parse5.Element) {
    for (let child of td.childNodes) {
        if (child.nodeName == "#text") {
            let type = (child as parse5.TextNode).value.replace("\n", "").trim();
            return type;
        }
    }
}

function getRoomNameAndHREF(td: parse5.Element) {
    let result = {
        "name": "",
        "href": ""
    }
    for (let child of td.childNodes) {
        if (child.nodeName == "a") {
            let roomName = getRoomNameHelper(child);
            if(roomName != undefined) {
                result["name"] = roomName
            }
            result["href"] = child.attrs[0].value;
        }
    }

    return result;
}

function getRoomNameHelper(aNode: parse5.Element) {
    for (let text of aNode.childNodes) {
        if (text.nodeName == "#text") {
                return (text as parse5.TextNode).value;
        }
    }
}

function getBuildingNames(zip: JSZip) {
    let indexKey = "rooms/index.htm"
    if (zip.file(indexKey) != null) {
        let promise = zip.file(indexKey).async("string").then((content) => {
            parseBuilding(parse5.parse(content));
        }).catch((err) => {
            console.log("error in loadAsync");
        });
        return promise;

    }

}

async function parseBuilding(content: parse5.Document) {
    // console.log("ran parseShortName(...)")
    for (let element of content.childNodes)
        if(element.nodeName == "html") {
            parseBuildingHelper(element);
        }
}

async function parseBuildingHelper(content: parse5.Element) {
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
            case "section": parseBuildingHelper(element); break;
        }
    }
}

async function createBuildings(node: parse5.Element) {
    let promiseArray = [];
    for (let tr of node.childNodes) {
        if (tr.nodeName == "tr") {
            promiseArray.push(addBuilding(tr as parse5.Element));
        }
    }

    Promise.all(promiseArray).then(() => {
        // console.log("ran createBuildings");
        return;
    })
}

async function addBuilding(node: parse5.Element) {
    let element = {} as Room;
    for (let td of node.childNodes) {
        if (td.nodeName == "td") {
            if (td.attrs[0]["value"] == "views-field views-field-field-building-code") {
                element.shortname = getModifiedText(td) as string;
            } else if (td.attrs[0]["value"] == "views-field views-field-title") {
                element.fullname = getLongName(td) as string;
            } else if (td.attrs[0]["value"] == "views-field views-field-field-building-address") {
                element.address = getModifiedText(td) as string;
            }
        }
    }

    if (element.shortname != null) {
        tempDataset[element.shortname] = element;
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
                let text = (t as parse5.TextNode).value;
                return text;
            }
        }
    }
}





