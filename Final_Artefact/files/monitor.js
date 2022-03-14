const button = document.querySelector('#ss');
const measuringState = document.querySelector('#measuringState');
const logout = document.querySelector('#loginLink');
let measuring = false;
let [deviceMotion, location] = [false, false];
let int,interval;
const allEvents = [];
const brakeEvents = [];
const gpsEvents = [];
let counter = 1;
let userState = false;

function detectMobile() {
  const matchingMobile = [/iPhone/i, /iPad/i, /iPod/i];
  return matchingMobile.some(each => navigator.userAgent.match(each))
}

const currentUser = JSON.parse(localStorage.getItem('user'));

async function getCurrentUser() {
  const response = await fetch('/users');
  if (response.ok) {
    const users = await response.json();
    for (const user of users) {
      if (user.id === currentUser.id) {
        userState = true
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
//App-prefs://prefs:root=Settings
async function getPermission() {
  // document.location.href = "App-prefs://prefs:root=Settings"
  const response = await DeviceMotionEvent.requestPermission();
  if(response == 'granted') {
    deviceMotion = true
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        location = true
        if(measuring === false) {
          alert('PLEASE FOLLOW THESE INSTUCTIONS: \n  \n \u2022 Do not use your mobile phone\n \u2022 Do not move your phone\n \u2022 Avoid phone calls');
        }
        changeButtonState();
      },(err)=>{if(err){
          document.location.href = "App-prefs://prefs:root=Privacy&path=LOCATION"
          alert('Give Location Permission');
          // location = false
        }
      })
    }
  } else {
    alert('Motion Permission Denied. PLEASE Reload Safari to Start Again!')
  }
}

async function measureBehaviour() {
  if(detectMobile()) {
    await getPermission();
  } else {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        location = true
        if(measuring === false) {
          alert('PLEASE FOLLOW THESE INSTUCTIONS: \n  \n \u2022 Do not use your mobile phone\n \u2022 Do not move your phone\n \u2022 Avoid phone calls');
        }
        changeButtonState();
      },(err)=>{
        if(err){
          alert('Give Location Permission');
          location = false
      }})
    }
  }
}

const accMain = document.querySelector('.accMain');
const gyroMain = document.querySelector('.gyroMain');
const gpsMain = document.querySelector('.gpsMain');
const timer = document.querySelector('#timer');
const results = document.querySelector('.results')


// Sensor data frequency equals 60 times per second.
function sensorData(event) {
  // console.log(e);
  // MOBILE DEVICES
  if(location === true && deviceMotion === true) {
    if(measuring) {
      getGPS()
      getSensorAxis(event)
    }
  }
  // LAPTOP DEVICES FOR TESTING
  if(measuring && detectMobile() === false) {
      getGPS()
      getSensorAxis(event)
  }
}

// DISPLAYS MOTION DATA AND PUTS INTO ARRAY ==MAIN FUNCTION
function getSensorAxis(e) {
    accMain.childNodes[3].textContent = 'X: ' + e.accelerationIncludingGravity.x.toFixed(2);
    accMain.childNodes[5].textContent = 'Y: ' + e.accelerationIncludingGravity.y.toFixed(2);
    accMain.childNodes[7].textContent = 'Z: ' + e.accelerationIncludingGravity.z.toFixed(2);
    gyroMain.childNodes[3].textContent = 'X: ' + e.rotationRate.alpha.toFixed(2);
    gyroMain.childNodes[5].textContent = 'Y: ' + e.rotationRate.beta.toFixed(2);
    gyroMain.childNodes[7].textContent = 'Z: ' + e.rotationRate.gamma.toFixed(2);
    allEvents.push(e.rotationRate.beta);
    brakeEvents.push(e.accelerationIncludingGravity.y)
}
// DISPLAYS GPS DATA AND PUTS INTO ARRAY ==MAIN FUNCTION
function getGPS() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      gpsMain.childNodes[3].textContent = 'Latitude : ' + position.coords.latitude;
      gpsMain.childNodes[5].textContent = 'Longitude : ' + position.coords.longitude;
      gpsEvents.push({lat: position.coords.latitude, lon: position.coords.longitude, time: Math.round(Date.now() / 1000)})
    })
  }
}

async function changeButtonState() {
  if(!measuring) {
    button.textContent = 'STOP';
    button.style.color = 'red'
    measuringState.textContent = 'Measuring'
    measuringDisplay()
    measuring = true
    interval = setInterval(function() {
    timer.textContent = 'Timer : ' + Number(counter)
      counter += 0.5
    },500);
  } else {
    clearInterval(int);
    clearInterval(interval)
    button.textContent = 'START';
    button.style.color = 'blue'
    measuringState.textContent = 'Not measuring';
    measuring = false;
    counter = 0;
    timer.textContent = 'Timer : ' + Number(counter);
    // downloadObjectAsJson(extractEvents(allEvents), 'LeftCurve')
    const extractedEvents = modifyEvents(extractEvents(allEvents));
    const extractedBrakingEvents = modifyEvents(extractEvents(brakeEvents));
    const bothEventsType = extractedEvents.concat(extractedBrakingEvents);
    // new Date().toISOString().split('T')[0]
    const eventData = {
      userId: currentUser.id,
      eventId: undefined,
      normal: extractedEvents,
      braking: extractedBrakingEvents,
      gps: gpsEvents,
      date: new Date().toISOString().split('T')[0]
    }
    const response = await fetch('/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
      // body: JSON.stringify(bothEventsType)
    }).then(async function() {
        await showResultsUI();
        allEvents.length = 0;
        brakeEvents.length = 0;
        gpsEvents.length = 0;
    }())
  }
}
// SORTING GYROSCOPE AXIS TO ROTATIONAL SPEED NOT RATE
function modifyEvents(data) {
  return data.map((item) => {
    return [item.map((each) => {
      const per = 1000/60;
      return (each/per)/10
    }),0]
  })
}


// TURNS ALL SENSORY DATA INTO CHUNKS
function extractEvents(listOfEvents) {
  const array = Array.from(listOfEvents);
  const value = Math.floor(listOfEvents.length/236)
  console.log(value);
  Array.prototype.chunk = function ( n ) {
    if ( !this.length ) {
      return [];
    }
    return [ this.slice( 0, n ) ].concat( this.slice(n).chunk(n) );
  };
  const res = array.chunk(236);
  if(res.length > 1) {
    if(res[res.length-1].length < 236) {
      return res.slice(0,res.length-1);
    }
  }
  return res
}

const arr = [[1,2,3], [1,2]]



function measuringDisplay() {
 int = setInterval(function(){
      if(measuringState.textContent.length > 11) {
        measuringState.textContent = 'Measuring'
      } else {
        measuringState.textContent = measuringState.textContent + '.'
      }
    },1000)
}

async function showResultsUI() {
  const res = await fetch('/data');
  if(res.ok) {
    const data = await res.json();
    window.location = '/result.html'
  }
}

button.addEventListener('click', measureBehaviour);
// IOS DEVICE MOTION EVENT
window.addEventListener('devicemotion', sensorData)

/////////////////////////////////////////////////////////////////////////
function downloadObjectAsJson(exportObj, exportName){
   const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
   const downloadAnchorNode = document.createElement('a');
   downloadAnchorNode.setAttribute("href",     dataStr);
   downloadAnchorNode.setAttribute("download", exportName + ".json");
   accMain.appendChild(downloadAnchorNode); // required for firefox
   downloadAnchorNode.click();
   downloadAnchorNode.remove();
 }
