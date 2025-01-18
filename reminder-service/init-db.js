const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, 'appointments.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to the appointments database.');

    // Create appointments table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            client_name TEXT,
            client_email TEXT,
            client_phone TEXT,
            appointment_date TEXT,
            appointment_time TEXT,
            tattoo_type TEXT,
            tattoo_size TEXT,
            tattoo_placement TEXT,
            reminded_24h INTEGER DEFAULT 0,
            reminded_day_of INTEGER DEFAULT 0,
            status TEXT DEFAULT 'scheduled'
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            process.exit(1);
        }
        console.log('Database initialized successfully');
        process.exit(0);
    });
});
