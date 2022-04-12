-- Up

CREATE TABLE User (
  userId NOT NULL PRIMARY KEY,
  name NOT NULL,
  username NOT NULL,
  course NOT NULL,
  joindate NOT NULL
);

CREATE TABLE Maneuver (
  eventId NOT NULL,
  userId NOT NULL,
  eventType,
  aggression,
  eventDate
);

CREATE TABLE Braking (
  eventId NOT NULL,
  userId NOT NULL,
  eventType,
  aggression,
  eventDate
);

CREATE TABLE Acceleration (
  eventId NOT NULL,
  userId NOT NULL,
  speed,
  eventTime,
  eventDate
);

CREATE TABLE Overspeeding (
  eventId NOT NULL,
  userId NOT NULL,
  roadName,
  roadSpeed,
  yourSpeed,
  eventDate
);

-- Down
