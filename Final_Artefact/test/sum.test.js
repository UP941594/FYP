// npm run test
// npm test -- --coverage
import * as acc from '../serverComponents/acceleration.js';

test('retuns new coords', () => {
  expect(acc.extractGPSlocations([],1)).toStrictEqual([])
})


test('reduce coords value', () => {
  let num = -1.325688745
  expect(acc.reduceNumber(num,6)).toBe('-1.325688')
})
