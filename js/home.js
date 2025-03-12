const gallery = document.getElementById("slider");
const galleryContainer = document.querySelector(".gallery-container");
const navDotsContainer = document.getElementById("navDots");
const loadingSpinner = document.getElementById("loadingSpinner");
const navLeftButton = document.querySelector(".nav-left");
const navRightButton = document.querySelector(".nav-right");

let currentIndex = 0;
let isAnimating = false;
let slidesPerView = 0;
let slideWidth = 0;
let slideGap = 5; // 2.5px on each side
let originalImagesLength = 0;
let touchStartX = 0;
let touchEndX = 0;
let lastScrollTime = 0;
const scrollCooldown = 500;

const imageCategories = [
    { category: "gaidibas", images: ["photogaidibas1.jpg", "photogaidibas2.jpg", "photogaidibas3.jpg", "photogaidibas4.jpg", "photogaidibas5.jpg"] },
    { category: "gimenes", images: ["photogimenes1.jpg", "photogimenes2.jpg", "photogimenes3.jpg", "photogimenes4.jpg", "photogimenes5.jpg"] },
    { category: "pari", images: ["photopari1.jpg", "photopari2.jpg", "photopari3.jpg", "photopari4.jpg", "photopari5.jpg"] }
];

let images = imageCategories.reduce((acc, category) => {
    const categoryImages = category.images.map(image => ({
        src: `images/${category.category}/${image}`,
        loaded: false
    }));
    return acc.concat(categoryImages);
}, []);

function init() {
    loadingSpinner.style.display = "block";

    originalImagesLength = images.length;
    const clonedBefore = images.map(img => ({ ...img }));
    const clonedAfter = images.map(img => ({ ...img }));
    images = [...clonedBefore, ...images, ...clonedAfter];

    createSlides();

    // Calculate slidesPerView and slideWidth after DOM update
    slidesPerView = getSlidesPerView();
    slideWidth = document.querySelector(".slide").offsetWidth || 600;
    currentIndex = originalImagesLength; // Start at middle set

    createNavigationDots();
    initEventListeners();
    preloadVisibleImages();

    // Initial positioning without animation
    updateSliderPosition(false);
    updateDots();

    window.addEventListener("resize", throttle(() => {
        slidesPerView = getSlidesPerView();
        slideWidth = document.querySelector(".slide").offsetWidth || 600;
        updateSliderPosition(false);
    }, 200));

    // Recalculate dimensions after images load
    gallery.addEventListener("load", () => {
        slidesPerView = getSlidesPerView();
        slideWidth = document.querySelector(".slide").offsetWidth || 600;
        updateSliderPosition(false);
    }, true);
}

function createSlides() {
    gallery.innerHTML = '';

    images.forEach((image, index) => {
        const slide = document.createElement("div");
        slide.classList.add("slide");
        slide.dataset.index = index;

        const img = document.createElement("img");
        img.setAttribute("loading", "lazy");
        img.alt = `Image ${(index % originalImagesLength) + 1}`;

        const fallbackText = document.createElement("div");
        fallbackText.classList.add("no-image");
        fallbackText.textContent = "No Image";
        fallbackText.style.display = "none";

        slide.appendChild(img);
        slide.appendChild(fallbackText);

        img.onload = () => {
            fallbackText.style.display = "none";
            img.style.display = "block";
            images[index].loaded = true;
            checkAllVisibleImagesLoaded();
        };

        img.onerror = () => {
            if (image.src.endsWith('.webp')) {
                const jpgSrc = image.src.replace('.webp', '.jpg');
                console.warn(`WebP not supported, falling back to ${jpgSrc}`);
                img.src = jpgSrc;
            } else {
                fallbackText.style.display = "block";
                img.style.display = "none";
                images[index].loaded = true;
                checkAllVisibleImagesLoaded();
            }
        };

        img.src = image.src;

        gallery.appendChild(slide);
        observer.observe(slide);
    });

    setTimeout(() => {
        loadingSpinner.style.display = "none";
        galleryContainer.style.pointerEvents = "auto";
    }, 5000);
}

function createNavigationDots() {
    navDotsContainer.innerHTML = '';

    for (let i = 0; i < originalImagesLength; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.dataset.index = i;
        dot.addEventListener("click", () => {
            if (isAnimating) return;
            goToSlide(i + originalImagesLength);
        });
        navDotsContainer.appendChild(dot);
    }
}

function initEventListeners() {
    const debouncedPrevSlide = debounce(() => {
        if (!isAnimating) prevSlide();
    }, 300);

    const debouncedNextSlide = debounce(() => {
        if (!isAnimating) nextSlide();
    }, 300);

    navLeftButton.addEventListener("click", debouncedPrevSlide);
    navRightButton.addEventListener("click", debouncedNextSlide);

    galleryContainer.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryContainer.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    galleryContainer.addEventListener("click", (event) => {
        if (isAnimating) return;

        const rect = galleryContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const containerWidth = rect.width;

        if (clickX < containerWidth * 0.3) {
            debouncedPrevSlide();
        } else if (clickX > containerWidth * 0.7) {
            debouncedNextSlide();
        }
    });
}

