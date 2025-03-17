document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const backdrop = document.querySelector('.backdrop');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const dropdowns = document.querySelectorAll('.dropdown');

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
    function handleDropdownClick(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            // Find the parent dropdown element
            const dropdown = this.closest('.dropdown');
            
            // Close all other dropdowns
            dropdowns.forEach(item => {
                if (item !== dropdown) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
        }
    }

    // Add click event to all dropdown toggles
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', handleDropdownClick);
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        // Close all dropdowns when resizing
        if (window.innerWidth > 768) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Close mobile menu and dropdowns when clicking on a link
    const navLinks = document.querySelectorAll('nav a:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Close mobile menu
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
            
            // Close all dropdowns
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        // Check if click is outside dropdown
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Prevent dropdown menu clicks from closing the dropdown
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach(menu => {
        menu.addEventListener('click', function(e) {
            if (window.innerWidth > 768) {
                e.stopPropagation();
            }
        });
    });
});

// If you're including navbar.html via fetch in other pages
if (document.getElementById('navbar')) {
    fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
        
        // Re-initialize JavaScript after loading navbar
        const scriptElement = document.createElement('script');
        scriptElement.src = 'navbar.js';
        document.body.appendChild(scriptElement);
    })
    .catch(error => console.error('Error loading navbar:', error));
}