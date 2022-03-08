import haversine from 'haversine';

// FOCUS ON MULTIPLE INTERVALS BECAUSE CAR COULD STOP AND ACCELRRATE MANY TIMES DURING A JOURNEY
export function showDistance(allCoords, extractedCoords, secs, limit) {
  const allAcceleration = []
    extractedCoords.forEach((coor) => {
      const res = allCoords.find(item => {
        return item.time === coor.time + secs
      })
      if(res !== undefined) {
        let [start, end] = [{latitude: coor.lat, longitude: coor.lon}, {latitude: res.lat, longitude: res.lon}];
        const acc = haversine(start, end, {unit: 'mile'}) * (3600/secs);
        if(acc > limit) {
          allAcceleration.push({accSpeed: acc, time: res.time});
        }
      }
    });
    return allAcceleration
}

// REMOVES CONSTANT VALUES WHILE THE CAR IS AT REST
// FOCUSES ON VARIED VALUES TO GET ACCELERATION
export function extractGPSlocations(listOfCoordinates, val) {
  // console.log('len: ', listOfCoordinates.length);
  const newCoor = []
  listOfCoordinates.forEach((item, i) => {
    if(listOfCoordinates[i+1]) {
      if(reduceNumber(item.lat, val) !== reduceNumber(listOfCoordinates[i+1].lat, val) || reduceNumber(item.lon, val) !== reduceNumber(listOfCoordinates[i+1].lon, val)) {
        item.index = i
        newCoor.push(item)
      }
    }
  });
    // console.log('len: ', newCoor.length);
  return newCoor
}


function reduceNumber(num, threshold) {
  const int = (num + '').split('.');
  return int[0] + '.' +  int[1].slice(0,threshold);
}
