import http = require("http");
import { GeoResponse, Room } from "./Interfaces";

async function extractGeoFromHTTP(targetLink: string, geoResult: GeoResponse, element: Room) {
    return new Promise((resolve, reject) => {
        http.get(targetLink, (res) => {
            res.on("data", (chunk: any) => {
                geoResult = JSON.parse(chunk);
                
                let addLatLon = getLatAndLon(geoResult, element);
                if (addLatLon === undefined) {
                    reject("Bad URI");
                }
                if (addLatLon === "valid") {
                    resolve(1);
                } else if(addLatLon === geoResult.error) {
                    resolve(addLatLon);

                }
            });
        });
    });
}

function getLatAndLon(geoResult: GeoResponse, element: Room) {
    if (geoResult.lat === undefined || geoResult.lon === undefined) {
        return geoResult.error;
    } else {
        element.lat = geoResult.lat;
        element.lon = geoResult.lon;
    }
    return "valid";
}

let link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team189/123%20"
let geoResult = {} as GeoResponse;
let element = {} as Room;

extractGeoFromHTTP(link, geoResult, element).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
})