// npm run test
// npm test -- --coverage
import * as acc from '../serverComponents/acceleration.js';
import * as accTestData from '../testingData/accTestData.js';

describe('Acceleration functions testing', () => {
  test('Extracted GPS coords to be bigger than 0 ', () => {
    const extractedCoords = acc.extractGPSlocations(accTestData.gpsData(),6);
    expect(extractedCoords.length).toBeGreaterThan(1);
  });

  test('Same extracted coords to be 0 ', () => {
    const extractedCoords = acc.extractGPSlocations(accTestData.sameGpsData(),6);
    expect(extractedCoords.length).toBe(0);
  });

  test('Empty extracted coords to be 0 ', () => {
    const extractedCoords = acc.extractGPSlocations([],6);
    expect(extractedCoords).toHaveLength(0);
  });

  test('Reduce coords value', () => {
    const latitude = -1.325688745;
    expect(acc.reduceNumber(latitude,6)).toBe('-1.325688')
  });
// TESTED ON COORDS EXTRACTED FROM GOOGLE MAP AND RETURNED EXPECTED RESULTS
// COORDS CAN FOUND IN accTestData.js file in testingData
  test('Find distance of present extracted coords', () => {
    const extractedCoords = acc.extractGPSlocations(accTestData.realgpsData(),6);
    const allCoords = accTestData.realgpsData();
    const seconds = 4;
    const accLimit = 55;
    expect(acc.showDistance(allCoords, extractedCoords, seconds, accLimit)).toEqual(
      [{speed: "59.71 mph", time: 1648553167}]
    )
  })
})
