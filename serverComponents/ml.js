import tf from '@tensorflow/tfjs-node';
import smooth from 'array-smooth';

function smoothDataSet(data) {
  const allData = []
  for(const each of data) {
    const arr = each[0];
    allData.push([smooth(arr, 4),each[1]]) // 2 BEFORE
  }
  return allData
}

export function maskData(array) {
  let newArr = smoothDataSet(array);
  const big = 236
  for(let each of newArr) {
    if(each[0].length < big) {
      for(let i=each[0].length; i<big; i++) {
        each[0].push(-10)
      }
    }
    if(each[0].length > big) {
      each[0] = each[0].slice(0,big)
    }
  }
  return newArr
}
// FOR LSTM MDOEL
function turnDataIntoArrays(array) {
  let newSeq = []
  for(let each of array) {
    let arr = []
    for(let one of each[0]) {
      arr.push([one])
    }
    newSeq.push([arr, each[1]])
  }
  return newSeq
}

////// DISPLAY ONE HOT ENCODING IN REAL ARRAYS
function displayHotEnc(hotEncoding) {
  const values = hotEncoding.dataSync();
  const array = Array.from(values);
  Array.prototype.chunk = function ( n ) {
    if ( !this.length ) {
      return [];
    }
    return [ this.slice( 0, n ) ].concat( this.slice(n).chunk(n) );
  };
  const res = array.chunk(4);
  return res
}

async function testModel(test, testedData, length) {
  const model = await tf.loadLayersModel('file://./model-1a/model.json')
  let results = await model.predict(test);

  const resultsInChunks = displayHotEnc(results);
  const idenfiedEvents = [];
  const percentage = [];
  testedData.forEach((item, i) => {
    const tot = showResults(resultsInChunks[i]);
    if(tot[0] === 0) { idenfiedEvents.push({eventType: 'LEFT CURVE', eventLevel: tot[1]}) }
    if(tot[0] === 1) { idenfiedEvents.push({eventType: 'RIGHT CURVE', eventLevel: tot[1]}) }
    if(tot[0] === 2) { idenfiedEvents.push({eventType: 'NON AGGRESSIVE', eventLevel: tot[1]}) }
    if(tot[0] === 3) { idenfiedEvents.push({eventType: 'BRAKING', eventLevel: tot[1]}) }
    // console.log('ML: ' + tot, 'Expected: '+ item[1]);
    // console.log('ML: ' + tot);
    percentage.push(tot + '' +  item[1])
  });
  const success = showPercentage(percentage, length);
  return idenfiedEvents
}


function showResults(res) {
  const result = res.map(each => each * 100);
  const max = Math.max(...result)
  return [result.indexOf(max), Number(max.toFixed(1))]
}

function showPercentage(perc, len) {
  let counter = 0;
  for(const each of perc) {
    if(each[0] == each[1]) {counter++};
  }
  return (counter/len) * 100
}

export async function init(testingData) {
  const testData = await maskData(testingData);
  let testingSequences = [];
  const dataTest =  await turnDataIntoArrays(testData)
  for(const each of dataTest) {
    testingSequences.push(each[0])
  }
  const xsTest = await tf.tensor3d(testingSequences);
  const results = await testModel(xsTest, testData, testingData.length);
  return results
}
