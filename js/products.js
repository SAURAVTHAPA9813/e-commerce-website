// products.js - FIXED VERSION with correct backend URLs
document.addEventListener('DOMContentLoaded', () => {
    // Use centralized API_BASE from config.js
    const BACKEND_BASE = (window.API_BASE || '').replace(/\/$/, '');

    const backendApiUrl = BACKEND_BASE + '/filters.php';
    const backendProductsUrl = BACKEND_BASE + '/products.php';
    
    const productGrid = document.getElementById('productGrid');
    const newArrivalsContainer = document.getElementById('new');
    const scrollContainer = document.getElementById('scroll_container');
    
    // Detect if we're on tools page or plants page
    const isToolsPage = productGrid && productGrid.dataset.productType === 'tools';
    const productType = isToolsPage ? 'tool' : 'plant';

    console.log('Page type detected:', productType);
    console.log('Backend URL:', backendApiUrl);

    // Unified Product Manager Class
    class UnifiedProductManager {
        constructor(type) {
            this.productType = type;
            
            if (type === 'tool') {
                this.filters = {
                    toolType: [],
                    material: [],
                    size: [],
                    priceRange: [],
                    search: ''
                };
            } else {
                this.filters = {
                    plantType: [],
                    lightNeeds: [],
                    careLevel: [],
                    specialFeatures: [],
                    size: [],
                    priceRange: [],
                    search: ''
                };
            }
            
            this.currentPage = 1;
            this.productsPerPage = 8;
            this.sortBy = '';
            
            this.init();
        }

        async init() {
            console.log('Initializing product manager for:', this.productType);
            await this.loadProducts();
            this.setupFilterListeners();
            this.setupSearchListeners();
            // Note: Sort and mobile filter handlers are now in filters-ui.js to avoid duplicates
        }

        async fetchJson(url) {
            console.log('Fetching URL:', url);
            try {
                const res = await fetch(url, { 
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                });
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const text = await res.text();
                
                try {
                    const data = JSON.parse(text);
                    return { ok: res.ok, status: res.status, data };
                } catch (e) {
                    console.error('Non-JSON response from API', { url, status: res.status, text: text.substring(0, 200) });
                    throw new Error(`API returned non-JSON (status ${res.status})`);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        }

        async fetchWithFallback(params) {
            // Try filters.php first; if it fails, try products.php
            const url1 = `${backendApiUrl}?${params}`;
            try {
                const result = await this.fetchJson(url1);
                console.log('filters.php response:', result);
                return result;
            } catch (e1) {
                console.warn('filters.php failed, trying products.php', e1);
                const url2 = `${backendProductsUrl}?${params}`;
                try {
                    const result = await this.fetchJson(url2);
                    console.log('products.php response:', result);
                    return result;
                } catch (e2) {
                    console.error('Both endpoints failed:', e1, e2);
                    throw new Error('Both API endpoints failed. Please check backend connection.');
                }
            }
        }

        setupFilterListeners() {
            console.log('Setting up filter listeners...');

            // NOTE: Filter button click handlers are in filters-ui.js to avoid duplicate event listeners
            // Only setup checkbox change listeners here for auto-apply functionality
            this.setupCheckboxListeners();
        }

        // NOTE: toggleFilterDropdown and closeAllDropdowns methods removed
        // Dropdown management is now handled by filters-ui.js to avoid conflicts

        setupCheckboxListeners() {
            console.log('Setting up checkbox listeners for:', this.productType);
            
            let filterMapping = {};
            
            if (this.productType === 'tool') {
                filterMapping = {
                    'tool-type': 'toolType',
                    'material': 'material',
                    'size': 'size',
                    'price': 'priceRange',
                    'tool-type-mobile': 'toolType',
                    'material-mobile': 'material',
                    'size-mobile': 'size',
                    'price-mobile': 'priceRange'
                };
            } else {
                filterMapping = {
                    'plant-type': 'plantType',
                    'light-needs': 'lightNeeds',
                    'care-level': 'careLevel',
                    'special-features': 'specialFeatures',
                    'size': 'size',
                    'plant-size': 'size',
                    'price': 'priceRange',
                    'plant-type-mobile': 'plantType',
                    'light-needs-mobile': 'lightNeeds',
                    'care-level-mobile': 'careLevel',
                    'special-features-mobile': 'specialFeatures',
                    'size-mobile': 'size',
                    'plant-size-mobile': 'size',
                    'price-mobile': 'priceRange'
                };
            }

            console.log('Filter mapping:', filterMapping);

            // Setup checkboxes with proper event delegation
            Object.keys(filterMapping).forEach(filterId => {
                const filterElement = document.getElementById(filterId);
                if (filterElement) {
                    console.log('Found filter element:', filterId);
                    filterElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                        checkbox.addEventListener('change', (e) => {
                            console.log('Checkbox changed:', filterId, checkbox.value, checkbox.checked);
                            this.updateFilters();
                            // Auto-apply on desktop
                            if (!filterId.includes('-mobile')) {
                                this.applyFilters();
                            }
                        });
                    });
                } else {
                    console.warn('Filter element not found:', filterId);
                }
            });
        }

        setupSearchListeners() {
            const searchInput = document.querySelector('.search-input');
            const searchButton = document.getElementById('search-submit-button');
            
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch(searchInput.value);
                    }
                });
            }
            
            if (searchButton) {
                searchButton.addEventListener('click', () => {
                    const input = document.querySelector('.search-input');
                    if (input) this.performSearch(input.value);
                });
            }

            document.querySelectorAll('.trending-item').forEach(item => {
                item.addEventListener('click', () => {
                    const searchTerm = item.dataset.searchTerm;
                    this.performSearch(searchTerm);
                });
            });
        }

        performSearch(searchTerm) {
            console.log('Performing search:', searchTerm);
            this.filters.search = searchTerm;
            this.applyFilters();
            
            const searchOverlay = document.getElementById('search-overlay');
            if (searchOverlay) {
                searchOverlay.classList.remove('active');
                searchOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }

        updateFilters() {
            console.log('Updating filters...');
            
            // Clear existing filters
            Object.keys(this.filters).forEach(key => {
                if (Array.isArray(this.filters[key])) {
                    this.filters[key] = [];
                }
            });

            if (this.productType === 'tool') {
                const filterSelectors = {
                    'toolType': ['#tool-type', '#tool-type-mobile'],
                    'material': ['#material', '#material-mobile'],
                    'size': ['#size', '#size-mobile'],
                    'priceRange': ['#price', '#price-mobile']
                };
                this.collectFilters(filterSelectors);
            } else {
                const filterSelectors = {
                    'plantType': ['#plant-type', '#plant-type-mobile'],
                    'lightNeeds': ['#light-needs', '#light-needs-mobile'],
                    'careLevel': ['#care-level', '#care-level-mobile'],
                    'specialFeatures': ['#special-features', '#special-features-mobile'],
                    'size': ['#size', '#plant-size', '#size-mobile', '#plant-size-mobile'],
                    'priceRange': ['#price', '#price-mobile']
                };
                this.collectFilters(filterSelectors);
            }
            
            console.log('Current filters:', this.filters);
        }

        collectFilters(filterSelectors) {
            Object.keys(filterSelectors).forEach(filterKey => {
                const selectors = filterSelectors[filterKey];
                selectors.forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.querySelectorAll('input:checked').forEach(cb => {
                            if (!this.filters[filterKey].includes(cb.value)) {
                                this.filters[filterKey].push(cb.value);
                            }
                        });
                    }
                });
            });
        }

        clearAllFilters() {
            console.log('Clearing all filters');
            
            Object.keys(this.filters).forEach(key => {
                if (Array.isArray(this.filters[key])) {
                    this.filters[key] = [];
                } else {
                    this.filters[key] = '';
                }
            });

            document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });

            document.querySelectorAll('#sort-select, #sort-select-mobile').forEach(select => {
                if (select) select.value = '';
            });

            document.querySelectorAll('.search-input').forEach(input => {
                input.value = '';
            });

            this.sortBy = '';
            this.applyFilters();
        }

        async loadProducts() {
            try {
                const params = new URLSearchParams();
                const action = this.productType === 'tool' ? 'getFilteredTools' : 'getFilteredProducts';
                params.append('action', action);
                
                console.log('Loading products with action:', action);
                console.log('Current filters:', this.filters);
                
                // Add active filters to params
                Object.keys(this.filters).forEach(key => {
                    if (Array.isArray(this.filters[key]) && this.filters[key].length > 0) {
                        this.filters[key].forEach(value => {
                            params.append(`${key}[]`, value);
                        });
                    } else if (this.filters[key] && typeof this.filters[key] === 'string') {
                        params.append(key, this.filters[key]);
                    }
                });

                // Debug: Log sort value being sent to backend
                if (this.sortBy) {
                    console.log('Sorting products by:', this.sortBy);
                    params.append('sortBy', this.sortBy);
                } else {
                    console.log('No sort applied - using default (Featured)');
                }

                params.append('page', this.currentPage);
                params.append('limit', this.productsPerPage);

                console.log('Request params:', params.toString());

                const { data: result } = await this.fetchWithFallback(params.toString());
                
                console.log('API Response:', result);
                
                if (result.status === 'success') {
                    const products = this.productType === 'tool' 
                        ? (result.data.tools || result.data.products || result.data)
                        : (result.data.products || result.data.tools || result.data);
                    this.pagination = result.data && result.data.pagination ? result.data.pagination : null;
                    console.log('Products to display:', products);
                    this.displayProducts(products);
                    this.renderPager();
                } else {
                    console.error('Failed to load products:', result.message);
                    this.displayError('Failed to load products: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error loading products:', error);
                this.displayError('Error loading products: ' + error.message);
            }
        }

        async applyFilters() {
            console.log('Applying filters...');
            if (productGrid) {
                const loadingText = this.productType === 'tool' ? 'Loading care tools...' : 'Loading products...';
                productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">${loadingText}</p>`;
            }
            await this.loadProducts();
        }

        // Generate product detail page URL from product name
        generateProductUrl(productName) {
            if (!productName) return '#';
            // Convert "Monstera Deliciosa" → "products/monstera_deliciosa.html"
            const filename = productName
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')  // Remove special chars except hyphen
                .replace(/\s+/g, '_')       // Replace spaces with underscore
                .replace(/_+/g, '_')        // Remove duplicate underscores
                .trim() + '.html';
            return 'products/' + filename;
        }

        displayProducts(products) {
            if (!productGrid) return;
            
            if (!products || products.length === 0) {
                const noProductsText = this.productType === 'tool' ? 'No tools found' : 'No products found';
                productGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                        <h3>${noProductsText}</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button onclick="productManager.clearAllFilters()" style="margin-top: 20px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Clear All Filters
                        </button>
                    </div>
                `;
                return;
            }

            console.log('Displaying', products.length, 'products');

            productGrid.innerHTML = products.map(product => {
                let mainImg = product.image_url;
                if (!mainImg) {
                    mainImg = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\"><rect width=\"100%\" height=\"100%\" height=\"100%\" fill=\"%23e9ecef\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"%236c757d\" font-size=\"20\" font-family=\"Arial\">No Image</text></svg>";
                } else if (!/^https?:\/\//i.test(mainImg)) {
                    // For relative paths, auto-prepend images/ if not already present
                    if (!mainImg.startsWith('images/') && !mainImg.startsWith('./images/') && !mainImg.startsWith('/images/')) {
                        mainImg = 'images/' + mainImg;
                    }
                    mainImg = mainImg.replace(/\s/g, "%20");
                } else if (/images\.unsplash\.com/i.test(mainImg)) {
                    try {
                        const u = new URL(mainImg);
                        u.searchParams.set("w", "400");
                        u.searchParams.set("h", "300");
                        u.searchParams.set("fit", "crop");
                        u.searchParams.set("auto", "format");
                        u.searchParams.set("q", "70");
                        mainImg = u.toString();
                    } catch {}
                }
                const hoverImg = product.hover_image_url
                    ? (/^https?:\/\//i.test(product.hover_image_url)
                        ? product.hover_image_url
                        : (() => {
                            let img = product.hover_image_url;
                            // Auto-prepend images/ for relative paths
                            if (!img.startsWith('images/') && !img.startsWith('./images/') && !img.startsWith('/images/')) {
                                img = 'images/' + img;
                            }
                            return img.replace(/\s/g, "%20");
                        })())
                    : mainImg;
                const tags = this.getProductTags(product);

                return `
                    <div class="product">
                        <div class="plant-image-container">
                            <img src="${mainImg}" alt="${product.name}" class="plant-image" loading="lazy" decoding="async" width="400" height="300" referrerpolicy="no-referrer">
                            <img src="${hoverImg}" alt="${product.name} alternate view" class="hover-image" loading="lazy" decoding="async" width="400" height="300" referrerpolicy="no-referrer">
                            <button class="add-to-cart-btn"
                                data-product-id="${product.id}"
                                data-product-name="${product.name}"
                                data-product-price="${product.price}"
                                data-product-image="${mainImg}"
                                data-product-description="${product.description || ''}"
                                data-product-category="${product.category || ''}"
                                data-product-size="${product.size || ''}">
                                Add to Cart
                            </button>
                        </div>
                        <h4 class="plant-title"><a href="${this.generateProductUrl(product.name)}">${product.name}</a></h4>
                        <p class="plant-price">$${parseFloat(product.price).toFixed(2)}</p>
                        <p class="plant-desc">${product.description || ''}</p>
                        ${tags}
                    </div>
                `;
            }).join('');

            this.attachCartListeners();
        }

        renderPager() {
            const pager = document.getElementById('productPager');
            if (!pager || !this.pagination) return;
            const page = this.pagination.current_page || 1;
            const total = this.pagination.total_pages || 1;
            const mk = (label, p, disabled=false, active=false) => `
              <button class="pager-btn ${disabled?'disabled':''} ${active?'active':''}" data-page="${p}" ${disabled?'disabled':''}>${label}</button>`;
            const parts = [];
            parts.push(mk('Prev', page-1, page<=1));
            const start = Math.max(1, page-2);
            const end = Math.min(total, page+2);
            for (let i=start;i<=end;i++) parts.push(mk(String(i), i, false, i===page));
            parts.push(mk('Next', page+1, page>=total));
            pager.innerHTML = parts.join('');
            pager.querySelectorAll('button.pager-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const p = parseInt(btn.dataset.page, 10);
                    if (!isNaN(p)) {
                        this.currentPage = p;
                        this.applyFilters();
                        window.scrollTo({top: 0, behavior: 'smooth'});
                    }
                });
            });
        }

        getProductTags(product) {
            let tags = [];
            
            if (this.productType === 'tool') {
                if (product.material) {
                    tags.push(`<span class="product-tag">${this.formatLabel(product.material)}</span>`);
                }
                if (product.tool_type) {
                    tags.push(`<span class="product-tag">${this.formatLabel(product.tool_type)}</span>`);
                }
            } else {
                if (product.care_level) {
                    tags.push(`<span class="product-tag">${this.formatLabel(product.care_level)} Care</span>`);
                }
                if (product.light_needs) {
                    tags.push(`<span class="product-tag">${this.formatLabel(product.light_needs)}</span>`);
                }
            }
            
            if (product.size) {
                tags.push(`<span class="product-tag">Size: ${this.formatLabel(product.size)}</span>`);
            }
            
            if (tags.length > 0) {
                return `<div class="product-tags" style="display: flex; gap: 5px; flex-wrap: wrap; margin: 10px 15px;">${tags.join('')}</div>`;
            }
            return '';
        }

        formatLabel(value) {
            if (!value) return '';
            return value.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        attachCartListeners() {
            console.log('Attaching cart listeners...');
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Add to cart clicked');
                    
                    const productData = {
                        id: button.dataset.productId,
                        name: button.dataset.productName,
                        price: parseFloat(button.dataset.productPrice),
                        image: button.dataset.productImage,
                        description: button.dataset.productDescription || '',
                        category: button.dataset.productCategory || '',
                        size: button.dataset.productSize || '',
                        quantity: 1
                    };
                    
                    console.log('Product data:', productData);
                    this.addToCart(productData);
                });
            });
        }

        addToCart(product) {
            console.log('Adding to cart:', product);
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
                console.log('Updated quantity for existing item');
            } else {
                cart.push(product);
                console.log('Added new item to cart');
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Cart saved to localStorage:', cart);
            
            this.showCartNotification(`${product.name} added to cart!`);
            
            // Update cart display if cart object exists
            if (window.cart) {
                window.cart.items = cart;
                window.cart.updateCartDisplay();
                window.cart.renderCartItems();
                setTimeout(() => window.cart.openCart(), 500);
            }
        }

        showCartNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 2500);
        }

        displayError(message) {
            if (productGrid) {
                productGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
                        <h3>⚠️ Connection Error</h3>
                        <p>${message}</p>
                        <p style="margin-top: 10px; font-size: 14px; color: #666;">
                            Make sure your XAMPP server is running and accessible at:<br>
                            <code>${BACKEND_BASE}</code>
                        </p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Retry Connection
                        </button>
                    </div>
                `;
            }
        }
    }

    // Initialize the product manager
    const productManager = new UnifiedProductManager(productType);
    window.productManager = productManager;
    console.log('products.js: productManager initialized and assigned to window:', !!window.productManager);

    if (productType === 'tool') {
        window.toolManager = productManager;
    }

    // Load additional sections
    if (scrollContainer) {
        (async () => {
            try {
                const params = new URLSearchParams();
                params.append('action','getFilteredProducts');
                params.append('limit','8');
                params.append('featured','1');
                const { data: result } = await productManager.fetchWithFallback(params.toString());
                if (result.status === 'success' && scrollContainer) {
                    const products = result.data.products || result.data;
                    scrollContainer.innerHTML = products.map(product => {
                        let mainImg = product.image_url;
                        if (!mainImg) {
                            mainImg = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\"><rect width=\"100%\" height=\"100%\" fill=\"%23e9ecef\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"%236c757d\" font-size=\"20\" font-family=\"Arial\">No Image</text></svg>";
                        } else if (!/^https?:\/\//i.test(mainImg)) {
                            mainImg = mainImg.replace(/\s/g, "%20");
                        } else if (/images\.unsplash\.com/i.test(mainImg)) {
                            try {
                                const u = new URL(mainImg);
                                u.searchParams.set("w", "400");
                                u.searchParams.set("h", "300");
                                u.searchParams.set("fit", "crop");
                                u.searchParams.set("auto", "format");
                                u.searchParams.set("q", "70");
                                mainImg = u.toString();
                            } catch {}
                        }
                        const hoverImg = product.hover_image_url
                            ? (/^https?:\/\//i.test(product.hover_image_url)
                                ? product.hover_image_url
                                : product.hover_image_url.replace(/\s/g, "%20"))
                            : mainImg;
                        return `
                            <div class="product">
                                <div class="plant-image-container">
                                    <img src="${mainImg}" alt="${product.name}" class="plant-image" loading="lazy" decoding="async" width="400" height="300" referrerpolicy="no-referrer">
                                    <img src="${hoverImg}" alt="${product.name} alternate view" class="hover-image" loading="lazy" decoding="async" width="400" height="300" referrerpolicy="no-referrer">
                                    <button class="add-to-cart-btn"
                                        data-product-id="${product.id}"
                                        data-product-name="${product.name}"
                                        data-product-price="${product.price}"
                                        data-product-image="${mainImg}">
                                        Add to Cart
                                    </button>
                                </div>
                                <h4 class="plant-title"><a href="${productManager.generateProductUrl(product.name)}">${product.name}</a></h4>
                                <p class="plant-price">From $${parseFloat(product.price).toFixed(2)}</p>
                                <p class="plant-desc">${product.description || ''}</p>
                            </div>
                        `;
                    }).join('');
                    productManager.attachCartListeners();
                }
            } catch (error) {
                console.error('Error loading scroll container products:', error);
            }
        })();
    }

    if (newArrivalsContainer) {
        const newAction = productType === 'tool' ? 'getFilteredTools' : 'getFilteredProducts';
        (async () => {
            try {
                const params = new URLSearchParams();
                params.append('action', newAction);
                params.append('limit', '4');
                params.append('sortBy', 'newest');
                const { data: result } = await productManager.fetchWithFallback(params.toString());
                if (result.status === 'success' && newArrivalsContainer) {
                    const products = productType === 'tool' 
                        ? (result.data.tools || result.data)
                        : (result.data.products || result.data);
                
                    newArrivalsContainer.innerHTML = products.map(product => {
                        let mainImg = product.image_url;
                        if (!mainImg) {
                            mainImg = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\"><rect width=\"100%\" height=\"100%\" fill=\"%23e9ecef\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"%236c757d\" font-size=\"20\" font-family=\"Arial\">No Image</text></svg>";
                        } else if (!/^https?:\/\//i.test(mainImg)) {
                            mainImg = mainImg.replace(/\s/g, "%20");
                        } else if (/images\.unsplash\.com/i.test(mainImg)) {
                            try {
                                const u = new URL(mainImg);
                                u.searchParams.set("w", "400");
                                u.searchParams.set("h", "300");
                                u.searchParams.set("fit", "crop");
                                u.searchParams.set("auto", "format");
                                u.searchParams.set("q", "70");
                                mainImg = u.toString();
                            } catch {}
                        }
                        const hoverImg = product.hover_image_url
                            ? (/^https?:\/\//i.test(product.hover_image_url)
                                ? product.hover_image_url
                                : product.hover_image_url.replace(/\s/g, "%20"))
                            : mainImg;
                        return `
                            <div class="product">
                                <div class="plant-image-container">
                                    <img src="${mainImg}" alt="${product.name}" class="plant-image" loading="lazy" decoding="async" width="400" height="300" referrerpolicy="no-referrer">
                                    <img src="${hoverImg}" alt="${product.name} alternate view" class="hover-image" loading="lazy" decoding="async" width="400" height="300" referrerpolicy="no-referrer">
                                    <button class="add-to-cart-btn"
                                        data-product-id="${product.id}"
                                        data-product-name="${product.name}"
                                        data-product-price="${product.price}"
                                        data-product-image="${mainImg}">
                                        Add to Cart
                                    </button>
                                </div>
                                <h4 class="plant-title"><a href="${productManager.generateProductUrl(product.name)}">${product.name}</a></h4>
                                <p class="plant-price">From $${parseFloat(product.price).toFixed(2)}</p>
                                <p class="plant-desc">${product.description || ''}</p>
                            </div>
                        `;
                    }).join('');
                    productManager.attachCartListeners();
                }
            } catch (error) {
                console.error('Error loading new arrivals:', error);
            }
        })();
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .product-tag {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
});