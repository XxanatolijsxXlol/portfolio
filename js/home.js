const gallery = document.getElementById("slider");
const galleryContainer = document.querySelector(".gallery-container");
const loadingSpinner = document.getElementById("loadingSpinner");
const navLeftButton = document.querySelector(".nav-left");
const navRightButton = document.querySelector(".nav-right");

let currentIndex = 0;
let isAnimating = false;
let slideWidth = 0;
let touchStartX = 0;
let touchEndX = 0;
let autoplayInterval = null;
const autoplayDelay = 2000; // 2 seconds between slides

// New image paths structure
const originalImages = [];
// Portrait images (1-11)
for (let i = 1; i <= 11; i++) {
    originalImages.push({
        src: `images/sakum-img/sakumimg${i}.jpg`,
        loaded: false
    });
}
// Landscape images (B1-B3)
for (let i = 1; i <= 3; i++) {
    originalImages.push({
        src: `images/sakum-img/sakumimgB${i}.jpg`,
        loaded: false
    });
}


// Create a copy of the original images array with clones at beginning and end
let images = [];

function init() {
    loadingSpinner.style.display = "block";
    
    // Create true circular array by adding copies at beginning and end
    // Add the last image at the beginning
    images = [
        {...originalImages[originalImages.length - 1]},
        ...originalImages.map(img => ({...img})),
        {...originalImages[0]} // Add the first image at the end
    ];
    
    createSlides();
    
    // Calculate slideWidth after DOM update
    slideWidth = galleryContainer.offsetWidth;
    
    // Start with the first real image (index 1, since index 0 is the clone of the last)
    currentIndex = 1;
    
    initEventListeners();
    preloadImages();
    
    // Initial positioning without animation
    updateSliderPosition(false);
    
    // Start autoplay
    startAutoplay();
    
    window.addEventListener("resize", throttle(() => {
        slideWidth = galleryContainer.offsetWidth;
        updateSliderPosition(false);
    }, 200));
}

function createSlides() {
    gallery.innerHTML = '';

    images.forEach((image, index) => {
        const slide = document.createElement("div");
        slide.classList.add("slide");
        slide.dataset.index = index;

        const img = document.createElement("img");
        img.setAttribute("loading", "lazy");
        
        // Set appropriate alt text based on whether this is a real or clone slide
        if (index === 0) {
            img.alt = `Image ${originalImages.length} (Clone)`;
            img.classList.add('clone');
        } else if (index === images.length - 1) {
            img.alt = `Image 1 (Clone)`;
            img.classList.add('clone');
        } else {
            img.alt = `Image ${index}`;
            img.classList.add('original');
        }

        const fallbackText = document.createElement("div");
        fallbackText.classList.add("no-image");
        fallbackText.textContent = "No Image";
        fallbackText.style.display = "none";

        slide.appendChild(img);
        slide.appendChild(fallbackText);

        img.onload = () => {
            fallbackText.style.display = "none";
            img.style.display = "block";
            image.loaded = true;
            checkAllImagesLoaded();
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${image.src}`);
            fallbackText.style.display = "block";
            img.style.display = "none";
            image.loaded = true;
            checkAllImagesLoaded();
        };

        img.src = image.src;
        gallery.appendChild(slide);
    });

    setTimeout(() => {
        loadingSpinner.style.display = "none";
        galleryContainer.style.pointerEvents = "auto";
    }, 3000);
}

function initEventListeners() {
    navLeftButton.addEventListener("click", () => {
        if (!isAnimating) {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        }
    });

    navRightButton.addEventListener("click", () => {
        if (!isAnimating) {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        }
    });

    galleryContainer.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    galleryContainer.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });

    // Pause autoplay on hover
    galleryContainer.addEventListener("mouseenter", stopAutoplay);
    galleryContainer.addEventListener("mouseleave", startAutoplay);
    
    // Handle loop transition
    gallery.addEventListener("transitionend", handleTransitionEnd);
}

function handleTransitionEnd() {
    if (!isAnimating) return;
    
    isAnimating = false;
    
    // If we've moved to the clone at the beginning, jump to the real last slide
    if (currentIndex === 0) {
        gallery.style.transition = "none";
        currentIndex = originalImages.length; // Index of the last real image
        updateSliderPosition(false);
        void gallery.offsetWidth; // Force reflow
        gallery.style.transition = "transform 0.6s ease";
    }
    // If we've moved to the clone at the end, jump to the real first slide
    else if (currentIndex === images.length - 1) {
        gallery.style.transition = "none";
        currentIndex = 1; // Index of the first real image
        updateSliderPosition(false);
        void gallery.offsetWidth; // Force reflow
        gallery.style.transition = "transform 0.6s ease";
    }
    
    preloadImages();
}

function handleSwipe() {
    if (isAnimating) return;

    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > swipeThreshold) {
        prevSlide();
    } else if (swipeDistance < -swipeThreshold) {
        nextSlide();
    }
}

function preloadImages() {
    // Preload current and next few images
    for (let i = -1; i <= 2; i++) {
        const index = currentIndex + i;
        if (index >= 0 && index < images.length) {
            loadImage(index, true);
        }
    }
}

function loadImage(index, isImmediate = false) {
    const image = images[index];
    const img = document.querySelector(`.slide[data-index="${index}"] img`);

    if (img && !image.loaded) {
        const loadImageSrc = () => {
            img.src = image.src;
        };

        if (isImmediate) {
            loadImageSrc();
        } else {
            setTimeout(loadImageSrc, 200);
        }
    }
}

function checkAllImagesLoaded() {
    const allLoaded = images.some(img => img.loaded);
    if (allLoaded) {
        loadingSpinner.style.display = "none";
        galleryContainer.style.pointerEvents = "auto";
    }
}

function updateSliderPosition(animate = true) {
    const leftPosition = -currentIndex * slideWidth;

    if (animate) {
        gallery.style.transition = "transform 0.6s ease";
    } else {
        gallery.style.transition = "none";
    }

    gallery.style.transform = `translateX(${leftPosition}px)`;
    isAnimating = animate;
}

function prevSlide() {
    if (isAnimating) return;
    
    isAnimating = true;
    currentIndex--;
    updateSliderPosition(true);
}

function nextSlide() {
    if (isAnimating) return;
    
    isAnimating = true;
    currentIndex++;
    updateSliderPosition(true);
}

function startAutoplay() {
    stopAutoplay(); // Clear any existing interval
    autoplayInterval = setInterval(() => {
        nextSlide();
    }, autoplayDelay);
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

init();