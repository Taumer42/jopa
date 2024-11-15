const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

const { getTopUsers } = require('./leaders');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Подключение к базе данных
const db = new sqlite3.Database('scores.db');

// Обновление очков
app.post('/api/updateScore', (req, res) => {
    const { user_id, score } = req.body;
    if (!user_id || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const query = `UPDATE scores SET score = score + ? WHERE user_id = ?`;
    db.run(query, [score, user_id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Score updated successfully!' });
    });
});

// Получение текущих очков пользователя
app.get('/api/getScore', (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) {
        return res.status(400).json({ error: 'Invalid user_id' });
    }

    const query = `SELECT score FROM scores WHERE user_id = ?`;
    db.get(query, [user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            res.json({ score: row.score });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

// Получение лидерборда
app.get('/api/leaders', (req, res) => {
    getTopUsers((err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Проверка существования таблицы
db.run(`CREATE TABLE IF NOT EXISTS scores (
    user_id INTEGER PRIMARY KEY,
    first_name TEXT,
    second_name TEXT,
    username TEXT,
    lang TEXT,
    score INTEGER DEFAULT 0
)`, (err) => {
    if (err) {
        console.error('Error creating scores table:', err.message);
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
