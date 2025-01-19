// Initialize EmailJS with your public key
(function() {
    emailjs.init("nqLDVniO3BUlQ-e1n");
})();

// Available time slots (you can customize these)
const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM"
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize flatpickr
    const datePicker = flatpickr("#preferred_date", {
        minDate: "today",
        disable: [
            function(date) {
                return (date.getDay() === 0); // Disable Sundays
            }
        ],
        dateFormat: "Y-m-d"
    });

    // Phone number formatting
    const phoneInput = document.getElementById('client_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '').substring(0, 10);
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, "$1-$2");
            }
            e.target.value = value;
        });

        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                let value = e.target.value;
                if (value.length === 8 || value.length === 4) { // Position right after a dash
                    if (e.key === 'Backspace') {
                        e.target.value = value.slice(0, -1);
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;

            try {
                // Get form data
                const formData = new FormData(bookingForm);
                
                // Calculate age
                const birthDate = new Date(formData.get('client_birthdate'));
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Check if client is 18 or older
                if (age < 18) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.innerHTML = `
                        <h3>Age Restriction</h3>
                        <p>You must be 18 or older to book a tattoo appointment.</p>
                        <button onclick="location.reload()" class="refresh-button">Try Again</button>
                    `;
                    bookingForm.replaceWith(errorDiv);
                    return;
                }

                const data = {
                    clientFirstName: formData.get('client_first_name'),
                    clientLastName: formData.get('client_last_name'),
                    clientEmail: formData.get('client_email'),
                    clientPhone: formData.get('client_phone'),
                    clientGender: formData.get('client_gender'),
                    clientBirthdate: formData.get('client_birthdate'),
                    clientAge: age,
                    preferredDate: formData.get('preferred_date'),
                    preferredTime: formData.get('preferred_time'),
                    tattooType: formData.get('tattooType'),
                    tattooSize: formData.get('tattooSize'),
                    tattooPlacement: formData.get('tattooPlacement'),
                    tattooDescription: formData.get('tattooDescription'),
                    colorPreference: formData.get('colorPreference') || 'Not specified',
                    additionalNotes: formData.get('additionalNotes') || 'None',
                    bookingId: generateBookingId()
                };

                const formattedDate = new Date(data.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                try {
                    // Send notification to shop
                    console.log('Sending shop notification...');
                    const shopResponse = await emailjs.send(
                        "service_2e752is",
                        "template_tukgt7p",
                        {
                            to_name: "Chris",
                            from_name: `${data.clientFirstName} ${data.clientLastName}`,
                            to_email: "senghakmad@gmail.com",
                            client_name: `${data.clientFirstName} ${data.clientLastName}`,
                            client_email: data.clientEmail,
                            client_phone: data.clientPhone,
                            client_gender: data.clientGender,
                            client_age: data.clientAge,
                            appointment_date: formattedDate,
                            appointment_time: data.preferredTime,
                            tattoo_type: data.tattooType,
                            tattoo_size: data.tattooSize,
                            tattoo_placement: data.tattooPlacement,
                            tattoo_description: data.tattooDescription || 'Not provided',
                            color_preference: data.colorPreference,
                            additional_notes: data.additionalNotes,
                            booking_id: data.bookingId,
                            subject: `New Booking Request - ${data.clientFirstName} ${data.clientLastName} - ${formattedDate} at ${data.preferredTime}`
                        },
                        "nqLDVniO3BUlQ-e1n"
                    );
                    console.log('Shop notification sent successfully');

                    // Send confirmation to client's email only
                    console.log('Sending client confirmation...');
                    const clientResponse = await emailjs.send(
                        "service_2e752is",
                        "template_gowinjb",
                        {
                            to_name: `${data.clientFirstName} ${data.clientLastName}`,
                            to_email: data.clientEmail,
                            from_name: "Inked by Chris",
                            reply_to: "senghakmad@gmail.com",
                            appointment_date: formattedDate,
                            appointment_time: data.preferredTime,
                            tattoo_type: data.tattooType,
                            tattoo_size: data.tattooSize,
                            tattoo_placement: data.tattooPlacement,
                            color_preference: data.colorPreference,
                            booking_id: data.bookingId,
                            website_link: "https://inkedbychris.netlify.app",
                            subject: `Booking Confirmation - ${formattedDate} at ${data.preferredTime}`
                        },
                        "nqLDVniO3BUlQ-e1n"
                    );
                    console.log('Client confirmation sent successfully');

                    // Show success message
                    const successDiv = document.createElement('div');
                    successDiv.className = 'success-message';
                    successDiv.innerHTML = `
                        <h3>Booking Successful!</h3>
                        <p>Your appointment has been scheduled for ${formattedDate} at ${data.preferredTime}.</p>
                        <p>A confirmation email has been sent to ${data.clientEmail}.</p>
                        <p>Your booking ID is: ${data.bookingId}</p>
                        <button onclick="location.reload()" class="refresh-button">Book Another Appointment</button>
                    `;
                    bookingForm.replaceWith(successDiv);

                } catch (error) {
                    console.error('Email error details:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.innerHTML = `
                        <h3>Email Notification Error</h3>
                        <p>There was an error sending the confirmation email. Please save your booking information:</p>
                        <div class="booking-details">
                            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Time:</strong> ${data.preferredTime}</p>
                        </div>
                        <p>Contact us to confirm your appointment:</p>
                        <p><strong>Email:</strong> senghakmad@gmail.com</p>
                        <p><strong>Phone:</strong> (651) 592-5122</p>
                        <button onclick="location.reload()" class="refresh-button">Try Again</button>`;
                    
                    bookingForm.replaceWith(errorDiv);
                    throw error;
                }
            } catch (error) {
                console.error('Full error details:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `
                    <h3>Booking Error</h3>
                    <p>There was an error processing your booking. Please try again or contact us directly.</p>
                    <p><strong>Email:</strong> senghakmad@gmail.com</p>
                    <p><strong>Phone:</strong> (651) 592-5122</p>
                    <button onclick="location.reload()" class="refresh-button">Try Again</button>`;
                bookingForm.replaceWith(errorDiv);
            } finally {
                submitButton.textContent = 'Book Appointment';
                submitButton.disabled = false;
            }
        });
    }

    // Helper function to generate booking ID
    function generateBookingId() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `BK${timestamp}${random}`;
    }
});

// Check for reschedule or cancel parameters
const urlParams = new URLSearchParams(window.location.search);
const rescheduleId = urlParams.get('reschedule');
const cancelId = urlParams.get('cancel');
    
if (rescheduleId) {
    // Handle reschedule
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
        const message = document.createElement('div');
        message.className = 'info-message';
        message.innerHTML = `
            <p>You're rescheduling appointment: ${rescheduleId}</p>
            <p>Please select your new preferred date and time below.</p>
        `;
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.insertBefore(message, bookingForm.firstChild);
        }
    }
} else if (cancelId) {
    // Handle cancellation
    window.location.href = `/cancel.html?id=${cancelId}`;
}

// Populate time slots
const timeSlotSelect = document.getElementById('timeSlot');
if (timeSlotSelect) {
    timeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSlotSelect.appendChild(option);
    });
}
