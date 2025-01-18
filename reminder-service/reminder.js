const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Initialize email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'senghakmad@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

// Initialize database
let db = null;

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close(() => {
                db = null;
                console.log('Closed existing database connection');
            });
        }

        db = new sqlite3.Database(path.join(__dirname, 'appointments.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to the appointments database.');
            resolve();
        });
    });
}

// Function to send email
async function sendEmail(to, subject, text) {
    try {
        const result = await transporter.sendMail({
            from: 'Inked by Chris <senghakmad@gmail.com>',
            to: to,
            subject: subject,
            text: text
        });
        console.log(`Email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Function to send reminders for an appointment
async function sendReminders(appointment) {
    const reminderEmail = `
Dear ${appointment.client_name},

This is a reminder about your tattoo appointment:
Date: ${appointment.appointment_date}
Time: ${appointment.appointment_time}
Location: 2395 7th St N, Saint Paul, MN 55109

Tattoo Details:
- Type: ${appointment.tattoo_type}
- Size: ${appointment.tattoo_size}
- Placement: ${appointment.tattoo_placement}

Please remember:
1. Arrive 10-15 minutes early
2. Bring a valid ID
3. If you need to cancel, please do so at least 24 hours in advance

Questions? Please email us at senghakmad@gmail.com

Best regards,
Inked by Chris`;

    await sendEmail(appointment.client_email, 'Tattoo Appointment Reminder', reminderEmail);
}

// Function to check for appointments needing reminders
async function checkAppointments() {
    try {
        await initializeDatabase();

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
        const todayDate = now.toISOString().split('T')[0];

        console.log(`Checking for appointments on ${tomorrowDate} (tomorrow) and ${todayDate} (today)`);

        // Check for appointments tomorrow that haven't received 24h reminder
        const tomorrowAppointments = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM appointments 
                 WHERE appointment_date = ? 
                 AND reminded_24h = 0 
                 AND status = ?`,
                [tomorrowDate, 'scheduled'],
                (err, rows) => {
                    if (err) {
                        console.error('Error checking for tomorrow appointments:', err);
                        reject(err);
                        return;
                    }
                    resolve(rows || []);
                }
            );
        });

        console.log(`Found ${tomorrowAppointments.length} appointments for tomorrow`);
        for (const appointment of tomorrowAppointments) {
            try {
                await sendReminders(appointment);
                await new Promise((resolve, reject) => {
                    db.run(
                        'UPDATE appointments SET reminded_24h = 1 WHERE id = ?',
                        [appointment.id],
                        (err) => {
                            if (err) {
                                console.error(`Error updating reminded_24h for appointment ${appointment.id}:`, err);
                                reject(err);
                                return;
                            }
                            resolve();
                        }
                    );
                });
            } catch (error) {
                console.error(`Error sending reminders for appointment ${appointment.id}:`, error);
            }
        }

        // Check for appointments today that haven't received same-day reminder
        const todayAppointments = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM appointments 
                 WHERE appointment_date = ? 
                 AND reminded_day_of = 0 
                 AND status = ?`,
                [todayDate, 'scheduled'],
                (err, rows) => {
                    if (err) {
                        console.error('Error checking for today appointments:', err);
                        reject(err);
                        return;
                    }
                    resolve(rows || []);
                }
            );
        });

        console.log(`Found ${todayAppointments.length} appointments for today`);
        for (const appointment of todayAppointments) {
            try {
                await sendReminders(appointment);
                await new Promise((resolve, reject) => {
                    db.run(
                        'UPDATE appointments SET reminded_day_of = 1 WHERE id = ?',
                        [appointment.id],
                        (err) => {
                            if (err) {
                                console.error(`Error updating reminded_day_of for appointment ${appointment.id}:`, err);
                                reject(err);
                                return;
                            }
                            resolve();
                        }
                    );
                });
            } catch (error) {
                console.error(`Error sending reminders for appointment ${appointment.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in checkAppointments:', error);
    }
}

// Schedule reminder checks to run every hour
schedule.scheduleJob('0 * * * *', async () => {
    console.log('Running scheduled appointment check');
    await checkAppointments();
});

console.log('Reminder service started. Checking for appointments every hour.');

// Initial check when service starts
checkAppointments();
