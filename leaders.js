const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('scores.db');

function getTopUsers(callback) {
    const query = `SELECT first_name, score FROM scores ORDER BY score DESC LIMIT 50`;
    db.all(query, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

module.exports = { getTopUsers };

