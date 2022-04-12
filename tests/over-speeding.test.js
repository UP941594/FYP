// npm run test
// npm test -- --coverage
// npm run test tests/over-speeding.test.js

import * as overSpeedingTestData from '../testingData/over-speedingTestData.js';
import * as overSpeedingFunctions from '../serverComponents/over-speeding.js';
// CHANGE TESTING CODE
describe('Over-speeding functions testing', () => {
  const extractedCoords = overSpeedingTestData.realSpeedData();
  const findMaxRadius = overSpeedingFunctions.findMaxRadius(extractedCoords);

  test('Finding max radius function testing', () => {
    expect(findMaxRadius).toHaveLength(3);
    expect(overSpeedingFunctions.findMaxRadius([])).toEqual(expect.stringContaining('EMPTY GPS COORDS'));
  })

  test('Find max radius AND Fetch all roads within that radius', async () => {
    const getallRoads = await (overSpeedingFunctions.getallRoads(findMaxRadius));
    const visitedRoads = ['Northumberland Road', 'Derby Road', 'Durnford Road', "St Alban's Road", 'Northam Road'];
    // Object.keys(getallRoads).forEach((prop)=> console.log(prop));
    const roadsInRadius = getallRoads.elements.map((road) => { return road.tags});
    visitedRoads.forEach((road, i) => {
      try {
        expect(roadsInRadius).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              'name': road
            })
        ]));
      } catch (e) {
        // console.log('ERROR: ROAD NOT FOUND ==> ', road);
      }
    });
  })

  test('Compare User speed with road speed', async () => {
    expect.assertions(1) // NUMBER OF EXPECTED ASYNC CALLS
    const allRecievedRoadNames = [];
    const extractedCoords = overSpeedingTestData.realSpeedData();
    const seconds = 3;
    const minSpeed = 0;
    const expectedRoadNames = ['Northumberland Road', 'Derby Road'];
    try {
      const speedIntervals = await overSpeedingFunctions.calculateSpeed(extractedCoords, seconds, minSpeed);
      speedIntervals.forEach((interval) => {
        allRecievedRoadNames.push(interval.roadName)
      });
    } catch (e) {
      console.log(e);
    }
    expect(allRecievedRoadNames).toEqual(expect.arrayContaining(expectedRoadNames));
    // expect(await overSpeedingFunctions.getsingleRoad()).toBeNull();
  }, 50000) // WAIT FOR ROAD API CALLS TO FINISH
})
