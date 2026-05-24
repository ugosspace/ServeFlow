// ServeFlow — SQLite Database Setup & Seed (node-sqlite3-wasm)
// ============================================
'use strict';

const { Database } = require('node-sqlite3-wasm');
const path = require('path');

const DB_PATH = path.join(__dirname, 'serveflow.db');
const db = new Database(DB_PATH);

// Enable WAL mode & foreign keys (exec instead of pragma())
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// ---- Transaction helper (replaces db.transaction()) ----
function runTransaction(fn) {
  db.exec('BEGIN');
  try {
    fn();
    db.exec('COMMIT');
  } catch (e) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    throw e;
  }
}

// ============================================================
// SCHEMA
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS workers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL,
    dept       TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'Member',
    status     TEXT NOT NULL DEFAULT 'active',
    att        INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id  INTEGER NOT NULL REFERENCES workers(id),
    service    TEXT NOT NULL,
    status     TEXT NOT NULL CHECK(status IN ('present','absent','late','excused')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(worker_id, service)
  );

  CREATE TABLE IF NOT EXISTS replacements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id  INTEGER REFERENCES workers(id),
    name       TEXT NOT NULL,
    dept       TEXT NOT NULL,
    service    TEXT NOT NULL,
    reason     TEXT NOT NULL,
    submitted  TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    worker     TEXT NOT NULL,
    type       TEXT NOT NULL,
    channel    TEXT NOT NULL,
    sent       TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'sent',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    dept       TEXT NOT NULL,
    slot_index INTEGER NOT NULL,
    workers    TEXT NOT NULL,
    week_label TEXT NOT NULL DEFAULT 'April 2025'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT NOT NULL,
    icon       TEXT NOT NULL,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL,
    time_label TEXT NOT NULL,
    unread     INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ref        TEXT NOT NULL UNIQUE,
    plan       TEXT NOT NULL,
    billing    TEXT NOT NULL,
    amount     REAL NOT NULL,
    channel    TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'paid',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ============================================================
