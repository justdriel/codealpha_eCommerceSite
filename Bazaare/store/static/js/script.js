// store/static/js/script.js

const text = "Welcome to Bazaaré";
const heading = document.getElementById("hero-heading");
const subtext = document.getElementById("hero-subtext");
if (heading) { // Check if elements exist before running logic
    heading.textContent = ""; 
    let i = 0;
    function typeEffect() {
        if (i < text.length) {
            heading.textContent += text.charAt(i);
            i++;
            setTimeout(typeEffect, 100); 
        } else {
            if (subtext) subtext.style.opacity = 1;
        }
    }
    window.addEventListener("load", typeEffect);
}


// store/static/js/script.js (Full code block for the slideshow)

const images = [
    // Use absolute paths starting from /static/
    '/static/assets/images/omotayo-tajudeen-8JC6efGda9s-unsplash.jpg',
    '/static/assets/images/qwerqu-mcbrew-qj2pWULDYnE-unsplash.jpg',
    '/static/assets/images/sachin-gawade-eQHlyFbkLtQ-unsplash.jpg'
];

let current = 0;
const container = document.querySelector('.artisan-container');

function showNextImage() {
	if (container) {
    	// Ensure the URL used here is correctly formed.
    	container.style.backgroundImage = `url('${images[current]}')`; 
    	current = (current + 1) % images.length;
	}
}

if (container) {
    setInterval(showNextImage, 4000); 
    showNextImage(); 
}

// ... (Keep the typing effect logic above this block) ...