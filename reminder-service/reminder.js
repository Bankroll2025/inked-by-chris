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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
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
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: text.replace(/\n/g, '<br>')
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Function to generate cancellation link
function generateCancellationLink(appointmentId) {
    return `https://inkedbychris.com/cancel.html?id=${appointmentId}`;
}

// Function to send reminders for an appointment
async function sendReminders(appointment) {
    const reminderSMS = `
Reminder: You have a tattoo appointment tomorrow at ${appointment.appointment_time}
Location: 2395 7th St N, Saint Paul, MN 55109

Need to cancel? Please call or text: (555) 555-5555
Booking ID: ${appointment.id}`;

    const cancellationLink = generateCancellationLink(appointment.id);
    const reminderEmail = `
Dear ${appointment.client_name},

This is a friendly reminder about your upcoming tattoo appointment:

Date: ${appointment.appointment_date}
Time: ${appointment.appointment_time}
Location: 2395 7th St N, Saint Paul, MN 55109

Important Reminders:
1. Please arrive 10 minutes early
2. Bring a valid ID
3. If you need to cancel, please do so at least 24 hours in advance

Cancellation Policy:
- A 24-hour notice is required for all cancellations.
- To cancel your appointment, click here: ${cancellationLink}
- For questions or rescheduling, contact us at:
  Email: senghakmad@gmail.com
  Phone/Text: (651) 592-5122

We look forward to seeing you!

Best regards,
Inked by Chris`;

    await Promise.all([
        sendSMS(appointment.client_phone, reminderSMS),
        sendEmail(appointment.client_email, 'Appointment Reminder - Inked by Chris', reminderEmail)
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
