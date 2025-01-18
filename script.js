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

// Contact cards interactive glow effect
document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
        const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Add parallax effect to contact background
const contactSection = document.querySelector('.contact-section');
const contactBackground = document.querySelector('.contact-background');

if (contactSection && contactBackground) {
    contactSection.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = contactSection.getBoundingClientRect();
        
        const x = (clientX - left) / width;
        const y = (clientY - top) / height;
        
        const moveX = (x - 0.5) * 20;
        const moveY = (y - 0.5) * 20;
        
        contactBackground.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    contactSection.addEventListener('mouseleave', () => {
        contactBackground.style.transform = 'translate(0, 0)';
    });
}
