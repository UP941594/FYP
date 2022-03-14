const overallRating = document.querySelector('.overallRating');
const overspeeding = document.querySelector('.overspeeding');
const acceleration = document.querySelector('.acceleration');
const maneuver = document.querySelector('.maneuver');
const braking = document.querySelector('.braking');
const date = document.querySelector('#date');
const logout = document.querySelector('#loginLink');
const selectJourney = document.querySelector('#selectJourney');
const emojis = [['Emoji', 'Rating Score', 'User Mood'],['😠',1,  'Very unsatisfied'],['😦',2, 'Unsatisfied'],['😑',3, 'Neutral'],['😀',4, 'Satisfied'],['😍',5, 'Very satisfied']];
const speedData = [['Road name', 'Road speed', 'Your speed']]
const accData = [['Number', 'Acc speed', 'Time']]
const maneuverData = [['Event Type', 'Aggression', 'Date']];
const brakeData = [['Event Type', 'Aggression', 'Date']];

const currentUser = JSON.parse(localStorage.getItem('user'));
const userId = currentUser.id;

async function getCurrentUser() {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    for (const user of users) {
      if (user.id === currentUser.id) {
        return user;
      }
    }
  }
}

async function goingOverPages() {
  if (!JSON.parse(localStorage.getItem('user'))) {
    window.location.href = '/';
  }
  const user = await getCurrentUser();
  logout.addEventListener('click', () => {
      window.location = '/';
  });
}

goingOverPages()

date.addEventListener('change', getData)

async function getData(e) {
    let response;
    let data;
    if(e) {
      if(e.target.type === 'date') {
        response = await fetch(`${userId}/${date.value}`);
        if(response.ok) { data = await response.json()}
      }
      if(e.target.type === 'select-one') {
        response = await fetch(`${userId}/${selectJourney.value}`);
        if(response.ok) { data = await response.json()}
      }
    } else {
      response = await fetch(`${userId}/${date.value}`);
      if(response.ok) { data = await response.json()}
    }
    // console.log(e);
    extractDataIntoArrays(data)
}


selectJourney.addEventListener('change', getData)

function extractDataIntoArrays(journeyEvents) {
  [speedData.length, accData.length, maneuverData.length, brakeData.length] = [1,1,1,1];
  if(journeyEvents.acceleration.length > 0) {
    journeyEvents.acceleration.forEach((acc, i) => {
      //String(new Date(acc.eventTime)).split(' ')[4]]
      accData.push([i+1, acc.speed, String(acc.eventDate)])
    });
  }
  if(journeyEvents.overspeeding.length > 0) {
    journeyEvents.overspeeding.forEach((each, i) => {
      speedData.push([each.roadName, each.roadSpeed, each.yourSpeed])
    });
  }
  if(journeyEvents.maneuver.length > 0) {
    journeyEvents.maneuver.forEach((each, i) => {
      maneuverData.push([each.eventType, each.aggression + '%', each.eventDate])
    });
  }
  if(journeyEvents.braking.length > 0) {
    journeyEvents.braking.forEach((each, i) => {
      const d = each.eventDate
      maneuverData.push([each.eventType, each.aggression + '%', each.eventDate])
    });
  };
  showResults();
  // ARG1: MIN overSpeed ARG2: MIN acc to target
  showOverallRating(10, 10);
}

function showOverallRating(minOverspeed, minAcc) {
  let totalSpeeds = 1;
  let totalAcc = 1;
  let totalManeuver = 1;
  let totalBraking = 1;
  for(const interval of speedData) {
    if(Number(interval[1].split(' ')[0])) {
      const roadSpeed = Number(interval[1].split(' ')[0]);
      const yourSpeed = Number(interval[2].split(' ')[0]);
      if((roadSpeed - yourSpeed) > minOverspeed) {
        totalSpeeds++
      }
    }
  }
  let speedPercentage = (((totalSpeeds/speedData.length)*1)/2).toFixed(1)
  // if(speedData.length === 1) { speedPercentage = 5 }
  // console.log(speedPercentage,speedData.length, totalSpeeds);
  ///////////////////////////////////////////
  for(const interval of accData) {
    if(Number(interval[1].split(' ')[0])) {
      const yourSpeed = Number(interval[1].split(' ')[0]);
      if(yourSpeed > minAcc) {
        totalAcc++
      }
    }
  }
  let accPercentage = (((totalAcc/accData.length)*1)/2).toFixed(1)
  // if(accData.length === 1) { accPercentage = 5 }
  // console.log(accPercentage,  accData.length, totalAcc);
  ///////////////////////////////////////
  for(const interval of maneuverData) {
    if(interval[0] !== 'NON AGGRESSIVE' && interval[0] !== 'Event Type') {
      totalManeuver++
    }
  }
  let maneuverPercentage = (((totalManeuver/maneuverData.length)*1)/2).toFixed(1)
  // if(maneuverData.length === 1) { maneuverPercentage = 5 }
  // console.log(maneuverPercentage, maneuverData.length, totalManeuver);
  //////////////////////////
  for(const interval of brakeData) {
    if(interval[0] !== 'NON AGGRESSIVE' && interval[0] !== 'Event Type') {
      totalBraking++
    }
  }
  let brakingPercentage = (((totalBraking/brakeData.length)*1)/2).toFixed(1)
  // if(brakeData.length === 1) { brakingPercentage = 5 }
  // console.log(brakingPercentage, brakeData.length, totalBraking);
  const totalScore =  (+speedPercentage + +accPercentage + +maneuverPercentage + +brakingPercentage) / 0.4;
  console.log(totalScore);
  if(overallRating.childNodes[1]) {
    overallRating.childNodes[Math.round(totalScore)].style.backgroundColor = '#B5FFC9';
  }
}

function eventResults(events, div) {
  div.textContent = '';
  events.forEach((e, index) => {
    createDiv(e[0], e[1], e[2], div)
  });
  if(events.length === 1) {div.textContent = 'NO RESUTS FOUND'}
}

function createDiv(emoji, score, text, mainDiv) {
  const div = document.createElement('div');
  div.className = 'rating';
  div.innerHTML = `
    <span class="emoji">${emoji}</span>
    <span class="score">${score}</span>
    <span class="text">${text}</span>
    `
  mainDiv.appendChild(div)
}


function showHide(elem, elem1) {
  let visible = false
  elem.addEventListener('click', () => {
    if(visible === true) {
      elem1.style.display = 'none';
      elem.style.backgroundColor = 'white'
      visible = false
    } else {
      elem1.style.display = 'block';
      elem.style.backgroundColor = '#E4F0FF'
      visible = true
    }
  })
};

function showResults() {
  if(speedData.length === 1 && accData.length === 1 && speedData.length === 1 && maneuverData.length === 1) {
    eventResults([['Emoji', 'Rating Score', 'User Mood']], overallRating);
  } else {
    eventResults(emojis, overallRating);
  }
  eventResults(speedData, overspeeding);
  eventResults(accData, acceleration);
  eventResults(maneuverData, maneuver);
  eventResults(brakeData, braking)
}

function init() {
  showHide(document.querySelector('.eventlabel'), overallRating);
  showHide(document.querySelector('#speed'), overspeeding);
  showHide(document.querySelector('#acc'), acceleration);
  showHide(document.querySelector('#turning'), maneuver);
  showHide(document.querySelector('#brake'), braking);
}

init()

window.onload = () => {
  date.value = new Date().toISOString().split('T')[0]
  getData();
}
