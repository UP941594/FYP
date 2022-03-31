import haversine from 'haversine';

// REMOVES VARIED VALUES WHILE THE CAR IS AT REST
// FOCUSES ON CONSTANT VALUES TO GET ACCELERATION
export function extractGPSlocations(listOfCoordinates, val) {
  const newCoor = []
  listOfCoordinates.forEach((item, i) => {
    if(listOfCoordinates[i+1]) {
      if(reduceNumber(item.lat, val) !== reduceNumber(listOfCoordinates[i+1].lat, val) ||
         reduceNumber(item.lon, val) !== reduceNumber(listOfCoordinates[i+1].lon, val)) {
        item.index = i
        newCoor.push(item)
      }
    }
  });
  return newCoor
}


export function reduceNumber(num, threshold) {
  const int = (num + '').split('.');
  return int[0] + '.' +  int[1].slice(0,threshold);
}

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
          allAcceleration.push({speed: (acc).toFixed(2) + ' mph', time: res.time});
        }
      } else {
        console.log('NOT ', coor);
      }
    });
    return allAcceleration
}
