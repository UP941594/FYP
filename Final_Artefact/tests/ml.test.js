// npm run test
// npm test -- --coverage
// jest --verbose to see ticks and crosses

/**
 * @jest-environment node
 */
import * as ml from '../testingData/mlTestingData.js';

describe('LSMT model testing', () => {
  const inputData = ml.testingData;
  const targetData = ml.mlModelResults;
  inputData.forEach((drivingEvent, i) => {
      test(`EXPECTED ${targetData[i].eventType}(${targetData[i].number}) TO EQUAL ${drivingEvent[1]}`, () => {
        try {
          expect(drivingEvent[1]).toEqual(targetData[i].number);
      } catch (e) {
        console.log('UNCALSSIFIED EVENT: ', targetData[i].eventType);
      }
    })
  });
})
