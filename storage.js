const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      activityLogs: [],
      securityEvents: [],
      giveaways: [],
      users: [],
      referrals: [],
      rateLimitData: {}
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

class JSONDatabase {
  static getAll(key) {
    const db = readDB();
    return db[key] || [];
  }

  static save(key, value) {
    const db = readDB();
    db[key] = value;
    writeDB(db);
  }

  static append(key, item) {
    const db = readDB();
    db[key] = [item, ...(db[key] || [])];
    writeDB(db);
  }
}

module.exports = JSONDatabase;
