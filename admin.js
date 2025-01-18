// Admin credentials (change these to your preferred username and password)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'inkedbychris2025';

// Handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        loadAppointments();
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Logout function
function logout() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// Load appointments from Gmail
function loadAppointments() {
    // For now, we'll display appointments from your Gmail inbox
    // You'll need to check your Gmail for appointments
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    appointmentsTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center;">
                Please check your email at senghakmad@gmail.com for appointments.
                <br>
                We'll add direct appointment viewing in a future update.
            </td>
        </tr>
    `;
}

// Filter appointments
document.getElementById('statusFilter').addEventListener('change', filterAppointments);
document.getElementById('dateFilter').addEventListener('change', filterAppointments);

function filterAppointments() {
    // This will be implemented when we add appointment storage
    loadAppointments();
}
