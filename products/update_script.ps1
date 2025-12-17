# PowerShell script to apply all three changes to product HTML files

$files = @(
    "gardening_gloves.html",
    "golden_pothos.html",
    "japanese_maple.html",
    "monstera_deliciosa.html",
    "olive_tree.html",
    "orchid_phalaenopsis.html",
    "peace_lily.html",
    "pink_rhododendron.html",
    "plant_misting_bottle.html",
    "premium_potting_mix_10l.html",
    "premium_watering_can_2l.html",
    "snake_plant_sansevieria.html",
    "string_of_pearls.html",
    "tillandsia_ionantha.html",
    "zz_plant.html"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw -Encoding UTF8

    # Change 1: Update CSS for recommendation images
    $old1 = @"
        .recommendation-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #d0e8dc;
        }

        .recommendation-item:last-child {
            border-bottom: none;
        }

        .recommendation-info h4 {
            font-size: 1.05rem;
            margin-bottom: 5px;
            color: #333;
        }

        .recommendation-info p {
            font-size: 0.9rem;
            color: #666;
        }
"@

    $new1 = @"
        .recommendation-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #d0e8dc;
        }

        .recommendation-item:last-child {
            border-bottom: none;
        }

        .recommendation-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            object-fit: cover;
            flex-shrink: 0;
        }

        .recommendation-info {
            flex: 1;
        }

        .recommendation-info h4 {
            font-size: 1.05rem;
            margin-bottom: 5px;
            color: #333;
        }

        .recommendation-info p {
            font-size: 0.9rem;
            color: #666;
        }
"@

    $content = $content.Replace($old1, $new1)

    # Change 2: Update JavaScript rendering to include images
    $old2 = @"
                        container.innerHTML = tools.map(tool => ``
                            <div class="recommendation-item">
                                <div class="recommendation-info">
                                    <h4>`${tool.name || 'Product'}</h4>
                                    <p>`${tool.description || 'Essential tool for plant care'}</p>
                                </div>
                                <div class="recommendation-price">
                                    <span class="price-tag">+ `$`${parseFloat(tool.price || 0).toFixed(2)}</span>
                                    <button class="add-item-btn"
                                            data-id="`${tool.id}"
                                            data-name="`${tool.name}"
                                            data-price="`${tool.price}"
                                            data-image="`${tool.image_url || ''}"
                                            data-description="`${tool.description || ''}">
                                        Add
                                    </button>
                                </div>
                            </div>
                        ``).join('');
"@

    $new2 = @"
                        container.innerHTML = tools.map(tool => ``
                            <div class="recommendation-item">
                                <img src="`${tool.image_url || '../images/placeholder.jpg'}"
                                     alt="`${tool.name || 'Product'}"
                                     class="recommendation-image"
                                     onerror="this.src='../images/placeholder.jpg'">
                                <div class="recommendation-info">
                                    <h4>`${tool.name || 'Product'}</h4>
                                    <p>`${tool.description || 'Essential tool for plant care'}</p>
                                </div>
                                <div class="recommendation-price">
                                    <span class="price-tag">+ `$`${parseFloat(tool.price || 0).toFixed(2)}</span>
                                    <button class="add-item-btn"
                                            data-id="`${tool.id}"
                                            data-name="`${tool.name}"
                                            data-price="`${tool.price}"
                                            data-image="`${tool.image_url || ''}"
                                            data-description="`${tool.description || ''}">
                                        Add
                                    </button>
                                </div>
                            </div>
                        ``).join('');
"@

    $content = $content.Replace($old2, $new2)

    # Change 3: Fix recommendation button handlers
    $old3 = @"
            function setupRecommendationButtons() {
                const addItemButtons = document.querySelectorAll('.add-item-btn');

                addItemButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        if (this.classList.contains('added')) {
                            // Already added - do nothing or show message
                            return;
                        }

                        // Get product data from button attributes
                        const productData = {
                            id: this.dataset.id,
                            name: this.dataset.name,
                            price: parseFloat(this.dataset.price),
                            image: this.dataset.image,
                            description: this.dataset.description,
                            quantity: 1
                        };

                        // Add to cart using your existing cart system
                        if (window.SimpleCart && typeof window.SimpleCart.addItem === 'function') {
                            window.SimpleCart.addItem(productData);
                        } else if (typeof addItem === 'function') {
                            addItem(productData);
                        } else {
                            console.warn('Cart system not available');
                        }

                        // Visual feedback
                        this.classList.add('added');
                        this.textContent = '✓ Added';

                        // Optional: Reset after 2 seconds
                        setTimeout(() => {
                            this.classList.remove('added');
                            this.textContent = 'Add';
                        }, 2000);
                    });
                });
            }
"@

    $new3 = @"
            function setupRecommendationButtons() {
                const addItemButtons = document.querySelectorAll('.add-item-btn');

                addItemButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        if (this.classList.contains('added')) {
                            // Already added - do nothing or show message
                            return;
                        }

                        // Wait for cart to be available
                        if (!window.cart) {
                            console.error('Cart system not loaded yet');
                            alert('Cart system is loading. Please try again in a moment.');
                            return;
                        }

                        // Get product data from button attributes
                        const productData = {
                            id: this.dataset.id,
                            name: this.dataset.name,
                            price: parseFloat(this.dataset.price),
                            image: this.dataset.image,
                            description: this.dataset.description,
                            category: 'tool',
                            care_level: 'easy'
                        };

                        console.log('Adding recommendation to cart:', productData);

                        // Add to cart using the existing cart.js system
                        window.cart.addItem(productData);

                        // Visual feedback
                        this.classList.add('added');
                        this.textContent = '✓ Added';

                        // Reset after 2 seconds
                        setTimeout(() => {
                            this.classList.remove('added');
                            this.textContent = 'Add';
                        }, 2000);
                    });
                });
            }
"@

    $content = $content.Replace($old3, $new3)

    # Save the file
    $content | Out-File -FilePath $file -Encoding UTF8 -NoNewline
    Write-Host "Updated: $file"
}

Write-Host "`nAll files updated successfully!"
