import express from 'express';
import https from 'https';
import fs from 'fs';
import fetch from 'node-fetch';
import uuid from 'uuid-random';
import haversine from 'haversine';

import * as ml from './ml.js';
import * as acc from './acceleration.js';
import * as speed from './over-speeding.js';

const app = express();
const port = 8080;
const dataset = [];

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};


app.get('/data', async (req, res) => {
  return res.json(dataset);
});

// GPS LOCATION ACCESSES 60 DATASETS IN ONE SECONDS WITH DATA IN VARIANCE
// MEANING THE GPS COORDINATES ARE ACCURATE
app.post('/data', express.json(), async (req, res) => {
  // const extracted = await acc.extractGPSlocations(req.body, 6);
  // const showDistance = await acc.showDistance(req.body, extracted, 4)
  // console.log(showDistance);
  // ------------------------------------------------------------------------
  // const testModel = await ml.init(req.body)
  // dataset.push(testModel)
  // ------------------------------------------------------------------------
  calculateSpeed(req.body)
})

// https://nominatim.openstreetmap.org/reverse?format=json&lat=50.911286384041006&lon=-1.392990182470244&zoom=18&addressdetails=1
// https://www.overpass-api.de/api/interpreter?data=[out:json];way(around:2000,50.79247155933518,-1.1011859610339103)[maxspeed];out;

async function getallRoads([radius, lat, lon]) {
  const response = await fetch(`https://www.overpass-api.de/api/interpreter?data=[out:json];way(around:${radius},${lat},${lon})[maxspeed];out;`);
  const data = await response.json()
  return data
}

async function getsingleRoad([undefined, lat, lon]) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
  const data = await response.json();
  return data
}
// FINDS SMALL AND BIG LAT&LONG TO GET THE RADIUS
// THE RADIUS IS USED TO FETCH ALL ROADS WITHIN GIVEN RADIUS && RETURN MID LAT&LON FOR USE
function findMaxRadius(coords) {
  if(coords.length > 0) {
    let [start, end] = [{latitude: 0, longitude: 0}, {latitude: 0, longitude: 0}];
    let midCoords = {}
    const lat = coords.sort((a,b) => a.lat - b.lat);
    start.latitude = lat[0].lat;
    end.latitude = lat[lat.length-1].lat;
    midCoords.lat = lat[Math.floor(lat.length/2)].lat
    const lon = coords.sort((a,b) => b.lon - a.lon);
    start.longitude = lon[0].lon;
    end.longitude = lon[lon.length-1].lon;
    midCoords.lon = lon[Math.floor(lon.length/2)].lon
    const radius = Math.floor(haversine(start, end, {unit: 'meter'})) + 1000;
    return [radius, midCoords.lat, midCoords.lon]
  }
  return 'EMPTY GPS COORDS'
}

async function calculateSpeed(coords) {
  // STORES ALL RELEVANT ROADS INTO ARRAY FOR OVER-SPEEDING MEASUREMENT
  const allRoadsData = await getallRoads(findMaxRadius(coords));
  // THIS FUNCTION GETS CALLED FOR EACH ROAD
  const singleRoad =  await getsingleRoad(findMaxRadius(coords));
  console.log(allRoadsData.elements.length);
  console.log(singleRoad);
  const res = allRoadsData.elements.map((roads) => {
    return roads.tags
  }).find(road => road.name === singleRoad.address.road)
  console.log(res);
  // console.log(singleRoad);
}

const server = https.createServer(httpsOptions, app)
app.use(express.static('files'));
// server.addListener('upgrade',  (req, res, head) => console.log('UPGRADE:', req.url));
server.listen(port, () => {
  console.log('server running at ' + port)
})
