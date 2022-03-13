const overallRating = document.querySelector('.overallRating');
const overspeeding = document.querySelector('.overspeeding');
const acceleration = document.querySelector('.acceleration');
const maneuver = document.querySelector('.maneuver');
const braking = document.querySelector('.braking');
const date = document.querySelector('#date');
const selectJourney = document.querySelector('#selectJourney');
const emojis = [['Emoji', 'Rating Score', 'User Mood'],['😠',1,  'Very unsatisfied'],['😦',2, 'Unsatisfied'],['😑',3, 'Neutral'],['😀',4, 'Satisfied'],['😍',5, 'Very satisfied']];
const speedData = [['Road name', 'Road speed', 'Your speed']]
const accData = [['Number', 'Acc speed', 'Time']]
const maneuverData = [['Event Type', 'Aggression', 'Date']];
const brakeData = [['Event Type', 'Aggression', 'Date']];

//new Date(1646818176000);
const userId = 'abcd'

date.addEventListener('change', getData)

async function getData() {
    const response = await fetch(`${userId}/${date.value}`);
    const data = await response.json();
    extractDataIntoArrays(data)
}

selectJourney.addEventListener('change', async (e) => {
  const response = await fetch(`${userId}/${selectJourney.value}`);
  const data = await response.json();
  extractDataIntoArrays(data)
})

function extractDataIntoArrays(journeyEvents) {
  console.log(journeyEvents);
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
  showResults()
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
  eventResults(emojis, overallRating);
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
