document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
    const menuButton = document.getElementById("menu-button"); // Button to open the menu
    const closeMenuButton = document.getElementById("close-menu"); // Button to close the menu
  
    // Open the menu
    menuButton.addEventListener("click", () => {
      menu.style.transform = "translateX(0)"; // Slide in the menu
      document.body.classList.add("menu-opened"); // Prevent body scroll
    });
  
    // Close the menu
    closeMenuButton.addEventListener("click", () => {
      menu.style.transform = "translateX(100%)"; // Slide out the menu
      document.body.classList.remove("menu-opened"); // Enable body scroll
    });
  });
  
  window.addEventListener('scroll', function () {
    const menuButton = document.getElementById('menu-button');
    if (window.scrollY > 50) {
      menuButton.classList.add('scrolled');
    } else {
      menuButton.classList.remove('scrolled');
    }
  });
  
  
  const menuButton = document.getElementById('menu-button');
  const menu = document.getElementById('menu');
  const closeButton = document.getElementById('close-menu');
  
  // Show menu and hide menu button
  menuButton.addEventListener('click', function () {
    menu.classList.add('menu-visible');
    document.body.classList.add('menu-opened');
    menuButton.style.display = 'none'; // Hide the menu button
  });
  
  // Hide menu and show menu button
  closeButton.addEventListener('click', function () {
    menu.classList.remove('menu-visible');
    document.body.classList.remove('menu-opened');
    menuButton.style.display = 'block'; // Show the menu button again
  });
  

  document.addEventListener("scroll", function () {
    const header = document.getElementById("main-header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const header = document.getElementById("header");
  
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) { // Adjust the scroll threshold
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      
    });
  });
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.style.display = "block"; // Ensure navbar is visible
  }
  
  function toggleSearchOverlay() {
    const searchOverlay = document.getElementById('search-overlay');
    const navbar = document.querySelector('.header-icons');
  
    if (searchOverlay) {
      if (searchOverlay.classList.contains('hidden')) {
        // Show search overlay and hide navbar (if navbar exists)
        searchOverlay.classList.remove('hidden');
        if (navbar) {
          navbar.classList.add('hidden-navbar');
        }
      } else {
        // Hide search overlay and show navbar (if navbar exists)
        searchOverlay.classList.add('hidden');
        if (navbar) {
          navbar.classList.remove('hidden-navbar');
        }
      }
    } else {
      console.error("Search overlay element not found!");
    }
  }
  
  document.addEventListener("scroll", function () {
    const icons = document.querySelectorAll("#icons i");
    if (window.scrollY > 50) {
      icons.forEach(icon => icon.classList.add("black-icons"));
    } else {
      icons.forEach(icon => icon.classList.remove("black-icons"));
    }
  });
  
  function toggleFilter(filterId) {
    // Get all dropdowns
    const allDropdowns = document.querySelectorAll('.filter-options');
  
    // Close all dropdowns except the clicked one
    allDropdowns.forEach((dropdown) => {
      if (dropdown.id !== filterId) {
        dropdown.style.display = 'none';
      }
    });
  
    // Toggle visibility of the clicked dropdown
    const currentDropdown = document.getElementById(filterId);
    if (currentDropdown) {
      currentDropdown.style.display =
        currentDropdown.style.display === 'block' ? 'none' : 'block';
    }
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.filter-group')) {
      document.querySelectorAll('.filter-options').forEach((dropdown) => {
        dropdown.style.display = 'none';
      });
    }
  });
  function toggleFilters() {
    const filterSection = document.querySelector('.filter-section');
    filterSection.classList.toggle('visible');
    filterSection.classList.toggle('hidden');
  }
  function redirectToSignUp() {
    window.location.href = "signup.html"; // Replace "signup.html" with the actual path to your sign-up page
  }
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.classList.contains("signup-page")) {
        const navbar = document.querySelector(".navbar"); // Adjust selector as needed
        if (navbar) {
            navbar.style.display = "none";
        }
    }
});
