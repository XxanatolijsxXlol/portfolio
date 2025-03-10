document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const backdrop = document.querySelector('.backdrop');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        backdrop.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    backdrop.addEventListener('click', function() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Mobile dropdown toggle
    if (window.innerWidth <= 768) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            dropdown.classList.toggle('active');
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });
        } else {
            // Remove event listener for larger screens
            dropdownToggle.removeEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });
        }
    });
});

   // Load navbar.html into the #navbar element
   fetch('navbar.html')
   .then(response => response.text())
   .then(data => {
       document.getElementById('navbar').innerHTML = data;
   })
   .catch(error => console.error('Error loading navbar:', error));
