document.addEventListener('DOMContentLoaded', () => {
    // ===== PRODUCT DISPLAY FUNCTIONALITY =====
    const scrollContainer = document.getElementById('scroll_container');
    const productGrid = document.getElementById('productGrid');
    const newArrivalsContainer = document.getElementById('new');
    const backendApiUrl = 'http://localhost/ecommerce_backend/products.php?action=getProducts';

    function displayProducts(products, containerElement, sectionClass, useProductInfoDiv = false) {
        if (!containerElement) return;
        containerElement.innerHTML = '';
        if (products.length === 0) {
            containerElement.innerHTML = '<p>No products found.</p>';
            return;
        }

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            const mainImgUrl = product.image_url || 'https://via.placeholder.com/150';
            const hoverImgUrl = product.hover_image_url || mainImgUrl;
            let productHtml = '';

            if (useProductInfoDiv) {
           productHtml = `
  <div class="plant-image-container1">
    <img src="${mainImgUrl}" alt="${product.name}" class="plant-image2">
    <img src="${hoverImgUrl}" alt="${product.name} Hover" class="hover-image">
  <button class="add-to-cart-btn" 
                data-product-id="${product.id}" 
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                data-product-image="${mainImgUrl}">
            Add to Cart
        </button>
  </div>
  <div class="product-info">
    <h3>${product.name}</h3>
    <p>${product.description || 'No description available.'}</p>
    <p>$${parseFloat(product.price).toFixed(2)}</p>
    <p>${product.size || 'N/A'}</p>
  </div>
`;

            } else {
                productHtml = `
                    <a href="${product.name.toLowerCase().replace(/\s/g, '_')}.html" class="plant-link">
                        <div class="plant-image-container">
                            <img src="${mainImgUrl}" alt="${product.name}" class="plant-image">
                            <img src="${hoverImgUrl}" alt="${product.name} Hover" class="hover-image">
                          <button class="add-to-cart-btn" 
                data-product-id="${product.id}" 
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                data-product-image="${mainImgUrl}">
            Add to Cart
        </button>
                        </div>
                        <h4>${product.name}</h4>
                        <p>${product.description || 'No description available.'}</p>
                        <p>From $${parseFloat(product.price).toFixed(2)}</p>
                    </a>
                   
                `;
            }

            productDiv.innerHTML = productHtml;
            containerElement.appendChild(productDiv);
        });

        attachAddToCartListeners();
    }

    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productName = event.target.dataset.productName;
                alert(`${productName} added to cart!`);
            });
        });
    }

    // Load products into containers
    [scrollContainer, productGrid, newArrivalsContainer].forEach(container => {
        if (container) {
            container.innerHTML = '<p>Loading products...</p>';
            fetch(backendApiUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success' && Array.isArray(data.data)) {
                        const sliceData = container === newArrivalsContainer ? data.data.slice(0, 4) : data.data;
                        const useProductInfoDiv = container === productGrid;
                        displayProducts(sliceData, container, '', useProductInfoDiv);
                    } else {
                        container.innerHTML = '<p>Failed to load products.</p>';
                    }
                })
                .catch(() => {
                    container.innerHTML = '<p>Failed to load products.</p>';
                });
        }
    });
});
