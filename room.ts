import parse5= require ("parse5")
import JSZip =  require("jszip");
import http = require("http");
import fs = require("fs-extra")


interface Building {
	[key: string]: Room;
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

export default class RoomClass {
	public tempDataset = {} as Building;
	public listRooms = [] as Room[];

	public getGeoInfo(zip: JSZip) {
		return new Promise( (resolve, reject) => {
			let link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/";
			let promiseArray: any = [];
			for (let shortName in this.tempDataset) {
				let element = this.tempDataset[shortName];
				let address = encodeURIComponent(element.address);
				let targetLink = link + address;
				let geoResult = {} as GeoResponse;
				promiseArray.push(this.extractGeoFromHTTP(targetLink, geoResult, element));
			}

			Promise.all(promiseArray).then(() => {
				this.makeRooms(zip);
			});
		});
	}

	private extractGeoFromHTTP(targetLink: string, geoResult: GeoResponse, element: Room) {
		return new Promise((resolve, reject) => {
			http.get(targetLink, (res) => {
				res.on("data", (chunk: any) => {
					geoResult = JSON.parse(chunk);
					let addLatLon = this.getLatAndLon(geoResult, element);
					if(addLatLon === "valid") {
						resolve(1);
					} else {
						reject(addLatLon);

					}
				});
			});
		});
	}

	private getLatAndLon(geoResult: GeoResponse, element: Room) {
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
	}

	private makeRooms(zip: JSZip) {
		let roomPromiseArray = [];
		if (this.tempDataset !== {}) {
			roomPromiseArray.push(this.getRooms(zip));
			// let promise = getRooms(zip);
			// roomPromiseArray.push(promise);
		}
		Promise.all(roomPromiseArray).then(() => {
			// this contains full list of rooms
			// console.log(this.listRooms);
			// console.log("final");
		});
	}

	private async getRooms(zip: JSZip) {
		return new Promise((resolve, reject) => {
			let promiseArray: any = [];
			let roomKey = "rooms/campus/discover/buildings-and-classrooms";
			let folder = zip.folder(roomKey);
			if(folder != null) {
				folder.forEach((relativePath: any, file: any) => {
					if(this.tempDataset[relativePath] != null) {
						promiseArray.push(file.async("string")
							.then((content: string) => {
								this.parseRoom(this.tempDataset[relativePath], parse5.parse(content));
							}));
					}
				});
			}

			Promise.all(promiseArray).then(() => {

				resolve(100);
			});
		});

	}

	private async getRoomHelper(room: Room, file: any) {
		let promise = file.async("string").then((content: string) => {
			this.parseRoom(room, parse5.parse(content));
		});

		Promise.all([promise]).then(() => {
			return;
		});
	}

	private parseRoom(room: Room, content: parse5.Document) {
		// console.log("ran parseShortName(...)")
		for (let element of content.childNodes) {
			if(element.nodeName === "html") {
				return this.parseRoomHelper(room, element);
			}
		}
	}

