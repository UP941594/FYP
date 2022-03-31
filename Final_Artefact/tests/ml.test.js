// npm run test
// npm test -- --coverage
// jest --verbose to see ticks and crosses

import * as ml from '../testingData/mlTestingData.js';

describe('LSMT machine learning model functions testing', () => {
  const inputData = ml.testingData;
  const targetData = ml.mlModelResults;
  inputData.forEach((drivingEvent, i) => {
      test(`EXPECTED ${targetData[i].eventType}(${targetData[i].number}) TO EQUAL ${drivingEvent[1]}`, () => {
        expect(drivingEvent[1]).toEqual(targetData[i].number);
      //   try {
      // } catch (e) {
      //   console.log('UNCALSSIFIED EVENT: ', targetData[i].eventType);
      // }
    })
  });
})
