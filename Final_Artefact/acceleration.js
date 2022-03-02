import haversine from 'haversine';

// FOCUS ON MULTIPLE INTERVALS BECAUSE CAR COULD STOP AND ACCELRRATE MANY TIMES DURING A JOURNEY
  function showDistance(allCoords, extractedCoords, secs) {
    console.log(allCoords.length, extractedCoords.length);
    extractedCoords.forEach((coor) => {
      const res = allCoords.find(item => {
        return item.time === coor.time + secs
      })
      if(res !== undefined) {
        let [start, end] = [{latitude: coor.lat, longitude: coor.lon}, {latitude: res.lat, longitude: res.lon}];
        console.log(start, end);
        console.log(haversine(start, end, {unit: 'meter'}));
      }
    });
    return 'Nothing Found'
}

// REMOVES CONSTANT VALUES WHILE THE CAR IS AT REST
// FOCUSES ON VARIED VALUES TO GET ACCELERATION
function extractGPSlocations(listOfCoordinates, val) {
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
