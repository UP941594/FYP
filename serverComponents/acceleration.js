import haversine from 'haversine';

// REMOVES VARIED VALUES WHILE THE CAR IS AT REST
// FOCUSES ON CONSTANT VALUES TO GET ACCELERATION
export function extractGPSlocations(listOfCoordinates, val) {
  const newCoor = []
  listOfCoordinates.forEach((item, i) => {
    if(listOfCoordinates[i+1]) {
      // console.log(reduceNumber(item.lat, val), reduceNumber(listOfCoordinates[i+1].lat, val));
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
  extractedCoords = removeDuplicates(extractedCoords);
    extractedCoords.forEach((coor) => {
      const res = allCoords.find(item => {
        return item.time === coor.time + secs
      })
      if(res !== undefined) {
        // const all = findTheirDistance(coor, res, allCoords, secs);
        // console.log(all);
        // console.log('*******************************************************');
        let [start, end] = [{latitude: coor.lat, longitude: coor.lon}, {latitude: res.lat, longitude: res.lon}];
        const acc = haversine(start, end, {unit: 'mile'}) * (3600/secs);
        if(acc > limit) {
          allAcceleration.push({speed: (acc).toFixed(2) + ' mph', time: res.time});
        }
      } else {
        // console.log('NOT ', coor);
      }
    });
    return allAcceleration
}

// function findTheirDistance(coord, res, allCoords, secs) {
//   let max1 = (Math.ceil(coord.index/60))*60;
//   let min1 = max1-60;
//   let max2 = (Math.ceil(allCoords.indexOf(res)/60))*60;
//   let min2 = max2-60;
//   console.log(min1, max1, min2, max2);
//   const result =  [];
//   for(let i=0; i<60; i++) {
//     if(allCoords[i+min2]) {
//       let [start, end] = [{latitude: allCoords[i+min1].lat, longitude: allCoords[i+min1].lon}, {latitude: allCoords[i+min2].lat, longitude: allCoords[i+min2].lon}];
//       const acc = haversine(start, end, {unit: 'mile'}) * (3600/secs);
//       result.push(acc)
//     }
//   }
//   const sum = (result.reduce((a,b) => { return a + b }, 0))/result.length;
//   console.log('AVERAGE: ', sum);
//   return result
// }
//
function removeDuplicates(coords) {
  let num = 60
  for (let i = 0; i < coords.length; i++) {
    let coord = coords[i]
    if(coords[i+1]){
      if(coords[i+1].index < num) {
        coords.splice(i, 1);
        i = i-1
      }
      if(coords[i+1].index > num) {
        num = (Math.ceil(coords[i+1].index/60))*60
      }
    }
  };
  return coords
}
