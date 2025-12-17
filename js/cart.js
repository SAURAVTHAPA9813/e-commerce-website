// ===== FIXED CART MANAGEMENT CLASS =====
class SimpleCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
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
        
        console.log('Cart initialized with', this.items.length, 'items');
    }

    attachAddToCartListeners() {
        // Use event delegation for dynamically added buttons
        document.addEventListener('click', (e) => {
            // Check if clicked element or its parent is an add-to-cart button
            const button = e.target.closest('.add-to-cart-btn');
            
            if (button && (button.dataset.productId || button.dataset.productName)) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Add to cart button clicked');
                
                // Get all product data from button attributes
                const productData = {
                    id: button.dataset.productId || Date.now().toString(),
                    name: button.dataset.productName || 'Product',
                    price: parseFloat(button.dataset.productPrice) || 0,
                    image: button.dataset.productImage || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-size='16' font-family='Arial'>No Image</text></svg>",
                    description: button.dataset.productDescription || '',
                    category: button.dataset.productCategory || '',
                    plant_type: button.dataset.productPlantType || '',
                    care_level: button.dataset.productCareLevel || '',
                    size: button.dataset.productSize || '',
                    light_needs: button.dataset.productLightNeeds || '',
                    material: button.dataset.productMaterial || '',
                    tool_type: button.dataset.productToolType || ''
                };

                console.log('Product data:', productData);

                // Add visual feedback
                button.classList.add('adding');
                button.textContent = 'Adding...';
                
                setTimeout(() => {
                    button.classList.remove('adding');
                    button.classList.add('added');
                    button.textContent = 'Added!';
                    
                    setTimeout(() => {
                        button.classList.remove('added');
                        button.textContent = 'Add to Cart';
                    }, 1000);
                }, 200);

                // Add to cart
                this.addItem(productData);
            }
        });
    }

    openCart() {
        console.log('Opening cart...');
        if (this.cartElement) {
            this.cartElement.classList.add('active');
        }
        if (this.overlayElement) {
            this.overlayElement.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        console.log('Closing cart...');
        if (this.cartElement) {
            this.cartElement.classList.remove('active');
        }
        if (this.overlayElement) {
            this.overlayElement.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    addItem(product) {
        console.log('Adding item to cart:', product);
        
        const existingItem = this.items.find(item => item.id == product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Increased quantity for existing item');
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
            console.log('Added new item to cart');
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
        
        // FIXED: Open cart after 500ms instead of 5000ms (5 seconds)
        setTimeout(() => {
            this.openCart();
        }, 500);
    }

    updateQuantity(itemId, change) {
        console.log('Updating quantity for item:', itemId, 'Change:', change);
        const item = this.items.find(item => item.id == itemId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
        }
    }

    updateQuantityInput(itemId, newQuantity) {
        const item = this.items.find(item => item.id == itemId);
        if (item) {
            const qty = Math.max(1, parseInt(newQuantity) || 1);
            item.quantity = qty;
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
        }
    }

    removeItem(itemId) {
        console.log('Removing item:', itemId);
        this.items = this.items.filter(item => item.id != itemId);
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
    }

    updateCartDisplay() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        console.log('Cart totals - Items:', totalItems, 'Subtotal:', subtotal);
        
        // Update cart count badge
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            this.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Update item count text
        if (this.itemCount) {
            this.itemCount.textContent = `(${totalItems} item${totalItems !== 1 ? 's' : ''})`;
        }
        
        // Update subtotal
        if (this.subtotalAmount) {
            this.subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        }
    }

    renderCartItems() {
        if (!this.cartBody) {
            console.warn('Cart body element not found');
            return;
        }

        if (this.items.length === 0) {
            this.cartBody.innerHTML = `
                <div class="empty-cart" style="text-align: center; padding: 40px 20px;">
                    <i class="fal fa-shopping-bag" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">Your cart is empty</h3>
                    <p style="color: #666;">Add some plants or tools to get started!</p>
                </div>
            `;
            return;
        }

        console.log('Rendering', this.items.length, 'cart items');

        // Render cart items with all details
        this.cartBody.innerHTML = this.items.map(item => {
            const itemDetails = [];
            
            // Add relevant details based on item type
            if (item.size) itemDetails.push(`Size: ${item.size}`);
            if (item.care_level) itemDetails.push(`Care: ${item.care_level}`);
            if (item.material) itemDetails.push(`Material: ${item.material}`);
            if (item.tool_type) itemDetails.push(`Type: ${item.tool_type.replace('-', ' ')}`);
            
            return `
                <div class="cart-item" data-item-id="${item.id}" style="display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #eee;">
                    <div class="item-image" style="width: 80px; height: 80px; flex-shrink: 0;">
                        <img src="${item.image}" alt="${item.name}" 
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                             onerror="this.src='data:image/svg+xml;utf8,&lt;svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'&gt;&lt;rect width=\'100%\' height=\'100%\' fill=\'%23e9ecef\'/&gt;&lt;text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236c757d\' font-size=\'12\' font-family=\'Arial\'&gt;No Image&lt;/text&gt;&lt;/svg&gt;'">
                    </div>
                    <div class="item-details" style="flex: 1; min-width: 0;">
                        <h4 class="item-name" style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${item.name}</h4>
                        <p class="item-price" style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #28a745;">
                            $${(item.price * item.quantity).toFixed(2)}
                        </p>
                        ${itemDetails.length > 0 ? `
                            <div class="item-meta" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px;">
                                ${itemDetails.map(detail => `
                                    <span style="font-size: 12px; color: #666; background: #f5f5f5; padding: 2px 8px; border-radius: 10px;">
                                        ${detail}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="item-actions" style="display: flex; align-items: center; gap: 10px;">
                            <div class="quantity-controls" style="display: flex; align-items: center; gap: 8px; background: #f5f5f5; padding: 5px; border-radius: 20px;">
                                <button class="qty-btn decrease" onclick="cart.updateQuantity('${item.id}', -1)"
                                        style="width: 24px; height: 24px; border: none; background: white; border-radius: 50%; cursor: pointer; font-weight: bold;">-</button>
                                <span class="quantity" style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                                <button class="qty-btn increase" onclick="cart.updateQuantity('${item.id}', 1)"
                                        style="width: 24px; height: 24px; border: none; background: white; border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
                            </div>
                            <button class="remove-item" onclick="cart.removeItem('${item.id}')"
                                    style="border: none; background: none; color: #dc3545; cursor: pointer; padding: 5px 10px;">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        console.log('Cart saved to localStorage:', this.items);
    }

    clearCart() {
        console.log('Clearing cart');
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
    }
}

// ===== INITIALIZE CART =====
let cart;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        cart = new SimpleCart();
        window.cart = cart; // Make it globally accessible
        console.log('✅ SimpleCart initialized successfully');
    }, 100);
});

// ===== CHECKOUT FUNCTION =====
function proceedToCheckout() {
    if (!cart || cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    try {
        localStorage.setItem('cart', JSON.stringify(cart.items));
        const cartEl = document.getElementById('shoppingCart');
        const overlayEl = document.getElementById('cartOverlay');
        if (cartEl) cartEl.classList.remove('active');
        if (overlayEl) overlayEl.classList.remove('active');
    } catch {}
    window.location.href = 'cart.html';
}

// Add some basic styling for cart buttons
const style = document.createElement('style');
style.textContent = `
    .add-to-cart-btn {
        transition: all 0.3s ease;
    }
    
    .add-to-cart-btn.adding {
        background: #ffc107 !important;
        transform: scale(0.95);
    }
    
    .add-to-cart-btn.added {
        background: #28a745 !important;
        transform: scale(1.05);
    }
    
    .qty-btn:hover {
        background: #e8e8e8 !important;
    }
    
    .remove-item:hover {
        color: #c82333 !important;
    }
`;
document.head.appendChild(style);
