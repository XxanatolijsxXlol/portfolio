document.addEventListener('DOMContentLoaded', function() {
    // Get all images in the grid
    const images = document.querySelectorAll('.image-grid img');

    // Function to check if element is in initial viewport
    function isInInitialViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }
    
 
    // Handle image loading with different behavior for initial visible images
    images.forEach((img, index) => {
        // Check if the image should be initially visible (first few images)
        const shouldBeInitiallyVisible = isInInitialViewport(img) || index < 4;

        if (img.complete) {
            // If image is already loaded from cache
            if (shouldBeInitiallyVisible) {
                img.classList.add('loaded');
            }
        } else {
            // Add loaded class when image finishes loading
            img.addEventListener('load', function() {
                if (shouldBeInitiallyVisible) {
                    img.classList.add('loaded');
                }
            });

            // Handle broken images
            img.addEventListener('error', function() {
                console.error('Image failed to load:', img.src);
                img.style.display = 'none'; // Hide broken images
            });
        }
    });

    // Set up Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 0px',
        threshold: 0.1
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get index for staggered delay
                const index = Array.from(images).indexOf(entry.target);
                const delay = (index % Math.min(images.length, 4)) * 100;

                // Don't add loaded class for initial images (they already have it)
                if (!entry.target.classList.contains('loaded')) {
                    setTimeout(() => {
                        entry.target.classList.add('scroll-visible');
                    }, delay);
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all images for scroll effect
    requestAnimationFrame(() => {
        images.forEach(img => {
            if (!img.classList.contains('loaded')) {
                imageObserver.observe(img);
            }
        });
    });

    // Observe dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IMG' && !node.classList.contains('loaded')) {
                    imageObserver.observe(node);
                }
            });
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
});
