// npm run test
// npm test -- --coverage
import * as acc from '../serverComponents/acceleration.js';
import * as accTestData from '../testingData/accTestData.js';

describe('Acceleration function testing', () => {
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
    expect(extractedCoords.length).toBe(0);
  });

  test('Reduce coords value', () => {
    const latitude = -1.325688745;
    expect(acc.reduceNumber(latitude,6)).toBe('-1.325688')
  });

  test('Find distance of present extracted coords', () => {
    const extractedCoords = acc.extractGPSlocations(accTestData.gpsData(),6);
    const allCoords = accTestData.gpsData();
    const seconds = 1;
    const accLimit = 0;
    expect(acc.showDistance(allCoords, extractedCoords, seconds, accLimit)).toEqual(
      {speed: 0.6 + ' mph', time: 123456}
    )
  })
})
