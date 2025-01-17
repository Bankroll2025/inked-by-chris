// Custom cursor
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send this data to your backend
        console.log('Booking request:', data);
        
        // Show success message
        alert('Thank you for your booking request! We will contact you soon.');
        bookingForm.reset();
    });
}

// Dynamic gallery loading
// This function will be used to load and display tattoo images
function loadGalleryImages(images) {
    const gallery = document.querySelector('.gallery-grid');
    if (!gallery) return;

    images.forEach(image => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.description || 'Tattoo artwork';
        
        imgContainer.appendChild(img);
        gallery.appendChild(imgContainer);
    });
}

// Example gallery images (replace with actual images)
const sampleImages = [
    // Add your tattoo images here
    // Example: { url: 'images/tattoo1.jpg', description: 'Custom sleeve design' }
];

// Load images when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadGalleryImages(sampleImages);
});

// Mouse glow effect
document.addEventListener('mousemove', (e) => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty('--mouse-x', `${x}%`);
        section.style.setProperty('--mouse-y', `${y}%`);
    });
});
