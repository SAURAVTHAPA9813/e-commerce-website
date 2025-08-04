// ===== SIMPLE CART MANAGEMENT CLASS =====
class SimpleCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('egardenCart')) || [];
        this.cartElement = document.getElementById('shoppingCart');
        this.overlayElement = document.getElementById('cartOverlay');
        this.cartBody = document.getElementById('cartBody');
        this.cartCount = document.getElementById('cartCount');
        this.itemCount = document.getElementById('itemCount');
        this.subtotalAmount = document.getElementById('subtotalAmount');
        
        this.init();
    }

    init() {
        // Cart trigger
        const cartTrigger = document.getElementById('lg-bag');
        if (cartTrigger) {
            cartTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }

        // Close cart
        const cartClose = document.getElementById('cartClose');
        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }
        
        if (this.overlayElement) {
            this.overlayElement.addEventListener('click', () => this.closeCart());
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeCart();
        });

        // Initialize cart display
        this.updateCartDisplay();
        this.renderCartItems();

        // Attach add to cart listeners
        this.attachAddToCartListeners();
    }

    attachAddToCartListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn') || 
                e.target.dataset.productId || 
                e.target.dataset.productName) {
                
                e.preventDefault();
                
                // Get product data from button attributes
                const productData = {
                    id: e.target.dataset.productId || Date.now(),
                    name: e.target.dataset.productName || 'Product',
                    price: parseFloat(e.target.dataset.productPrice) || 0,
                    image: e.target.dataset.productImage || 'https://via.placeholder.com/200',
                    description: e.target.dataset.productDescription || 'No description'
                };

                // Add visual feedback
                e.target.classList.add('adding');
                setTimeout(() => {
                    e.target.classList.remove('adding');
                    e.target.classList.add('added');
                    setTimeout(() => {
                        e.target.classList.remove('added');
                    }, 1000);
                }, 200);

                // Add to cart
                this.addItem(productData);
            }
        });
    }

    openCart() {
        if (this.cartElement) {
            this.cartElement.classList.add('active');
        }
        if (this.overlayElement) {
            this.overlayElement.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        if (this.cartElement) {
            this.cartElement.classList.remove('active');
        }
        if (this.overlayElement) {
            this.overlayElement.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id == product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
        this.openCart(); // Open cart when item added
    }

    updateQuantity(itemId, change) {
        const item = this.items.find(item => item.id == itemId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
        }
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id != itemId);
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
    }

    updateCartDisplay() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update cart count
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            this.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Update item count
        if (this.itemCount) {
            this.itemCount.textContent = `(${totalItems} item${totalItems !== 1 ? 's' : ''})`;
        }
        
        // Update subtotal
        if (this.subtotalAmount) {
            this.subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        }
    }

    renderCartItems() {
        if (!this.cartBody) return;

        if (this.items.length === 0) {
            this.cartBody.innerHTML = `
                <div class="empty-cart">
                    <i class="fal fa-shopping-bag"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some plants to get started!</p>
                </div>
            `;
            return;
        }

        // Render cart items
        this.cartBody.innerHTML = this.items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
                </div>
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn decrease" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn increase" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="cart.removeItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    saveCart() {
        localStorage.setItem('egardenCart', JSON.stringify(this.items));
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
    }
}

// ===== INITIALIZE CART =====
let cart;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the cart
    cart = new SimpleCart();
    
    console.log('✅ SimpleCart initialized successfully');
});

// ===== CHECKOUT FUNCTION =====
function proceedToCheckout() {
    if (cart && cart.items.length > 0) {
        console.log('Proceeding to checkout with items:', cart.items);
        // Add your checkout logic here
        alert('Proceeding to checkout!');
    } else {
        alert('Your cart is empty!');
    }
}

  