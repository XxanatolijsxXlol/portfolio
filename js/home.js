const gallery = document.getElementById("slider");
const left = document.getElementsByClassName("left")[0];
left.classList.add("disabled");
const right = document.getElementsByClassName("right")[0];
let currentIndex = 0;

// Define your images (15 images total: 5 from each category)
const imageCategories = [
    { category: "gaidibas", images: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg"] },
    { category: "gimenes", images: ["photo1.jpg", "photob2.jpg", "photo6.jpg", "photo4.jpg", "photo5.jpg"] },
    { category: "pari", images: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg"] }
];

// Flatten the image list into a single array with full paths
const images = imageCategories.reduce((acc, category) => {
    const categoryImages = category.images.map(image => `images/${category.category}/${image}`);
    return acc.concat(categoryImages);
}, []);

function init() {
    images.forEach((src, index) => {
        const slide = document.createElement("div");
        slide.classList.add("slide");
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Image ${index + 1}`;
        img.onerror = () => console.error(`Failed to load image: ${src}`);
        img.onload = () => console.log(`Loaded image: ${src}`);
        slide.appendChild(img);
        gallery.appendChild(slide);
    });
    updateSlider();
}

function updateSlider() {
    const slideWidth = gallery.querySelector('.slide').offsetWidth;
    gallery.style.transform = `translateX(-${currentIndex * (slideWidth + 20)}px)`; // 20px accounts for total gap
    left.classList.toggle("disabled", currentIndex === 0);
    right.classList.toggle("disabled", currentIndex >= images.length - 3); // Show 3 images
}

left.onclick = function () {
    if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
    }
};

right.onclick = function () {
    if (currentIndex < images.length - 3) {
        currentIndex++;
        updateSlider();
    }
};

init();

// Preload images to improve performance
images.forEach(src => {
    const preloadImg = new Image();
    preloadImg.src = src;
    preloadImg.onerror = () => console.error(`Preload failed for: ${src}`);
});

// Update slider on window resize
window.addEventListener('resize', updateSlider);