function isOnCooldown() {
    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return true;
    lastScrollTime = now;
    return false;
}

function handleSwipe() {
    if (isAnimating || isOnCooldown()) return;

    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > swipeThreshold) {
        prevSlide();
    } else if (swipeDistance < -swipeThreshold) {
        nextSlide();
    }
}

function preloadVisibleImages() {
    const buffer = 1;
    const visibleStart = Math.max(0, currentIndex - buffer);
    const visibleEnd = Math.min(images.length, currentIndex + slidesPerView + buffer);

    for (let i = visibleStart; i < visibleEnd; i++) {
        loadImage(i, true);
    }
}

function loadImage(index, isImmediate = false) {
    const image = images[index];
    const img = document.querySelector(`.slide[data-index="${index}"] img`);

    if (img && !img.src.includes(image.src) && !image.loaded) {
        const loadImageSrc = () => {
            img.src = image.src;
            console.log(`Loading image ${index}: ${image.src}`);
        };

        if (isImmediate) {
            loadImageSrc();
        } else {
            setTimeout(() => {
                if (!image.loaded) loadImageSrc();
            }, 500);
        }
    }
}

function checkAllVisibleImagesLoaded() {
    const visibleStart = Math.max(0, currentIndex);
    const visibleEnd = Math.min(images.length, currentIndex + slidesPerView);

    const allLoaded = images.slice(visibleStart, visibleEnd).every(img => img.loaded);
    if (allLoaded) {
        loadingSpinner.style.display = "none";
        galleryContainer.style.pointerEvents = "auto";
    }
}

function updateSliderPosition(animate = true) {
    const totalWidth = slideWidth + slideGap;
    let leftPosition = -(currentIndex * totalWidth);

    if (currentIndex < originalImagesLength) {
        currentIndex = originalImagesLength + (currentIndex % originalImagesLength);
        leftPosition = -(currentIndex * totalWidth);
        gallery.style.transition = "none";
        gallery.style.transform = `translateX(${leftPosition}px)`;
        requestAnimationFrame(() => {
            gallery.style.transition = "transform 0.9s ease";
            requestAnimationFrame(() => {
                currentIndex--;
                updateSliderPosition(true);
            });
        });
        return;
    } else if (currentIndex >= originalImagesLength * 2) {
        currentIndex = originalImagesLength + (currentIndex % originalImagesLength);
        leftPosition = -(currentIndex * totalWidth);
        gallery.style.transition = "none";
        gallery.style.transform = `translateX(${leftPosition}px)`;
        requestAnimationFrame(() => {
            gallery.style.transition = "transform 0.9s ease";
            requestAnimationFrame(() => {
                currentIndex++;
                updateSliderPosition(true);
            });
        });
        return;
    }

    if (animate) {
        gallery.style.transition = "transform 0.9s ease";
    } else {
        gallery.style.transition = "none";
    }

    gallery.style.transform = `translateX(${leftPosition}px)`;
    isAnimating = animate;

    if (animate) {
        gallery.addEventListener("transitionend", () => {
            isAnimating = false;
            preloadVisibleImages();
        }, { once: true });
    } else {
        preloadVisibleImages();
    }
}

function updateDots() {
    const dots = navDotsContainer.querySelectorAll(".dot");
    dots.forEach(dot => dot.classList.remove("active"));
    const activeDot = navDotsContainer.querySelector(`.dot[data-index="${currentIndex % originalImagesLength}"]`);
    if (activeDot) activeDot.classList.add("active");
}

function prevSlide() {
    currentIndex--;
    updateSliderPosition();
    updateDots();
}

function nextSlide() {
    currentIndex++;
    updateSliderPosition();
    updateDots();
}

function goToSlide(index) {
    currentIndex = index;
    updateSliderPosition();
    updateDots();
}

function getSlidesPerView() {
    const containerWidth = galleryContainer.offsetWidth;
    const maxSlideWidth = 600; // Maximum slide width for larger screens
    const minSlideWidth = 300; // Minimum slide width for smaller screens

    // Dynamically calculate slidesPerView based on container width
    if (containerWidth <= 768) {
        // On screens 768px or smaller, show only 1 slide
        slideWidth = containerWidth; // Full width of the container
        return 1;
    } else if (containerWidth <= 1024) {
        // Between 768px and 1024px, show up to 2 slides
        slideWidth = Math.min(containerWidth / 2, maxSlideWidth);
        return Math.max(1, Math.floor(containerWidth / (slideWidth + slideGap)));
    } else {
        // Above 1024px, show up to 3 slides
        slideWidth = Math.min(containerWidth / 3, maxSlideWidth);
        return Math.max(1, Math.floor(containerWidth / (slideWidth + slideGap)));
    }
}

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setTimeout(() => loadImage(index, true), 100);
            observer.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: "200px", threshold: 0.1 });

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