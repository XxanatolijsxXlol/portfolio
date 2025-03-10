const gallery = document.getElementById("slider");
const left = document.getElementsByClassName("left")[0];
left.classList.add("disabled");
const right = document.getElementsByClassName("right")[0];
let currentIndex = 0;

// Define your images
const imageCategories = [
    { category: "gaidibas", images: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg"] },
    { category: "gimenes", images: ["photo1.jpg", "photob2.jpg", "photo6.jpg", "photo4.jpg", "photo5.jpg"] },
    { category: "pari", images: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg"] }
];

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
        img.setAttribute("width", "504"); // Example width, adjust based on resize
        img.setAttribute("height", "756"); // Example height, adjust based on resize
        slide.appendChild(img);
        gallery.appendChild(slide);
    });
    updateSlider();
}

function updateSlider() {
    gallery.style.transform = `translateX(-${currentIndex * 50}%)`;
    left.classList.toggle("disabled", currentIndex === 0);
    right.classList.toggle("disabled", currentIndex === images.length - 1);
}

left.onclick = function () {
    if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
    }
};

right.onclick = function () {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        updateSlider();
    }
};

init();
// Preload images
images.forEach(src => {
    const preloadImg = new Image();
    preloadImg.src = src;
});