// SEED (only if tables are empty)
// ============================================================
function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM workers').get().c;
  if (count > 0) return;

  console.log('[DB] Seeding initial data...');

  // Departments
  const depts = [
    'Ushers','Media Team','Choir','Protocol',
    'Prayer Unit','Security',"Children's Church",'Technical Team'
  ];
  const insertDept = db.prepare('INSERT OR IGNORE INTO departments (name) VALUES (?)');
  runTransaction(() => {
    depts.forEach(d => { insertDept.run(d); });
  });
  insertDept.finalize();

  // Workers — using positional ? params
  const workers = [
    ['Adaeze Okonkwo',   '08012345001', 'Ushers',            'Team Lead',      'active',   94],
    ['Tunde Balogun',    '08012345002', 'Media Team',        'Director',       'active',   88],
    ['Grace Emeka',      '08012345003', 'Choir',             'Member',         'active',   72],
    ['Samuel Dike',      '08012345004', 'Protocol',          'Team Lead',      'active',   97],
    ['Ngozi Eze',        '08012345005', 'Prayer Unit',       'Member',         'active',   85],
    ['Emeka Obi',        '08012345006', 'Security',          'Coordinator',    'active',   91],
    ['Chisom Nwosu',     '08012345007', "Children's Church", 'Teacher',        'active',   78],
    ['David Afolabi',    '08012345008', 'Technical Team',    'Sound Engineer', 'active',   95],
    ['Ruth Adeleke',     '08012345009', 'Ushers',            'Member',         'inactive', 42],
    ['Joseph Taiwo',     '08012345010', 'Choir',             'Tenor',          'active',   80],
    ['Peace Okoro',      '08012345011', 'Media Team',        'Graphics',       'active',   87],
    ['Blessing Uche',    '08012345012', 'Protocol',          'Member',         'active',   66],
  ];
  const insertWorker = db.prepare(
    'INSERT INTO workers (name, phone, dept, role, status, att) VALUES (?, ?, ?, ?, ?, ?)'
  );
  runTransaction(() => {
    workers.forEach(w => insertWorker.run(w));
  });
  insertWorker.finalize();

  // Replacements
  const replacements = [
    ['Grace Emeka',   'Choir',    'Sunday 27 Apr — 1st Service', 'Family emergency',      '24 Apr 2025', 'pending'],
    ['Ruth Adeleke',  'Ushers',   'Sunday 27 Apr — 2nd Service', 'Traveling out of state', '23 Apr 2025', 'pending'],
    ['Blessing Uche', 'Protocol', 'Friday 25 Apr — Prayer',      'Work commitment',        '22 Apr 2025', 'pending'],
    ['Joseph Taiwo',  'Choir',    'Friday 18 Apr — Prayer',      'Sick leave',             '15 Apr 2025', 'approved'],
  ];
  const insertRepl = db.prepare(
    'INSERT INTO replacements (name, dept, service, reason, submitted, status) VALUES (?, ?, ?, ?, ?, ?)'
  );
  runTransaction(() => {
    replacements.forEach(r => insertRepl.run(r));
  });
  insertRepl.finalize();

  // Reminders
  const reminders = [
    ['Adaeze Okonkwo', '2-Day Reminder',    'WhatsApp', '24 Apr, 8:00 AM', 'sent'],
    ['Tunde Balogun',  '2-Day Reminder',    'WhatsApp', '24 Apr, 8:00 AM', 'sent'],
    ['Samuel Dike',    '2-Day Reminder',    'WhatsApp', '24 Apr, 8:01 AM', 'sent'],
    ['Emeka Obi',      '2-Day Reminder',    'SMS',      '24 Apr, 8:01 AM', 'sent'],
    ['Grace Emeka',    'Replacement Notice','WhatsApp', '24 Apr, 9:15 AM', 'sent'],
    ['Ruth Adeleke',   '2-Day Reminder',    'WhatsApp', '24 Apr, 8:02 AM', 'failed'],
    ['David Afolabi',  '2-Day Reminder',    'WhatsApp', '24 Apr, 8:02 AM', 'sent'],
  ];
  const insertReminder = db.prepare(
    'INSERT INTO reminders (worker, type, channel, sent, status) VALUES (?, ?, ?, ?, ?)'
  );
  runTransaction(() => {
    reminders.forEach(r => insertReminder.run(r));
  });
  insertReminder.finalize();

  // Schedule
  const schedule = [
    { dept:'Ushers',             slots:[['Adaeze O.','Chidinma A.'],['—'],['—'],['Ruth A.','Peace C.'],['Samuel I.']] },
    { dept:'Choir',              slots:[['Grace E.','John M.'],['—'],['Choir Night'],['—'],['Grace E.']] },
    { dept:'Media Team',         slots:[['Tunde B.'],['—'],['—'],['Peace O.'],['Tunde B.']] },
    { dept:'Protocol',           slots:[['Samuel D.'],['—'],['—'],['Blessing U.'],['Samuel D.']] },
    { dept:'Prayer Unit',        slots:[['Ngozi E.'],['—'],['Prayer mtg'],['Ngozi E.'],['—']] },
    { dept:'Technical Team',     slots:[['David A.'],['—'],['—'],['David A.'],['David A.']] },
    { dept:"Children's Church",  slots:[['Chisom N.'],['—'],['—'],['—'],['Chisom N.']] },
  ];
  const insertSlot = db.prepare(
    'INSERT INTO schedule (dept, slot_index, workers) VALUES (?, ?, ?)'
  );
  runTransaction(() => {
    schedule.forEach(row => {
      row.slots.forEach((slot, i) => {
        insertSlot.run([row.dept, i, slot.join(',')]);
      });
    });
  });
  insertSlot.finalize();

  // Notifications
  const notifications = [
    ['alert',    '⚠️', '3 workers flagged for repeated absences',       'Ruth Adeleke, Blessing Uche, and Grace Emeka have missed 2+ consecutive services.',   'Today, 9:00 AM',     1],
    ['reminder', '📤', 'Reminders sent to 142 workers',                 'Sunday service reminders dispatched via WhatsApp successfully.',                      'Today, 8:02 AM',     1],
    ['alert',    '🔄', 'Replacement request from Grace Emeka',          'Grace Emeka (Choir) has requested a replacement for Sunday 27 Apr — 1st Service.',   'Today, 7:45 AM',     1],
    ['system',   '✅', 'April rotation schedule generated',             'Monthly rotation for all 8 departments has been auto-generated.',                    'Yesterday, 4:15 PM', 0],
    ['reminder', '📤', 'Friday Prayer reminders sent',                  '23 workers in Prayer Unit and Choir were notified for Friday service.',              '22 Apr, 7:00 AM',    0],
    ['system',   '🎉', 'New worker added — Adaeze Okonkwo',             'Adaeze Okonkwo was successfully added to the Ushers department.',                    '22 Apr, 11:30 AM',   0],
    ['alert',    '❌', 'WhatsApp delivery failed for Ruth Adeleke',     'Could not reach Ruth Adeleke via WhatsApp. SMS fallback initiated.',                 '21 Apr, 8:05 AM',    0],
    ['system',   '📊', 'March Attendance Report ready',                 'Monthly attendance report for March 2025 generated. Click to download.',             '1 Apr, 10:00 AM',    0],
  ];
  const insertNotif = db.prepare(
    'INSERT INTO notifications (type, icon, title, body, time_label, unread) VALUES (?, ?, ?, ?, ?, ?)'
  );
  runTransaction(() => {
    notifications.forEach(n => insertNotif.run(n));
  });
  insertNotif.finalize();

  console.log('[DB] Seed complete.');
}

seed();

module.exports = { db, runTransaction };
