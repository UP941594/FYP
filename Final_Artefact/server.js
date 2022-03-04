import express from 'express';
import https from 'https';
import fs from 'fs';
import fetch from 'node-fetch';
import uuid from 'uuid-random';
import haversine from 'haversine';

import * as ml from './serverComponents/ml.js';
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
app.post('/data', express.json(), async (req, res) => {
  // console.log(req.body);
  // writeCSV(req.body)
  // const extracted = await acc.extractGPSlocations(req.body.gps, 6);
  // const showDistance = await acc.showDistance(req.body.gps, extracted, 4, 5)
  // console.log(showDistance);
  // console.log('--------------------------------------------------');
  // // ------------------------------------------------------------------------
  const testModel = await ml.init(req.body.normal);
  const testBraking = await ml.init(req.body.braking);
  console.log(testModel);
  console.log(testBraking);
  // console.log('--------------------------------------------------');
  // // dataset.push(testModel)
  // // ------------------------------------------------------------------------
  // const overSpeed = await speed.calculateSpeed(req.body.gps, 1)
  // return res.json()
});

function writeCSV(data) {
  data = data[0][0];
  let file = ''
  for(const each of data) {
    file += each;
    file += '\n'
  };
  fs.writeFile('my.csv', file, (err) => {
    if (err) throw err;
    console.log('my.csv saved.');
  });
}

const server = https.createServer(httpsOptions, app)
app.use(express.static('files'));
// server.addListener('upgrade',  (req, res, head) => console.log('UPGRADE:', req.url));
server.listen(port, () => {
  console.log('server running at ' + port)
})
