// Initialize EmailJS
(function() {
    emailjs.init({
        publicKey: "nqLDVniO3BUlQ-e1n"
    });
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

                // Format the notification message
                const notificationMessage = `
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
If needed, the client can cancel using this link:
${window.location.origin}/cancel.html?id=${bookingId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

                try {
                    // Send notification to shop
                    await emailjs.send('service_3pilkcs', 'template_tukgt7p', {
                        to_name: "Chris",
                        from_name: "Booking System",
                        to_email: "senghakmad@gmail.com",
                        subject: `New Booking Request - ${clientName}`,
                        message: notificationMessage,
                        reply_to: clientEmail
                    }, 'nqLDVniO3BUlQ-e1n');

                    // Send confirmation to client
                    await emailjs.send('service_3pilkcs', 'template_gowinjb', {
                        to_name: clientName,
                        from_name: "Inked by Chris",
                        to_email: clientEmail,
                        message: `
Thank you for booking with Inked by Chris!

Your appointment has been confirmed:
- Date: ${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${preferredTime}

Important Information:
1. Please arrive 10 minutes before your appointment time
2. Bring a valid ID
3. Stay hydrated and eat before your appointment

Need to cancel or reschedule?
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
                    console.error('Email error:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.innerHTML = `
                        <h3>Booking Saved</h3>
                        <p>Your appointment was saved but there was an error sending notifications.</p>
                        <p>Please contact us to confirm your appointment:</p>
                        <p>Email: senghakmad@gmail.com</p>
                        <p>Phone: (651) 592-5122</p>
                        <p>Your booking ID is: ${bookingId}</p>`;
                    
                    submitButton.parentNode.insertBefore(errorDiv, submitButton);
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }

            } catch (error) {
                console.error('Booking error:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `
                    <h3>Booking Error</h3>
                    <p>Sorry, there was an error processing your booking.</p>
                    <p>Please try again or contact us directly:</p>
                    <p>Email: senghakmad@gmail.com</p>
                    <p>Phone: (651) 592-5122</p>`;
                
                submitButton.parentNode.insertBefore(errorDiv, submitButton);
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
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
