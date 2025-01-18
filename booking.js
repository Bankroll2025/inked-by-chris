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

    // Initialize Flatpickr calendar
    const datePicker = flatpickr("#datePicker", {
        minDate: "today",
        maxDate: new Date().fp_incr(30),
        disable: [
            function(date) {
                return date.getDay() === 0 || date.getDay() === 1;
            }
        ],
        locale: {
            firstDayOfWeek: 1
        },
        onChange: function(selectedDates, dateStr) {
            updateAvailableTimeSlots(dateStr);
        }
    });

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

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;

            try {
                const bookingId = generateBookingId();
                const formData = new FormData(this);
                
                // Get all form data
                const data = {
                    clientName: formData.get('client_name'),
                    clientEmail: formData.get('client_email'),
                    clientPhone: formData.get('client_phone'),
                    clientGender: formData.get('client_gender'),
                    clientBirthdate: formData.get('client_birthdate'),
                    preferredDate: formData.get('preferred_date'),
                    preferredTime: formData.get('preferred_time'),
                    tattooType: formData.get('tattooType'),
                    tattooSize: formData.get('tattooSize'),
                    tattooPlacement: formData.get('tattooPlacement'),
                    tattooDescription: formData.get('tattooDescription'),
                    colorPreference: formData.get('colorPreference') || 'Not specified',
                    additionalNotes: formData.get('additionalNotes') || 'None',
                    bookingId: bookingId,
                    isReschedule: rescheduleId ? true : false,
                    originalBookingId: rescheduleId || bookingId
                };

                // Calculate age
                const birthDate = new Date(data.clientBirthdate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Format date for display
                const formattedDate = new Date(data.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                try {
                    console.log('Preparing to send emails...');

                    // Prepare template parameters
                    const shopTemplateParams = {
                        to_name: "Chris",
                        from_name: data.clientName,
                        message: `New Booking Request\n\nClient Information:\nName: ${data.clientName}\nEmail: ${data.clientEmail}\nPhone: ${data.clientPhone}\n\nAppointment Details:\nDate: ${formattedDate}\nTime: ${data.preferredTime}\n\nTattoo Details:\nType: ${data.tattooType}\nSize: ${data.tattooSize}\nPlacement: ${data.tattooPlacement}\nDescription: ${data.tattooDescription}`,
                        reply_to: data.clientEmail
                    };

                    const clientTemplateParams = {
                        to_name: data.clientName,
                        from_name: "Inked by Chris",
                        message: `Your tattoo appointment has been confirmed!\n\nAppointment Details:\nDate: ${formattedDate}\nTime: ${data.preferredTime}\n\nTattoo Details:\nType: ${data.tattooType}\nSize: ${data.tattooSize}\nPlacement: ${data.tattooPlacement}`,
                        reply_to: "senghakmad@gmail.com"
                    };

                    console.log('Shop template params:', shopTemplateParams);
                    console.log('Client template params:', clientTemplateParams);

                    try {
                        // Send notification to shop
                        console.log('Sending shop notification...');
                        const shopResponse = await emailjs.send(
                            "service_2e752is",
                            "template_tukgt7p",
                            shopTemplateParams
                        );
                        console.log('Shop notification response:', shopResponse);

                        // Send confirmation to client
                        console.log('Sending client confirmation...');
                        const clientResponse = await emailjs.send(
                            "service_2e752is",
                            "template_gowinjb",
                            clientTemplateParams
                        );
                        console.log('Client confirmation response:', clientResponse);

                        // Show success message
                        const successDiv = document.createElement('div');
                        successDiv.className = 'success-message';
                        successDiv.innerHTML = `
                            <h3>${data.isReschedule ? 'Appointment Rescheduled!' : 'Booking Confirmed!'}</h3>
                            <p>Thank you for choosing Inked by Chris!</p>
                            
                            <div class="confirmation-details">
                                <h4>Appointment Details</h4>
                                <ul>
                                    <li><strong>Date:</strong> ${formattedDate}</li>
                                    <li><strong>Time:</strong> ${data.preferredTime}</li>
                                    <li><strong>Booking ID:</strong> ${data.originalBookingId}</li>
                                </ul>
                                
                                <h4>Tattoo Details</h4>
                                <ul>
                                    <li><strong>Type:</strong> ${data.tattooType}</li>
                                    <li><strong>Size:</strong> ${data.tattooSize}</li>
                                    <li><strong>Placement:</strong> ${data.tattooPlacement}</li>
                                    <li><strong>Color Preference:</strong> ${data.colorPreference}</li>
                                </ul>
                                
                                <h4>Your Information</h4>
                                <ul>
                                    <li><strong>Name:</strong> ${data.clientName}</li>
                                    <li><strong>Email:</strong> ${data.clientEmail}</li>
                                    <li><strong>Phone:</strong> ${data.clientPhone}</li>
                                </ul>
                            </div>
                            
                            <div class="next-steps">
                                <h4>What's Next?</h4>
                                <ol>
                                    <li>Check your email for detailed appointment information</li>
                                    <li>Save your booking ID: ${data.originalBookingId}</li>
                                    <li>Mark your calendar for ${formattedDate} at ${data.preferredTime}</li>
                                </ol>
                            </div>
                            
                            <div class="appointment-actions">
                                <h4>Manage Your Appointment</h4>
                                <div class="action-buttons">
                                    <a href="/?reschedule=${data.originalBookingId}#booking" class="reschedule-btn">Reschedule Appointment</a>
                                    <a href="/cancel.html?id=${data.originalBookingId}" class="cancel-btn">Cancel Appointment</a>
                                </div>
                            </div>
                            
                            <div class="booking-options">
                                <button onclick="window.location.reload()" class="book-another-btn">Book Another Appointment</button>
                                <button onclick="window.location.href='index.html'" class="home-btn">Return to Homepage</button>
                            </div>`;
                        
                        bookingForm.innerHTML = '';
                        bookingForm.appendChild(successDiv);

                    } catch (emailError) {
                        console.error('Email error details:', emailError);
                        throw new Error(`Email sending failed: ${emailError.message || 'Unknown error'}`);
                    }

                } catch (error) {
                    console.error('Full error details:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.innerHTML = `
                        <h3>Booking Error</h3>
                        <p>Sorry, there was an error processing your booking: ${error.message}</p>
                        <p>Please try again or contact us directly:</p>
                        <p><strong>Email:</strong> senghakmad@gmail.com</p>
                        <p><strong>Phone:</strong> (651) 592-5122</p>
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
                    <p><strong>Email:</strong> senghakmad@gmail.com</p>
                    <p><strong>Phone:</strong> (651) 592-5122</p>
                    <div class="booking-options">
                        <button onclick="window.location.reload()" class="retry-btn">Try Again</button>
                        <button onclick="window.location.href='index.html'" class="home-btn">Return to Homepage</button>
                    </div>`;
                
                submitButton.parentNode.insertBefore(errorDiv, submitButton);
                submitButton.style.display = 'none';
            }
        });
    }
});

function generateBookingId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `BK${timestamp}${random}`.toUpperCase();
}

function updateAvailableTimeSlots(selectedDate) {
    // You can implement logic here to show/hide time slots based on availability
    // For now, it just shows all time slots
}
