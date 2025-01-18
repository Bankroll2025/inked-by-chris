// Initialize EmailJS
(function() {
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
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;

            try {
                // Generate booking ID
                const bookingId = generateBookingId();
                
                // Get form data
                const formData = new FormData(this);
                const clientName = formData.get('client_name');
                const clientEmail = formData.get('client_email');
                const clientPhone = formData.get('client_phone');
                const clientGender = formData.get('client_gender');
                const clientBirthdate = formData.get('client_birthdate');
                const preferredDate = formData.get('preferred_date');
                const preferredTime = formData.get('preferred_time');
                const tattooType = formData.get('tattooType');
                const tattooSize = formData.get('tattooSize');
                const tattooPlacement = formData.get('tattooPlacement');
                const tattooDescription = formData.get('tattooDescription');
                const colorPreference = formData.get('colorPreference') || 'Not specified';
                const additionalNotes = formData.get('additionalNotes') || 'None';

                // Calculate age from birthdate
                const birthDate = new Date(clientBirthdate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                let emailSuccess = false;
                let notificationSuccess = false;

                try {
                    // Send notification to shop first
                    await emailjs.send('service_3pilkcs', 'template_tukgt7p', {
                        to_name: "Chris",
                        from_name: "Booking System",
                        to_email: "senghakmad@gmail.com",
                        subject: `New Booking Request - ${clientName}`,
                        message: `
New Booking Request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Client Information:
Name: ${clientName}
Gender: ${clientGender}
Age: ${age} (DOB: ${new Date(clientBirthdate).toLocaleDateString()})
Email: ${clientEmail}
Phone: ${clientPhone}

Appointment Details:
Date: ${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${preferredTime}
Tattoo Type: ${tattooType}
Size: ${tattooSize}
Placement: ${tattooPlacement}
Color Preference: ${colorPreference}
Tattoo Description: ${tattooDescription}
Additional Notes: ${additionalNotes}

Booking ID: ${bookingId}

Cancellation Link:
${window.location.origin}/cancel.html?id=${bookingId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                        reply_to: clientEmail
                    }, 'nqLDVniO3BUlQ-e1n');
                    notificationSuccess = true;

                    // Send confirmation to client
                    await emailjs.send('service_3pilkcs', 'template_gowinjb', {
                        to_name: clientName,
                        from_name: "Inked by Chris",
                        to_email: clientEmail,
                        subject: "Your Tattoo Appointment Confirmation",
                        message: `
Dear ${clientName},

Thank you for booking with Inked by Chris! Your appointment has been confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${preferredTime}
Booking ID: ${bookingId}

Your Tattoo Details:
• Type: ${tattooType}
• Size: ${tattooSize}
• Placement: ${tattooPlacement}
• Color Preference: ${colorPreference}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Please arrive 10 minutes before your appointment
2. Bring a valid ID
3. Stay hydrated and eat before your appointment
4. Get a good night's sleep
5. Wear comfortable clothing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEED TO CANCEL OR RESCHEDULE?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use this link to cancel your appointment:
${window.location.origin}/cancel.html?id=${bookingId}

Questions? Contact us:
Email: senghakmad@gmail.com
Phone: (651) 592-5122

We look forward to creating your tattoo!

Best regards,
Inked by Chris`,
                        reply_to: "senghakmad@gmail.com"
                    }, 'nqLDVniO3BUlQ-e1n');
                    emailSuccess = true;

                    // Show success message with option to book another appointment
                    const successDiv = document.createElement('div');
                    successDiv.className = 'success-message';
                    successDiv.innerHTML = `
                        <h3>Booking Confirmed! 🎉</h3>
                        <p>Thank you for choosing Inked by Chris!</p>
                        <div class="confirmation-details">
                            <p><strong>Appointment Details:</strong></p>
                            <ul>
                                <li>Date: ${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                                <li>Time: ${preferredTime}</li>
                                <li>Booking ID: ${bookingId}</li>
                            </ul>
                            <p>A confirmation email has been sent to ${clientEmail}</p>
                        </div>
                        <div class="next-steps">
                            <p><strong>What's Next?</strong></p>
                            <ol>
                                <li>Check your email for detailed appointment information</li>
                                <li>Save your booking ID: ${bookingId}</li>
                                <li>Mark your calendar for ${new Date(preferredDate).toLocaleDateString()}</li>
                            </ol>
                        </div>
                        <div class="booking-options">
                            <button onclick="window.location.reload()" class="book-another-btn">Book Another Appointment</button>
                            <button onclick="window.location.href='index.html'" class="home-btn">Return to Homepage</button>
                        </div>`;
                    
                    // Replace form with success message
                    bookingForm.innerHTML = '';
                    bookingForm.appendChild(successDiv);

                } catch (error) {
                    console.error('Email error:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.innerHTML = `
                        <h3>Appointment Saved</h3>
                        <p>Your appointment has been saved, but there was an error sending notifications.</p>
                        <div class="booking-details">
                            <p><strong>Important: Save Your Booking Information</strong></p>
                            <ul>
                                <li>Booking ID: ${bookingId}</li>
                                <li>Date: ${new Date(preferredDate).toLocaleDateString()}</li>
                                <li>Time: ${preferredTime}</li>
                            </ul>
                        </div>
                        <div class="contact-info">
                            <p>Please contact us to confirm your appointment:</p>
                            <p>📧 Email: senghakmad@gmail.com</p>
                            <p>📞 Phone: (651) 592-5122</p>
                        </div>
                        <div class="booking-options">
                            <button onclick="window.location.reload()" class="retry-btn">Try Again</button>
                            <button onclick="window.location.href='index.html'" class="home-btn">Return to Homepage</button>
                        </div>`;
                    
                    submitButton.parentNode.insertBefore(errorDiv, submitButton);
                    submitButton.style.display = 'none';
                }

            } catch (error) {
                console.error('Booking error:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `
                    <h3>Booking Error</h3>
                    <p>Sorry, there was an error processing your booking.</p>
                    <p>Please try again or contact us directly:</p>
                    <p>📧 Email: senghakmad@gmail.com</p>
                    <p>📞 Phone: (651) 592-5122</p>
                    <div class="booking-options">
                        <button onclick="window.location.reload()" class="retry-btn">Try Again</button>
                        <button onclick="window.location.href='index.html'" class="home-btn">Return to Homepage</button>
                    </div>`;
                
                submitButton.parentNode.insertBefore(errorDiv, submitButton);
                submitButton.style.display = 'none';
            }
        });
    } else {
        console.error('Booking form not found');
    }
});

function generateBookingId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `BK${timestamp}${random}`.toUpperCase();
}
