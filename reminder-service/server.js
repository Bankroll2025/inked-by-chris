const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve website files

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, 'appointments.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
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
            reminded_24h BOOLEAN DEFAULT 0,
            reminded_day_of BOOLEAN DEFAULT 0,
            status TEXT DEFAULT 'scheduled'
        )
    `);
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === 'your-secret-admin-key') { // Change this to a secure key
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Endpoint to save appointment
app.post('/api/save-appointment', (req, res) => {
    const appointment = req.body;
    
    db.run(`
        INSERT INTO appointments (
            id, client_name, client_email, client_phone, 
            appointment_date, appointment_time, 
            tattoo_type, tattoo_size, tattoo_placement
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        appointment.id,
        appointment.client_name,
        appointment.client_email,
        appointment.client_phone,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.tattoo_type,
        appointment.tattoo_size,
        appointment.tattoo_placement
    ], (err) => {
        if (err) {
            console.error('Error saving appointment:', err);
            res.status(500).json({ error: 'Failed to save appointment' });
            return;
        }
        res.json({ message: 'Appointment saved successfully' });
    });
});

// Admin: Get all appointments
app.get('/api/admin/appointments', adminAuth, (req, res) => {
    const query = `
        SELECT * FROM appointments 
        WHERE appointment_date >= date('now') 
        ORDER BY appointment_date, appointment_time
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch appointments' });
            return;
        }
        res.json(rows);
    });
});

// Admin: Update appointment status
app.put('/api/admin/appointments/:id/status', adminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.run(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
            if (err) {
                res.status(500).json({ error: 'Failed to update appointment status' });
                return;
            }
            res.json({ message: 'Appointment status updated successfully' });
        }
    );
});

// Admin: Get appointment statistics
app.get('/api/admin/statistics', adminAuth, (req, res) => {
    const queries = {
        upcoming: `
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE appointment_date >= date('now')
            AND status = 'scheduled'
        `,
        today: `
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE appointment_date = date('now')
            AND status = 'scheduled'
        `,
        cancelled: `
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE status = 'cancelled'
            AND appointment_date >= date('now', '-30 days')
        `
    };

    Promise.all([
        new Promise((resolve, reject) => {
            db.get(queries.upcoming, (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            });
        }),
        new Promise((resolve, reject) => {
            db.get(queries.today, (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            });
        }),
        new Promise((resolve, reject) => {
            db.get(queries.cancelled, (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            });
        })
    ])
    .then(([upcoming, today, cancelled]) => {
        res.json({
            upcoming,
            today,
            cancelled
        });
    })
    .catch(err => {
        console.error('Error getting statistics:', err);
        res.status(500).json({ error: 'Failed to get statistics' });
    });
});

// Endpoint to get all appointments (for testing)
app.get('/api/appointments', (req, res) => {
    db.all('SELECT * FROM appointments', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch appointments' });
            return;
        }
        res.json(rows);
    });
});

// Test endpoint to create a sample appointment
app.get('/api/test-appointment', (req, res) => {
    const testAppointment = {
        id: 'TEST' + Date.now(),
        client_name: 'Test Client',
        client_email: 'senghakmad@gmail.com',  // Your email for testing
        client_phone: '6515925122',  // Your phone for testing
        appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        appointment_time: '14:00',
        tattoo_type: 'Traditional',
        tattoo_size: 'Medium',
        tattoo_placement: 'Arm'
    };

    db.run(`
        INSERT INTO appointments (
            id, client_name, client_email, client_phone, 
            appointment_date, appointment_time, 
            tattoo_type, tattoo_size, tattoo_placement
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        testAppointment.id,
        testAppointment.client_name,
        testAppointment.client_email,
        testAppointment.client_phone,
        testAppointment.appointment_date,
        testAppointment.appointment_time,
        testAppointment.tattoo_type,
        testAppointment.tattoo_size,
        testAppointment.tattoo_placement
    ], (err) => {
        if (err) {
            console.error('Error creating test appointment:', err);
            res.status(500).json({ error: 'Failed to create test appointment' });
            return;
        }
        res.json({ message: 'Test appointment created successfully', appointment: testAppointment });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Handle process termination
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
