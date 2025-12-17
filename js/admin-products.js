// admin-products.js

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic API URL from config.js (works in dev and production)
    const API_URL = (window.API_BASE || 'http://localhost/ecommerce_backend').replace(/\/$/, '') + '/products.php';
    console.log('Admin Products API URL:', API_URL);
    console.log('Window location:', window.location.href);
    console.log('API_BASE:', window.API_BASE);
    const productTableBody = document.getElementById('admin-product-table');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const productForm = document.getElementById('product-form');
    const formSubmitBtn = document.getElementById('form-submit');
    const idInput = document.getElementById('id');
    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const imageUrlInput = document.getElementById('image_url');
    const descriptionInput = document.getElementById('description');
    const categoryInput = document.getElementById('category');
    
    // Edit modal elements
    const editModal = document.getElementById('editProductModal');
    const editForm = document.getElementById('editProductForm');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    let csrfToken = null;
    let allProducts = []; // Store all products for easy access

    // --- UTILITY FUNCTIONS ---
    function showModal(message, isError = false) {
        modalMessage.textContent = message;
        modalMessage.style.color = isError ? 'red' : 'green';
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }
    
    function closeEditModal() {
        editModal.style.display = 'none';
        editForm.reset();
    }
    
    // Close modal on outside click or close button
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === editModal) {
            closeEditModal();
        }
    };

    // --- IMAGE PREVIEW FUNCTIONALITY ---
    function setupImagePreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        // Create preview container if it doesn't exist
        let preview = document.getElementById(previewId);
        if (!preview) {
            preview = document.createElement('div');
            preview.id = previewId;
            preview.style.cssText = 'margin-top: 10px; max-width: 200px;';
            input.parentElement.appendChild(preview);
        }

        input.addEventListener('input', function() {
            let imagePath = this.value.trim();
            if (!imagePath) {
                preview.innerHTML = '';
                return;
            }

            // Auto-prepend images/ if it's a relative path
            let displayPath = imagePath;
            if (!/^https?:\/\//i.test(imagePath) &&
                !imagePath.startsWith('images/') &&
                !imagePath.startsWith('./images/') &&
                !imagePath.startsWith('/images/')) {
                displayPath = 'images/' + imagePath;
            }

            preview.innerHTML = `<img src="${displayPath}" alt="Preview" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px;" onerror="this.parentElement.innerHTML='<small style=\\'color: red;\\'>Image not found</small>'">`;
        });
    }

    // Setup image previews for add form
    setupImagePreview('image_url', 'imagePreview');
    setupImagePreview('hover_image_url', 'hoverImagePreview');

    // Setup image previews for edit form
    setupImagePreview('editImageUrl', 'editImagePreview');
    setupImagePreview('editHoverImageUrl', 'editHoverImagePreview');

