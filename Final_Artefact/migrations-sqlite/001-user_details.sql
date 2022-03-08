-- Up

CREATE TABLE User (
  id NOT NULL PRIMARY KEY,
  name NOT NULL,
  username NOT NULL,
  university NOT NULL,
  course NOT NULL,
  joindate NOT NULL,
  points
);

CREATE TABLE File (
  id NOT NULL PRIMARY KEY,
  user_id NOT NULL,
  name NOT NULL,
  sharedWithPeers,
  joindate NOT NULL,
  secs NOT NULL
);

-- Down
