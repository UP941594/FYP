import express from 'express';
import https from 'https';
import fs from 'fs';
import fetch from 'node-fetch';
import uuid from 'uuid-random';
import haversine from 'haversine';
import bodyParser from 'body-parser'

import * as ml from './serverComponents/ml.js';
import * as db from './serverComponents/db.js';
import * as acc from './serverComponents/acceleration.js';
import * as speed from './serverComponents/over-speeding.js';

const app = express();
const port = 8080;
const dataset = [];

const httpsOptions = {
  key: fs.readFileSync('key/key.pem'),
  cert: fs.readFileSync('key/cert.pem')
};


app.get('/data', async (req, res) => {
  return res.json(dataset);
});

// GPS LOCATION ACCESSES 60 DATASETS IN ONE SECONDS WITH DATA IN VARIANCE
// MEANING THE GPS COORDINATES ARE ACCURATE
app.post('/data', bodyParser({limit: '1gb'}), async (req, res) => {
  console.log('Size: ', req.get("content-length")/1000000);
  // console.log(req.body);
  // ARG 1: ALL COLLECTED CORRDS // ARG 2: EACH LAT/LONG IS 14 DIGITS LONG SO WE ONLY CONSIDERING FIRST 6
  const extracted = await acc.extractGPSlocations(req.body.gps, 6);
  // ARG 1: ALL COORDS // ARG 2: EXTRACTED COORDS // ARG 3: TIME GAP TO MEASURE ACC. // ARG 4: MIN SPEED TO TEST ACC. ON
  const showDistance = await acc.showDistance(req.body.gps, extracted, 4, 5)
  console.log('Acc: ', showDistance);
  console.log('--------------------------------------------------');
  // // ------------------------------------------------------------------------
  const testModel = await ml.init(req.body.normal);
  const testBraking = await ml.init(req.body.braking);
  console.log('All: ', extractBrakeANDOtherEvents(testModel, 'NON AGGRESSIVE'));
  console.log('Braking: ', extractBrakeANDOtherEvents(testBraking, 'BRAKING'));
  console.log('--------------------------------------------------');
  // // dataset.push(testModel)
  // // ------------------------------------------------------------------------
  // ARG 1: ALL GPS COORDS // ARG 2: TIME GAP TO MEASURE SPEED IN SECS
  const overSpeed = await speed.calculateSpeed(req.body.gps, 1);
  console.log(overSpeed);
  // return res.json()
});



function extractBrakeANDOtherEvents(events, type) {
  if(type === 'BRAKING') {
    return events.filter(e => e.eventType === type)
  } else {
    return events.filter(e => e.eventType !== 'BRAKING')
  }
}

const server = https.createServer(httpsOptions, app)
app.use(express.static('files'));
app.use(bodyParser.json({limit: '50mb'}));
// server.addListener('upgrade',  (req, res, head) => console.log('UPGRADE:', req.url));
server.listen(port, () => {
  console.log('server running at ' + port)
})
