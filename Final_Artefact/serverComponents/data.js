const coords = [
  {lat: 50.91103955234894, lon: -1.3929983279285918, time: 2},
  {lat: 50.909649385711944, lon: -1.3931970782553682, time: 12},
  {lat: 50.90942645523611, lon: -1.3938420139103491, time: 22},
  {lat: 50.91065240213824, lon: -1.3939670120732295, time: 32},
  {lat: 50.913105771137936, lon: -1.3934364362238139, time: 42}
];



function findSpeedIntervals(coords, secs, minSpeed) {
  const exceededIntervals = [];
  if(coords.length > 120) {
    for (let i = 0; i < coords.length; i=i+secs*60) {
        if(coords[i+1]) {
          let [start, end] = [{latitude: coords[i].lat, longitude: coords[i].lon}, {latitude: coords[i+1].lat, longitude: coords[i+1].lon}];
          let calculatedSpeed = haversine(start, end, {unit: 'mile'});
          if(calculatedSpeed > minSpeed) {
            exceededIntervals.push([coords[i], coords[i+1]])
          }
        }
    }
  }
  return exceededIntervals
}
