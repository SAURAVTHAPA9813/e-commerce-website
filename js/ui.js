document.addEventListener('DOMContentLoaded', () => {
    // ===== MOBILE MENU FUNCTIONALITY =====
    const menuButton = document.getElementById('menu-button');
    const closeMenuButton = document.getElementById('close-menu');
    const menu = document.getElementById('menu');

    if (menuButton && menu) {
        menuButton.addEventListener('click', () => {
            menu.classList.add('active');
            document.body.classList.add('menu-opened');
            menuButton.style.display = 'none';
        });
    }

    if (closeMenuButton && menu) {
        closeMenuButton.addEventListener('click', () => {
            menu.classList.remove('active');
            document.body.classList.remove('menu-opened');
            if (menuButton) menuButton.style.display = 'block';
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

    // ===== FILTER FUNCTIONALITY =====
    const filterButtons = document.querySelectorAll('.filter-button');
    const mobileFilterToggle = document.querySelector('.mobile-filter-toggle');
    const mobileFilterOverlay = document.querySelector('.mobile-filter-overlay');
    const overlayCloseButton = document.querySelector('.overlay-close-button');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterId = button.dataset.filterId;
            const filterOptions = document.getElementById(filterId);
            document.querySelectorAll('.filter-options.active').forEach(openFilter => {
                if (openFilter.id !== filterId) {
                    openFilter.classList.remove('active');
                    const controllingButton = document.querySelector(`[data-filter-id="${openFilter.id}"]`);
                    if (controllingButton) controllingButton.classList.remove('active');
                }
            });
            if (filterOptions) {
                filterOptions.classList.toggle('active');
                button.classList.toggle('active');
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.filter-group') && !event.target.closest('.mobile-filter-toggle')) {
            document.querySelectorAll('.filter-options.active').forEach(openFilter => {
                openFilter.classList.remove('active');
                const controllingButton = document.querySelector(`[data-filter-id="${openFilter.id}"]`);
                if (controllingButton) controllingButton.classList.remove('active');
            });
        }
    });

    if (mobileFilterToggle && mobileFilterOverlay) {
        mobileFilterToggle.addEventListener('click', () => {
            mobileFilterOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (overlayCloseButton && mobileFilterOverlay) {
        overlayCloseButton.addEventListener('click', () => {
            mobileFilterOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // ===== CART FUNCTIONALITY (MOVED INSIDE DOMContentLoaded) =====
    // Initialize cart array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // DOM Elements - Now safely inside DOMContentLoaded
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartItems = document.getElementById('cart-items');

    // Only set up cart functionality if elements exist
    if (cartSidebar && cartOverlay && cartClose && cartItems) {
        console.log('✅ Cart elements found, initializing cart functionality');

        // Open/Close Cart Functions
        function openCart() {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeCart() {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Event Listeners for cart
        cartClose.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);

        // Update Cart Display
        function updateCartDisplay() {
            const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
            const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            
            // Safely update item count
            const itemCountElement = document.querySelector('.item-count');
            if (itemCountElement) {
                itemCountElement.textContent = `(${itemCount} items)`;
            }
            
            // Safely update subtotal
            const subtotalElement = document.querySelector('.subtotal-amount');
            if (subtotalElement) {
                subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            }
            
            // Render cart items
            renderCartItems();
        }

        function renderCartItems() {
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p>Add some plants to get started!</p>
                    </div>
                `;
                return;
            }
            
            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="item-image">
                        <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="item-variant">${item.variant || ''}</p>
                        <div class="quantity-controls">
                            <button class="qty-btn minus" data-index="${index}">-</button>
                            <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}">
                            <button class="qty-btn plus" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="item-actions">
                        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="remove-item" data-index="${index}">🗑️</button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
        }

        // Cart Actions
        cartItems.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            
            if (e.target.classList.contains('plus')) {
                cart[index].quantity++;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            }
            
            if (e.target.classList.contains('minus')) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartDisplay();
                }
            }
            
            if (e.target.classList.contains('remove-item')) {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            }
        });

        // Handle quantity input changes
        cartItems.addEventListener('input', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const index = parseInt(e.target.dataset.index);
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 1) {
                    cart[index].quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartDisplay();
                }
            }
        });

        // Make cart functions globally available
        window.openCart = openCart;
        window.closeCart = closeCart;
        window.cart = cart;

        // Initialize cart display
        updateCartDisplay();
    } else {
        console.log('⚠️ Cart elements not found on this page, skipping cart initialization');
    }

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

    console.log('✅ UI initialization complete for:', window.location.pathname);
});
