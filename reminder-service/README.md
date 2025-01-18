# Inked by Chris - Appointment Reminder Service

A Node.js service that manages tattoo appointments and sends automated email reminders to clients.

## Features

- Appointment management through admin dashboard
- Automated email reminders:
  - 24 hours before appointment
  - Day of appointment
- SQLite database for appointment storage
- Secure admin access with API key authentication

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/inkedbychris-reminder.git
cd inkedbychris-reminder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
EMAIL_PASSWORD=your_gmail_app_password
ADMIN_API_KEY=your_admin_api_key
```

4. Initialize the database:
```bash
node init-db.js
```

5. Start the server:
```bash
npm start
```

6. Start the reminder service:
```bash
node reminder.js
```

## Environment Variables

- `EMAIL_PASSWORD`: Gmail app password for sending email notifications
- `ADMIN_API_KEY`: Secret key for admin dashboard access

## API Endpoints

### Public Endpoints

- `POST /appointments`: Create a new appointment
- `GET /appointments/:id`: Get appointment details

### Admin Endpoints (Requires API Key)

- `GET /admin/appointments`: List all appointments
- `PUT /appointments/:id`: Update appointment status
- `DELETE /appointments/:id`: Cancel appointment

## Database Schema

```sql
CREATE TABLE appointments (
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
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
