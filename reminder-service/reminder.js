const twilio = require('twilio');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Initialize email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'senghakmad@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Use Gmail App Password
    }
});

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, 'appointments.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to the appointments database.');
});

// Function to send SMS
async function sendSMS(to, message) {
    try {
        const result = await twilioClient.messages.create({
            body: message,
            to: to,
            from: TWILIO_PHONE_NUMBER
        });
        console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
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
    const reminderSMS = `
Reminder: You have a tattoo appointment tomorrow at ${appointment.appointment_time}
Location: 2395 7th St N, Saint Paul, MN 55109

Need to cancel? Please call or text: (555) 555-5555
Booking ID: ${appointment.id}`;

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

Questions? Call or text: (555) 555-5555

Best regards,
Inked by Chris`;

    await Promise.all([
        sendSMS(appointment.client_phone, reminderSMS),
        sendEmail(appointment.client_email, 'Tattoo Appointment Reminder', reminderEmail)
    ]);
}

// Function to check for appointments needing reminders
function checkAppointments() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    // Check for appointments tomorrow that haven't received 24h reminder
    db.all(
        `SELECT * FROM appointments 
         WHERE appointment_date = ? 
         AND reminded_24h = 0 
         AND status = 'scheduled'`,
        [tomorrowDate],
        async (err, appointments) => {
            if (err) {
                console.error('Error checking for appointments:', err);
                return;
            }

            for (const appointment of appointments) {
                try {
                    await sendReminders(appointment);
                    db.run(
                        'UPDATE appointments SET reminded_24h = 1 WHERE id = ?',
                        [appointment.id]
                    );
                } catch (error) {
                    console.error(`Error sending reminders for appointment ${appointment.id}:`, error);
                }
            }
        }
    );

    // Check for appointments today that haven't received same-day reminder
    const todayDate = now.toISOString().split('T')[0];
    db.all(
        `SELECT * FROM appointments 
         WHERE appointment_date = ? 
         AND reminded_day_of = 0 
         AND status = 'scheduled'`,
        [todayDate],
        async (err, appointments) => {
            if (err) {
                console.error('Error checking for appointments:', err);
                return;
            }

            for (const appointment of appointments) {
                try {
                    await sendReminders(appointment);
                    db.run(
                        'UPDATE appointments SET reminded_day_of = 1 WHERE id = ?',
                        [appointment.id]
                    );
                } catch (error) {
                    console.error(`Error sending reminders for appointment ${appointment.id}:`, error);
                }
            }
        }
    );
}

// Schedule reminder checks to run every hour
schedule.scheduleJob('0 * * * *', checkAppointments);

console.log('Reminder service started. Checking for appointments every hour.');

// Initial check when service starts
checkAppointments();
