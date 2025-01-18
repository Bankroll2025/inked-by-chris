const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./appointments.db');

// Create appointments table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        date TEXT,
        time TEXT,
        message TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

console.log('Database initialized successfully');
db.close();