	private parseRoomHelper(room: Room, node: parse5.Element) {
		if (node == null) {
			return new Error();
		}
		for (let element of node.childNodes) {
			switch(element.nodeName) {
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
	}

	private createRooms(room: Room, node: parse5.Element) {
		for (let tr of node.childNodes) {
			if (tr.nodeName === "tr") {
				this.addRooms(room, tr as parse5.Element);
			}
		}
	}

	private addRooms(room: Room, node: parse5.Element) {
		let currentRoom = room;
		// default seats is 0, will be changed if the room contains capacity field
		currentRoom.seats = 0;
		let number = "views-field views-field-field-room-number";
		let capacity = "views-field views-field-field-room-capacity";
		let furniture = "views-field views-field-field-room-furniture";
		let type = "views-field views-field-field-room-type";

		for (let td of node.childNodes) {
			if (td.nodeName === "td") {
				switch(td.attrs[0]["value"]){
					case(number): {
						let nameAndHref = this.getRoomNameAndHREF(td);
						currentRoom.name = currentRoom.shortname + "_" + nameAndHref["name"];
						currentRoom.href = nameAndHref["href"];
						break;
					}
					case(capacity): {
						let seats = Number(this.getModifiedText(td));
						if (seats !== undefined) {
							currentRoom.seats = seats;
						}
						break;
					}
					case(furniture): {
						let currFurniture = this.getModifiedText(td);
						if (currFurniture !== undefined) {
							currentRoom.furniture = currFurniture;
						}
						break;
					}
					case(type): {
						let currType = this.getModifiedText(td);
						if (currType !== undefined) {
							currentRoom.type = currType;
						}
						break;
					}
				}
			}
		}

		this.listRooms.push(currentRoom);
	}

	private getModifiedText(td: parse5.Element) {
		for (let child of td.childNodes) {
			if (child.nodeName === "#text") {
				let type = (child as parse5.TextNode).value.replace("\n", "").trim();
				return type;
			}
		}
	}

	private getRoomNameAndHREF(td: parse5.Element) {
		let nameAndHref = {
			name: "",
			href: ""
		};
		for (let child of td.childNodes) {
			if (child.nodeName === "a") {
				let roomName = this.getRoomNameHelper(child);
				if(roomName !== undefined) {
					nameAndHref["name"] = roomName;
				}
				nameAndHref["href"] = child.attrs[0].value;
			}
		}

		return nameAndHref;
	}

	private getRoomNameHelper(aNode: parse5.Element) {
		for (let text of aNode.childNodes) {
			if (text.nodeName === "#text") {
				return (text as parse5.TextNode).value;
			}
		}
	}

	public getBuildingNames(zip: JSZip) {
		let indexKey = "rooms/index.htm";
		if (zip.file(indexKey) != null) {
			let promise = zip.file(indexKey).async("string").then((content) => {
				this.parseBuilding(parse5.parse(content));
			}).catch((err) => {
				console.log("error in loadAsync");
			});
			return promise;

		}

	}

	private parseBuilding(content: parse5.Document) {
		// console.log("ran parseShortName(...)")
		for (let element of content.childNodes) {
			if(element.nodeName === "html") {
				this.parseBuildingHelper(element);
			}
		}
	}

	private parseBuildingHelper(content: parse5.Element) {
		// console.log("ran parseShortNameHelper(...) on ", content.nodeName)
		if (content == null) {
			return;
		}
		for (let element of content.childNodes) {
			switch(element.nodeName) {
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
	}

	private async createBuildings(node: parse5.Element) {
		let promiseArray = [];
		for (let tr of node.childNodes) {
			if (tr.nodeName === "tr") {
				promiseArray.push(this.addBuilding(tr as parse5.Element));
			}
		}

		Promise.all(promiseArray).then(() => {
			// console.log("ran createBuildings");
			return;
		});
	}

	private async addBuilding(node: parse5.Element) {
		let element = {} as Room;
		for (let td of node.childNodes) {
			if (td.nodeName === "td") {
				if (td.attrs[0]["value"] === "views-field views-field-field-building-code") {
					element.shortname = this.getModifiedText(td) as string;
				} else if (td.attrs[0]["value"] === "views-field views-field-title") {
					element.fullname = this.getLongName(td) as string;
				} else if (td.attrs[0]["value"] === "views-field views-field-field-building-address") {
					element.address = this.getModifiedText(td) as string;
				}
			}
		}

		if (element.shortname != null) {
			this.tempDataset[element.shortname] = element;
		}

	}

	private getLongName(node: parse5.Element) {
		for(let a of node.childNodes) {
			if (a.nodeName === "a") {
				return this.getLongNameHelper(a);
			}
		}
	}

	private getLongNameHelper(node: parse5.Element) {
		if (node.attrs[1]["value"] === "Building Details and Map") {
			for (let t of node.childNodes) {
				if (t.nodeName === "#text") {
					let text = (t as parse5.TextNode).value;
					return text;
				}
			}
		}
	}
}

let start = new RoomClass;

let result = fs.readFileSync("./rooms.zip").toString("base64");
// console.log(result);
// console.log(JSZip.loadAsync(result, { base64: true }))
JSZip.loadAsync(result, { base64: true }).then(function (zip) {
	let indexPromiseArray: any = [];
	let indexPromise = start.getBuildingNames(zip);
	indexPromiseArray.push(indexPromise);

	Promise.all(indexPromiseArray).then(async function () {
		start.getGeoInfo(zip);
	});
});


