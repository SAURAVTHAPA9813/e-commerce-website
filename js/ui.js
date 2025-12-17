// Show loading message
const productGrid = document.getElementById('productGrid');
if (productGrid) {
    productGrid.innerHTML = '<p>Loading products...</p>';
}
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const closeMenuButton = document.getElementById('close-menu');
    const menu = document.getElementById('menu');

    if (menuButton && menu) {
        menuButton.addEventListener('click', () => {
            menu.classList.add('active');
            document.body.classList.add('menu-opened');
            // Removed: menuButton.style.display = 'none';
        });
    }

    if (closeMenuButton && menu) {
        closeMenuButton.addEventListener('click', () => {
            menu.classList.remove('active');
            document.body.classList.remove('menu-opened');
            // Removed: menuButton.style.display = 'block';
        });
    }

    const mobileNavLinks = document.querySelectorAll('#navbar-mobile a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menu) menu.classList.remove('active');
        });
    });


    // ===== SEARCH OVERLAY FUNCTIONALITY =====
    window.toggleSearchOverlay = function () {
        const searchOverlay = document.getElementById("search-overlay");
        const searchInput = searchOverlay?.querySelector(".search-input");

        if (!searchOverlay) return;

        const isActive = searchOverlay.classList.contains("active");

        if (isActive) {
            searchOverlay.classList.remove("active");
            searchOverlay.classList.add("hidden");
            document.body.style.overflow = '';
            if (searchInput) searchInput.value = '';
        } else {
            searchOverlay.classList.remove("hidden");
            searchOverlay.classList.add("active");
            document.body.style.overflow = 'hidden';
            if (searchInput) searchInput.focus();
        }
    };

    document.addEventListener('click', (event) => {
        const searchOverlay = document.getElementById("search-overlay");
        const isSearchOpen = searchOverlay?.classList.contains("active");
        const isClickInside = event.target.closest("#search-overlay");
        const isSearchIcon = event.target.closest("#search-icon");

        if (isSearchOpen && !isClickInside && !isSearchIcon) {
            toggleSearchOverlay();
        }
    });

    // ===== SEARCH SUBMIT (site-wide) =====
    const globalSearchInput = document.querySelector('.search-input');
    const globalSearchButton = document.getElementById('search-submit-button');
    const handleGlobalSearch = () => {
        const term = (document.querySelector('.search-input')?.value || '').trim();
        if (!term) return;
        if (window.productManager && typeof window.productManager.performSearch === 'function') {
            window.productManager.performSearch(term);
        } else {
            const q = encodeURIComponent(term);
            window.location.href = `search.html?q=${q}`;
        }
    };
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleGlobalSearch();
            }
        });
    }
    if (globalSearchButton) {
        globalSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleGlobalSearch();
        });
    }

    // Trending items fallback
    document.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', () => {
            const term = item.dataset.searchTerm || item.textContent.trim();
            if (!term) return;
            if (window.productManager && typeof window.productManager.performSearch === 'function') {
                window.productManager.performSearch(term);
            } else {
                window.location.href = `search.html?q=${encodeURIComponent(term)}`;
            }
        });
    });

    // ===== UTILITY FUNCTIONS =====
    function showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => errorElement.style.display = 'none', 5000);
        }
        const successElement = document.getElementById('success-message');
        if (successElement) successElement.style.display = 'none';
    }

    function showSuccess(message) {
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
        const errorElement = document.getElementById('error-message');
        if (errorElement) errorElement.style.display = 'none';
    }

    // Make utility functions global
    window.showError = showError;
    window.showSuccess = showSuccess;

    // ===== NAVBAR DISPLAY =====
    const navbar = document.getElementById("navbar");
    if (navbar) navbar.style.display = "block";

    console.log('UI initialization complete for:', window.location.pathname);
});

