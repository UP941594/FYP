import fs from 'fs';
import fetch from 'node-fetch';
import haversine from 'haversine';

// CHANGES TO MAKE
// 1. findSpeedIntervals function copy from data.js for real testing;
// 2. matchSingleRoadSpeed function needs less than road speed not bigger;
// 3. getallRoads function should get called frequently
// 4. yourSpeed: (eachRoad[0].speed) + ' mph', use tofixed()


// FIRST PARAM = ALL COLLECTED GPS COORDINATES DURING JOURNEY
// TIME BETWEEN SPEED CHECKING = FOR EX. CHECK SPEED EVERY 4 SECONDS
// THIRD PARAM = MIN SPEED TO TARGET = IF DRIVER EXCEEDS 30mph THEN WE CHECK ROAD SPEED LIMIT
export function findSpeedIntervals(coords, secs, minSpeed) {
  const exceededIntervals = [];
  // if(coords.length > 120) {
  if(coords.length > 2) {
    // for (let i = 0; i < coords.length; i=i+secs*60) {
    for (let i = 0; i < coords.length; i++) {
        if(coords[i+1]) {
          let [start, end] = [{latitude: coords[i].lat, longitude: coords[i].lon}, {latitude: coords[i+1].lat, longitude: coords[i+1].lon}];
          let calculatedSpeed =  haversine(start, end, {unit: 'mile'}) * (3600/secs);
          if(calculatedSpeed > minSpeed) {
            const obj = [{lat: coords[i].lat, lon: coords[i].lon, time: coords[i].time, speed: calculatedSpeed},
                         {lat: coords[i+1].lat, lon: coords[i+1].lon, time: coords[i+1].time, speed: calculatedSpeed}]
            exceededIntervals.push(obj)
          }
        }
    }
  }
  return exceededIntervals
}

// https://nominatim.openstreetmap.org/reverse?format=json&lat=50.911286384041006&lon=-1.392990182470244&zoom=18&addressdetails=1
// https://www.overpass-api.de/api/interpreter?data=[out:json];way(around:2000,50.79247155933518,-1.1011859610339103)[maxspeed];out;

// THIS FUNCTION IS USED TO SAVE ALL NEARBY ROADS DATA INTO JSON
export async function getallRoads([radius, lat, lon]) {
  const response = await fetch(`https://www.overpass-api.de/api/interpreter?data=[out:json];way(around:${radius},${lat},${lon})[maxspeed];out;`);
  const data = await response.json();
  fs.writeFile("allRoads.json", JSON.stringify(data), function(err, result) {
      if(err) console.log('error', err);
  });
  return data
}

// getallRoads([2000, 50.89885580678837,-1.3892447980722])

export async function getsingleRoad(lat, lon) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
    if(response.ok) {
      const data = await response.json();
      return data
    }
    return null
}
// FINDS SMALL AND BIG LAT&LONG TO GET THE RADIUS
// THE RADIUS IS USED TO FETCH ALL ROADS WITHIN GIVEN RADIUS && RETURN MID LAT&LON FOR USE
export function findMaxRadius(coords) {
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

export async function calculateSpeed(coords, seconds) {
  // STORES ALL RELEVANT ROADS INTO ARRAY FOR OVER-SPEEDING MEASUREMENT
  const allIntervals = [];
  if(coords.length > 0) {
    // const allRoadsData = await getallRoads(findMaxRadius(coords));
    function fileContent(path, format) {
      return new Promise(function (resolve, reject) {
        fs.readFile(path, format, function(error, contents) {
          if (error) reject(error);
          else resolve(contents);
        });
      });
    }
    let allRoadsData = JSON.parse(await fileContent('allRoads.json', 'utf8'));
    // console.log('ALL ROADS: ' + allRoadsData.elements.length);
    const exceededIntervals = await findSpeedIntervals(coords, seconds, 0);
    if(exceededIntervals.length > 0) {
      // console.log('EXCEEDED: ' + exceededIntervals.length);
      for(const each of exceededIntervals) {
        const eachRoadCalculation = await matchSingleRoadSpeed(allRoadsData, each);
        if(eachRoadCalculation !== undefined) {
          allIntervals.push(eachRoadCalculation)
        }
      }
    }
  }
  return allIntervals
}

// THIS FUNCTION GET EXCEEDED SPEED ROADS
// IF USER SPEED IS BIGGER THAN ROAD SPEED
async function matchSingleRoadSpeed(allroads, eachRoad) {
  const firstRoad =  await getsingleRoad(eachRoad[0].lat, eachRoad[0].lon);
  const secRoad = await getsingleRoad(eachRoad[1].lat, eachRoad[1].lon);
    if(firstRoad || secRoad) {
    const res1 = allroads.elements.map((roads) => {
      return roads.tags
    }).find(road => road.name === firstRoad.address.road);
    const res2 = allroads.elements.map((roads) => {
      return roads.tags
    }).find(road => road.name === secRoad.address.road);
    if(res1 && res2 ) {
      if(res1.maxspeed === res2.maxspeed) {
        const speed = Number(res1.maxspeed.split(' ')[0]);
        if(speed < eachRoad[0].speed) {
          // SPEED EXCEEDED
          return {
            roadName: res1.name,
            roadSpeed: res1.maxspeed,
            yourSpeed: (eachRoad[0].speed).toFixed(2) + ' mph',
            time: eachRoad[0].time
          }
        }
      }
      // else {
      //    console.log('IGNORE CUZ BOTH ROADS SPEED NOT AVAILABLE IN DATABASE');
      // }
    }
    // else {
    //    console.log('TRAVELLED ON 2 ROADS SO CANNNOT CALCULATE');
    // }
  }
  return
}
