// Initialize EmailJS with your public key
// Updated template parameters for better email delivery
(function() {
    emailjs.init("nqLDVniO3BUlQ-e1n");
})();

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    // Initialize flatpickr for appointment date
    const datePicker = flatpickr("#appointment_date", {
        minDate: "today",
        disable: [
            function(date) {
                // Disable Sundays and Mondays
                return date.getDay() === 0 || date.getDay() === 1;
            }
        ],
        locale: {
            "firstDayOfWeek": 1 // Start week on Monday
        }
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;
            }

            try {
                // Get form data
                const formData = {
                    firstName: document.getElementById('client_first_name').value.trim(),
                    lastName: document.getElementById('client_last_name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    gender: document.getElementById('client_gender').value,
                    birthdate: document.getElementById('birthdate').value,
                    preferredDate: document.getElementById('appointment_date').value,
                    preferredTime: document.getElementById('appointment_time').value,
                    tattooType: document.getElementById('tattooType').value,
                    tattooSize: document.getElementById('tattooSize').value,
                    tattooPlacement: document.getElementById('tattooPlacement').value,
                    tattooDescription: document.getElementById('tattooDescription')?.value?.trim() || '',
                    colorPreference: document.getElementById('colorPreference')?.value || 'Not specified',
                    additionalNotes: document.getElementById('additionalNotes')?.value?.trim() || ''
                };

                // Validate required fields
                const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'birthdate', 'preferredDate', 'preferredTime'];
                const missingFields = requiredFields.filter(field => !formData[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                }
                
                // Calculate age
                const birthDate = new Date(formData.birthdate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Check if client is 18 or older
                if (age < 18) {
                    throw new Error('You must be 18 or older to book a tattoo appointment.');
                }

                const bookingId = generateBookingId();
                const formattedDate = new Date(formData.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                try {
                    // Prepare template parameters
                    const shopTemplateParams = {
                        to_name: "Chris",
                        from_name: `${formData.firstName} ${formData.lastName}`,
                        booking_id: bookingId,
                        client_name: `${formData.firstName} ${formData.lastName}`,
                        client_email: formData.email,
                        client_phone: formData.phone,
                        client_gender: formData.gender,
                        client_age: age,
                        appointment_date: formattedDate,
                        appointment_time: formData.preferredTime,
                        tattoo_type: formData.tattooType,
                        tattoo_size: formData.tattooSize,
                        tattoo_placement: formData.tattooPlacement,
                        tattoo_description: formData.tattooDescription || 'Not provided',
                        color_preference: formData.colorPreference || 'Not specified',
                        additional_notes: formData.additionalNotes || 'None',
                        reply_to: formData.email
                    };

                    const clientTemplateParams = {
                        to_name: formData.firstName,
                        from_name: "Inked by Chris",
                        booking_id: bookingId,
                        client_name: `${formData.firstName} ${formData.lastName}`,
                        client_email: formData.email,
                        appointment_date: formattedDate,
                        appointment_time: formData.preferredTime,
                        tattoo_type: formData.tattooType,
                        tattoo_size: formData.tattooSize,
                        tattoo_placement: formData.tattooPlacement,
                        studio_address: "2395 7th St N, Saint Paul, MN 55109",
                        studio_phone: "(651) 592-5122",
                        studio_email: "senghakmad@gmail.com",
                        reply_to: "senghakmad@gmail.com"
                    };

                    // Send notification to shop owner
                    console.log('Sending shop notification...', shopTemplateParams);
                    const shopResponse = await emailjs.send(
                        "service_2e752is",
                        "template_tukgt7p",
                        shopTemplateParams
                    );
                    console.log('Shop notification sent successfully', shopResponse);

                    // Send confirmation to client
                    console.log('Sending client confirmation...', clientTemplateParams);
                    const clientResponse = await emailjs.send(
                        "service_2e752is",
                        "template_gowinjb",
                        clientTemplateParams
                    );
                    console.log('Client confirmation sent successfully', clientResponse);

                    // Show success message
                    const successDiv = document.createElement('div');
                    successDiv.className = 'success-message';
                    successDiv.innerHTML = `
                        <h3>Booking Successful!</h3>
                        <p>Your appointment has been scheduled for ${formattedDate} at ${formData.preferredTime}.</p>
                        <p>A confirmation email has been sent to ${formData.email}.</p>
                        <p>Your booking ID is: ${bookingId}</p>
                        <div class="booking-details">
                            <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Time:</strong> ${formData.preferredTime}</p>
                            <p><strong>Tattoo Type:</strong> ${formData.tattooType}</p>
                            <p><strong>Size:</strong> ${formData.tattooSize}</p>
                            <p><strong>Placement:</strong> ${formData.tattooPlacement}</p>
                        </div>
                        <p class="studio-info">
                            <strong>Studio Location:</strong><br>
                            2395 7th St N<br>
                            Saint Paul, MN 55109
                        </p>
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
                            <p><strong>Booking ID:</strong> ${bookingId}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Time:</strong> ${formData.preferredTime}</p>
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
                    <p>${error.message || 'There was an error processing your booking. Please try again or contact us directly.'}</p>
                    <p><strong>Phone:</strong> (651) 592-5122</p>
                    <p><strong>Email:</strong> senghakmad@gmail.com</p>
                    <button onclick="location.reload()" class="refresh-button">Try Again</button>
                `;
                bookingForm.replaceWith(errorDiv);
            } finally {
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Book Appointment';
                    submitButton.disabled = false;
                }
            }
        });
    }

    // Helper function to generate booking ID
    function generateBookingId() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `IC-${timestamp}-${randomStr}`.toUpperCase();
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
    const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM",
        "1:00 PM", "2:00 PM", "3:00 PM",
        "4:00 PM", "5:00 PM", "6:00 PM"
    ];
    timeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSlotSelect.appendChild(option);
    });
}
