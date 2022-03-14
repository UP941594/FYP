import uuid from 'uuid-random';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';


async function init() {
  const runDatabase = await open({ filename: './database.sqlite', driver: sqlite3.Database });
  await runDatabase.migrate({ migrationsPath: './migrations-sqlite' });
  return runDatabase;
}

export async function getDetails(table) {
  const db = await init();
  const get = await db.all(`Select * FROM ${table}`);
  return get;
}

export async function addUserAccount(user) {
  const db = await init();
  user.id = uuid();
  await db.run('INSERT INTO User VALUES (?,?,?,?,?)', [user.id, user.name, user.username, user.course, user.join_date]);
  return getDetails('User');
}

export async function getDayJourney( userId, date) {
  const db = await init();
  let days = 0
  if(date === 'monthly' || date === 'weekly') {
    if(date === 'monthly') { days = 4 }
    if(date === 'weekly') { days = 1 }
    const monthBefore = (new Date(Date.now() - (604800000*days)).toISOString()).split('T')[0]
    const today = (new Date().toISOString()).split('T')[0]
    return {
      maneuver: await db.all(`Select * FROM Maneuver WHERE userId = ? AND eventDate >= ? AND eventDate <= ?`, [userId, monthBefore, today]),
      braking: await db.all(`Select * FROM Braking WHERE userId = ? AND eventDate >= ? AND eventDate <= ?`, [userId, monthBefore, today]),
      acceleration: await db.all(`Select * FROM Acceleration WHERE userId = ? AND eventDate >= ? AND eventDate <= ?`, [userId, monthBefore, today]),
      overspeeding: await db.all(`Select * FROM Overspeeding WHERE userId = ? AND eventDate >= ? AND eventDate <= ?`, [userId, monthBefore, today])
    }
  }
  return {
    maneuver: await db.all(`Select * FROM Maneuver WHERE userId = ? AND eventDate = ?`, [userId, date]),
    braking: await db.all(`Select * FROM Braking WHERE userId = ? AND eventDate = ?`, [userId, date]),
    acceleration: await db.all(`Select * FROM Acceleration WHERE userId = ? AND eventDate = ?`, [userId, date]),
    overspeeding: await db.all(`Select * FROM Overspeeding WHERE userId = ? AND eventDate = ?`, [userId, date])
  }
}

// export async function testing() {
//   const db = await init();
//   const get = await db.all(`Select * FROM Maneuver WHERE userId = ? AND eventDate >= ? AND eventDate <= ?`, ['abcd', '2022-02-12', '2022-03-13'])
//   return get
// }



export async function storeJourney(journey) {
  const db = await init();
  journey.eventId = uuid();
  console.log(journey.eventDate);
  if(journey.maneuver.length > 0) {
    for(const each of journey.maneuver) {
      await db.run('INSERT INTO Maneuver VALUES (?,?,?,?,?)', [journey.eventId, journey.userId, each.eventType, each.eventLevel, journey.eventDate]);
    }
  }
  if(journey.braking.length > 0) {
    for(const each of journey.braking) {
      await db.run('INSERT INTO Braking VALUES (?,?,?,?,?)', [journey.eventId, journey.userId, each.eventType, each.eventLevel, journey.eventDate]);
    }
  }
  if(journey.acceleration.length > 0) {
    for(const each of journey.acceleration) {
      await db.run('INSERT INTO Acceleration VALUES (?,?,?,?,?)', [journey.eventId, journey.userId, each.speed, each.time, journey.eventDate]);
    }
  }
  if(journey.overspeeding.length > 0) {
    for(const each of journey.overspeeding) {
      await db.run('INSERT INTO Overspeeding VALUES (?,?,?,?,?,?)', [journey.eventId, journey.userId, each.roadName, each.roadSpeed, each.yourSpeed, journey.eventDate]);
    }
  }
  return getDetails('Maneuver')
}
