const { Telegraf } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const db = new sqlite3.Database('scores.db');
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start для запуска игры
bot.command('start', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'Unknown';
    const firstName = ctx.from.first_name;

    // Приветственное сообщение
    ctx.reply(`Hello, ${firstName}! Start playing the game and earn points!`);

    // Кнопка для запуска игры
    ctx.reply('Click the button below to start the game!', {
        reply_markup: {
            inline_keyboard: [[
                { text: 'Play Game', web_app: { url: `https://yourgameurl.com?user_id=${userId}&username=${username}` } }
            ]]
        }
    });
});

// Команда /leaders для отображения лидерборда
bot.command('leaders', (ctx) => {
    db.all(`SELECT first_name, score FROM scores ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
        if (err) {
            ctx.reply('Error retrieving leaderboard.');
            return;
        }

        let leaderboard = '🏆 Leaderboard 🏆\n';
        rows.forEach((row, index) => {
            leaderboard += `${index + 1}. ${row.first_name} - ${row.score} points\n`;
        });
        ctx.reply(leaderboard);
    });
});

// Запуск бота
bot.launch();