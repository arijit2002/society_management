const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const { initSchema } = require('./schema');
const { seedData } = require('./seed');

let db;

function getDB() {
  if (!db) {
    const isDev = process.env.NODE_ENV === 'development';
    const dbPath = isDev
      ? path.join(__dirname, '../../society_dev.db')
      : path.join(app.getPath('userData'), 'society.db');

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    seedData(db);
  }
  return db;
}

module.exports = { getDB };
