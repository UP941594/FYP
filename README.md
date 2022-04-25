# Measuring Driving Behaviour Using Phone Sensors and API’s

This mobile website allows car drivers to measure their driving behaviours using mobile devices. 

## HOW TO START WEBSITE IN COMMAND PROMPT

1. ```npm install```
2. ```npm install @tensorflow/tfjs-node```
3. ```npm rebuild \n npm i sqlite3```
4. ```npm start```


## KEY FEATURES

### Main Page (index.html)

Users:

* shall sign up using their full name, username and by choosing preferable car.
* shall login using existed account details.

Note: User cannot get access to any other features in the web app without completing the listed tasks above.

### Measuring Driving Behaviour Page (monitor.html)

Users:

* can start measuring their driving behaviour by clicking on "START" button.
* will be asked to provide access to motion and location sensors to previous point.
* will be asked to follow provided instructions.
* can stop monitoring their behaviour.

### Viewing Driving Behaviour Results

Users:

* can view their overall journey scores.
* can view daily, weekly and monthly driving results.
* can view four driving behaviour results such as rapid acceleration, harsh braking, dangerous maneuverers, and over-speeding.
