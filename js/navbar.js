// Function to set up event listeners
function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const backdrop = document.querySelector('.backdrop');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Check if required elements exist
    if (!hamburger || !nav || !backdrop) {
        console.error('One or more required elements (.hamburger, nav, .backdrop) are missing in the DOM.');
        return;
    }

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
}

// Load navbar and footer, then set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Fetch navbar
    fetch('/portfolio/navbar.html') // Adjust path if needed
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load navbar.html');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            // Set up event listeners after navbar is loaded
            setupEventListeners();
        })
        .catch(error => console.error('Error loading navbar:', error));

    // Fetch footer
    fetch('/portfolio/footer.html') // Adjust path if needed
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load footer.html');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
});