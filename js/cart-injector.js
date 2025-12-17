// cart-injector.js - Automatically adds cart to any page
function injectCartHTML() {
    // Only inject if cart doesn't already exist
    if (document.getElementById('shoppingCart')) return;
    
    const cartHTML = `
     <!-- Cart Overlay -->
    <div class="cart-overlay" id="cartOverlay"></div>

    <!-- Shopping Cart Slider -->
    <div class="shopping-cart" id="shoppingCart">
        <!-- Cart Header -->
        <div class="cart-header">
            <h2 class="cart-title">
                Your Cart
                <span class="item-count" id="itemCount">(0 items)</span>
            </h2>
            <button class="cart-close" id="cartClose">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Cart Body -->
        <div class="cart-body" id="cartBody">
            <div class="empty-cart">
                <i class="fal fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Add some plants to get started!</p>
            </div>
        </div>

        <!-- Cart Footer -->
        <div class="cart-footer">
            <div class="subtotal">
                <span class="subtotal-label">Subtotal</span>
                <span class="subtotal-amount" id="subtotalAmount">$0.00</span>
            </div>
            <button class="checkout-btn" onclick="proceedToCheckout()">
                Secure Checkout
            </button>
        </div>
    </div>
    `;
    
    // Inject at end of body
    document.body.insertAdjacentHTML('beforeend', cartHTML);

    // Bind checkout button defensively, even if cart.js not loaded yet
    const secureBtn = document.querySelector('.checkout-btn');
    if (secureBtn && !secureBtn.__bound) {
        secureBtn.__bound = true;
        secureBtn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                const items = (window.cart && Array.isArray(window.cart.items))
                    ? window.cart.items
                    : JSON.parse(localStorage.getItem('cart') || '[]');
                localStorage.setItem('cart', JSON.stringify(items || []));
            } catch {}
            if (typeof window.proceedToCheckout === 'function') {
                window.proceedToCheckout();
            } else {
                window.location.href = 'cart.html';
            }
        });
    }
}

// Auto-inject when page loads
document.addEventListener('DOMContentLoaded', injectCartHTML);