// Function to collect all form data
function collectFormData(formId) {
    const form = document.getElementById(formId);

    // Collect special features
    const featureCheckboxes = form.querySelectorAll('.features-grid input[type="checkbox"]:checked');
    const specialFeatures = Array.from(featureCheckboxes).map(cb => cb.value);

    const formData = {
        name: form.querySelector('#name, #editName')?.value || '',
        price: form.querySelector('#price, #editPrice')?.value || 0,
        category: form.querySelector('#category, #editCategory')?.value || '',
        plant_type: form.querySelector('#plant_type, #editPlantType')?.value || '',
        tool_type: form.querySelector('#tool_type, #editToolType')?.value || '',
        material: form.querySelector('#material, #editMaterial')?.value || '',
        light_needs: form.querySelector('#light_needs, #editLightNeeds')?.value || '',
        care_level: form.querySelector('#care_level, #editCareLevel')?.value || '',
        size: form.querySelector('#size, #editSize')?.value || '',
        image_url: form.querySelector('#image_url, #editImageUrl')?.value || '',
        hover_image_url: form.querySelector('#hover_image_url, #editHoverImageUrl')?.value || '',
        description: form.querySelector('#description, #editDescription')?.value || '',
        tags: form.querySelector('#tags, #editTags')?.value || '',
        stock_quantity: form.querySelector('#stock_quantity, #editStockQuantity')?.value || 0,
        popularity: form.querySelector('#popularity, #editPopularity')?.value || 50,
        featured: form.querySelector('#featured, #editFeatured')?.checked ? 1 : 0,
        product_type: form.querySelector('#product_type, #editProductType')?.value || 'plant',
        special_features: JSON.stringify(specialFeatures)
    };

    return formData;
}
    // Event listeners for modal close buttons
    if (document.querySelector('.close')) {
        document.querySelector('.close').onclick = closeModal;
    }
    
    if (closeEditModalBtn) {
        closeEditModalBtn.onclick = closeEditModal;
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.onclick = closeEditModal;
    }

    // --- MAIN FUNCTION TO FETCH AND RENDER PRODUCTS ---
    async function fetchAndRenderProducts() {
        productTableBody.innerHTML = '<tr><td colspan="6">Loading products...</td></tr>';
        
        try {
            const response = await fetch(`${API_URL}?action=getProducts`, {
                method: 'GET',
                credentials: 'include', // Important for sending session cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.status === 'success') {
                // Store the CSRF token for subsequent requests
                if (result.csrf_token) {
                    csrfToken = result.csrf_token;
                    console.log('CSRF Token received:', csrfToken);
                }

                if (result.data.length > 0) {
                    allProducts = result.data; // Store products for edit functionality
                    renderProductTable(result.data);
                } else {
                    productTableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
                }
            } else {
                showModal(`Error: ${result.message}`, true);
                productTableBody.innerHTML = '<tr><td colspan="6">Failed to load products.</td></tr>';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showModal(`An unexpected error occurred: ${error.message}`, true);
            productTableBody.innerHTML = '<tr><td colspan="6">Error fetching data.</td></tr>';
        }
    }

    // --- RENDER TABLE FUNCTION ---
    function renderProductTable(products) {
        productTableBody.innerHTML = ''; // Clear existing content
        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="9">No products found.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${parseFloat(product.price).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.category || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.plant_type || product.tool_type || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.stock_quantity || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.product_type || 'plant'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <img src="${product.image_url}" alt="${product.name}" class="h-10 w-10 object-cover rounded-md">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-4 edit-btn" data-id="${product.id}">Edit</button>
                    <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });

        // Add event listeners to the new buttons
        productTableBody.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        productTableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    }

    // --- FORM SUBMISSION HANDLER ---
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        
        // Disable button to prevent multiple submissions
        formSubmitBtn.disabled = true;
        formSubmitBtn.textContent = 'Processing...';

        const productData = collectFormData('product-form');

        const action = productData.id ? 'updateProduct' : 'addProduct';
        
        try {
            const response = await fetch(`${API_URL}?action=${action}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken // Pass the CSRF token
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (result.status === 'success') {
                showModal(`Product ${action === 'addProduct' ? 'added' : 'updated'} successfully.`, false);
                productForm.reset(); // Clear the form
                fetchAndRenderProducts(); // Refresh the table
            } else {
                showModal(`Error: ${result.message}`, true);
            }
        } catch (error) {
            console.error('Submission error:', error);
            showModal('An error occurred while saving the product.', true);
        } finally {
            formSubmitBtn.disabled = false;
            formSubmitBtn.textContent = 'Add Product';
        }
    });

    // --- EDIT FUNCTIONALITY ---
    function handleEditClick(event) {
        const productId = event.target.getAttribute('data-id');
        console.log(`Opening edit modal for product ID: ${productId}`);
        
        // Find the product in our stored data
        const product = allProducts.find(p => p.id == productId);
        
        if (product) {
            // Populate the edit form with product data
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editName').value = product.name || '';
            document.getElementById('editPrice').value = product.price || '';
            document.getElementById('editCategory').value = product.category || '';
            document.getElementById('editPlantType').value = product.plant_type || '';
            document.getElementById('editToolType').value = product.tool_type || '';
            document.getElementById('editMaterial').value = product.material || '';
            document.getElementById('editLightNeeds').value = product.light_needs || '';
            document.getElementById('editCareLevel').value = product.care_level || '';
            document.getElementById('editSize').value = product.size || '';
            document.getElementById('editImageUrl').value = product.image_url || '';
            document.getElementById('editHoverImageUrl').value = product.hover_image_url || '';
            document.getElementById('editDescription').value = product.description || '';
            document.getElementById('editTags').value = product.tags || '';
            document.getElementById('editStockQuantity').value = product.stock_quantity || 0;
            document.getElementById('editPopularity').value = product.popularity || 50;
            document.getElementById('editFeatured').checked = product.featured == 1;
            document.getElementById('editProductType').value = product.product_type || 'plant';
    
            // Show the edit modal
            editModal.style.display = 'block';
            
            // Focus on the first input
            setTimeout(() => {
                document.getElementById('editName').focus();
            }, 100);
        } else {
            showModal(`Product with ID ${productId} not found.`, true);
        }
    const features = JSON.parse(product.special_features || '[]');
    document.querySelectorAll('#editProductModal .features-grid input[type="checkbox"]').forEach(cb => {
        cb.checked = features.includes(cb.value);
    });
}

    // --- EDIT FORM SUBMISSION HANDLER ---
    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const submitButton = editForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Disable button and show processing state
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            const productData = collectFormData('editProductForm');
            productData.id = document.getElementById('editProductId').value;

            // Validate data
            if (!productData.name || !productData.price || !productData.category) {
                showModal('Please fill in all required fields', true);
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }

            if (productData.price <= 0) {
                showModal('Price must be greater than 0', true);
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }

            try {
                const response = await fetch(`${API_URL}?action=updateProduct`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify(productData)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    showModal('Product updated successfully!', false);
                    closeEditModal();
                    fetchAndRenderProducts(); // Refresh the product list
                } else {
                    showModal(`Error updating product: ${result.message}`, true);
                }
            } catch (error) {
                console.error('Error updating product:', error);
                showModal(`Error updating product: ${error.message}`, true);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    // --- DELETE FUNCTIONALITY ---
    async function handleDeleteClick(event) {
        const productId = event.target.getAttribute('data-id');
        
        // Find product name for better confirmation message
        const product = allProducts.find(p => p.id == productId);
        const productName = product ? product.name : `ID ${productId}`;
        
        if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}?action=deleteProduct`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken // Pass the CSRF token
                },
                body: JSON.stringify({ id: productId }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                showModal('Product deleted successfully.', false);
                fetchAndRenderProducts(); // Refresh the table
            } else {
                showModal(`Error: ${result.message}`, true);
            }
        } catch (error) {
            console.error('Delete error:', error);
            showModal('An error occurred while deleting the product.', true);
        }
    }

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', function(e) {
        // Close modals with Escape key
        if (e.key === 'Escape') {
            if (editModal.style.display === 'block') {
                closeEditModal();
            }
            if (modal.style.display === 'block') {
                closeModal();
            }
        }
    });

    // --- UTILITY FUNCTION FOR EXTERNAL ACCESS ---
    // Make fetchAndRenderProducts available globally for potential external use
    window.fetchAndRenderProducts = fetchAndRenderProducts;

    // Initial fetch of products when the page loads
    fetchAndRenderProducts();
});
