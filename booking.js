// Initialize EmailJS
(function() {
    // Initialize with your public key
    emailjs.init("nqLDVniO3BUlQ-e1n");
})();

// Available time slots (you can customize these)
const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM"
];

// Initialize date picker
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Flatpickr calendar
    const datePicker = flatpickr("#datePicker", {
        minDate: "today",
        maxDate: new Date().fp_incr(30), // Allow booking up to 30 days in advance
        disable: [
            function(date) {
                // Disable Sundays and Mondays (customize as needed)
                return date.getDay() === 0 || date.getDay() === 1;
            }
        ],
        locale: {
            firstDayOfWeek: 1 // Start week on Monday
        }
    });

    // Populate time slots
    const timeSlotSelect = document.getElementById('timeSlot');
    timeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSlotSelect.appendChild(option);
    });

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                // Generate booking ID
                const bookingId = generateBookingId();
                
                // Get form data
                const formData = new FormData(this);
                const clientName = formData.get('client_name');
                const clientEmail = formData.get('client_email');
                const clientPhone = formData.get('client_phone');
                const appointmentDate = formData.get('appointment_date');
                const appointmentTime = formData.get('appointment_time');
                const tattooType = formData.get('tattoo_type');
                const tattooSize = formData.get('tattoo_size');
                const tattooPlacement = formData.get('tattoo_placement');

                // Send confirmation email to client
                await emailjs.send('service_3pilkcs', 'template_gowinjb', {
                    to_name: clientName,
                    from_name: "Inked by Chris",
                    to_email: clientEmail,
                    message: `
Your tattoo appointment has been confirmed!

Appointment Details:
- Booking ID: ${bookingId}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Type: ${tattooType}
- Size: ${tattooSize}
- Placement: ${tattooPlacement}

Important Information:
1. Please arrive 10 minutes before your appointment time
2. Bring a valid ID
3. Stay hydrated and eat before your appointment

Need to cancel?
Use this link to cancel your appointment:
${window.location.origin}/cancel.html?id=${bookingId}

Questions or need to reschedule?
Email: senghakmad@gmail.com
Phone/Text: (651) 592-5122

We look forward to creating your tattoo!

Best regards,
Inked by Chris`,
                    reply_to: "senghakmad@gmail.com"
                }, 'nqLDVniO3BUlQ-e1n');

                // Send notification to shop
                await emailjs.send('service_3pilkcs', 'template_tukgt7p', {
                    to_name: "Chris",
                    from_name: "Booking System",
                    to_email: "senghakmad@gmail.com",
                    message: `
New Appointment Booking

Client Information:
- Booking ID: ${bookingId}
- Name: ${clientName}
- Email: ${clientEmail}
- Phone: ${clientPhone}

Appointment Details:
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Type: ${tattooType}
- Size: ${tattooSize}
- Placement: ${tattooPlacement}`,
                    reply_to: clientEmail
                }, 'nqLDVniO3BUlQ-e1n');

                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <h3>Booking Confirmed!</h3>
                    <p>Thank you for booking with Inked by Chris!</p>
                    <p>Your booking ID is: ${bookingId}</p>
                    <p>A confirmation email has been sent to ${clientEmail}</p>
                    <p>Please check your email for appointment details and cancellation instructions.</p>`;
                
                // Replace form with success message
                bookingForm.innerHTML = '';
                bookingForm.appendChild(successMessage);

            } catch (error) {
                console.error('Booking error:', error);
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;

                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `
                    <p>Sorry, there was an error processing your booking.</p>
                    <p>Please try again or contact us directly:</p>
                    <p>Email: senghakmad@gmail.com</p>
                    <p>Phone: (651) 592-5122</p>`;
                
                // Insert error message before the submit button
                submitButton.parentNode.insertBefore(errorDiv, submitButton);
            }
        });
    } else {
        console.error('Booking form not found');
    }
});

function generateBookingId() {
    // Implement your own booking ID generation logic here
    // For demonstration purposes, a simple random ID is generated
    return Math.random().toString(36).substr(2, 9);
}
