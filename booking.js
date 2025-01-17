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
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');

            // Show loading state
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Get form values
            const name = bookingForm.querySelector('input[name="name"]').value;
            const email = bookingForm.querySelector('input[name="email"]').value;
            const phone = bookingForm.querySelector('input[name="phone"]').value;
            const date = bookingForm.querySelector('input[name="date"]').value;
            const time = bookingForm.querySelector('select[name="timeSlot"]').value;
            const description = bookingForm.querySelector('textarea[name="description"]').value;

            // Create template parameters
            const templateParams = {
                from_name: name,
                from_email: email,
                phone: phone,
                date: date,
                time: time,
                message: description
            };

            console.log('Sending email with params:', templateParams);

            // Send email using EmailJS
            emailjs.send('service_3pilkcs', 'template_otj2ita', templateParams)
                .then(function(response) {
                    console.log('Email sent successfully:', response);
                    // Show success message
                    alert('Booking request sent successfully! We will contact you shortly to confirm your appointment.');
                    bookingForm.reset();
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                })
                .catch(function(error) {
                    console.error('EmailJS error:', error);
                    // Show error message
                    alert('Sorry, there was an error sending your booking request. Please try again or contact us directly.');
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
        });
    } else {
        console.error('Booking form not found');
    }
});
