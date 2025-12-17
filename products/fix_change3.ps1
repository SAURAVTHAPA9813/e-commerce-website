# PowerShell script to apply Change 3 to product HTML files

$files = @(
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

# Read the correct function from the reference file
$correctFunction = @'
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
'@

$oldFunction = @'
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
'@

foreach ($file in $files) {
    $content = Get-Content $file -Raw -Encoding UTF8

    if ($content -match [regex]::Escape($oldFunction)) {
        $content = $content -replace [regex]::Escape($oldFunction), $correctFunction
        $content | Out-File -FilePath $file -Encoding UTF8 -NoNewline
        Write-Host "Updated: $file"
    } else {
        Write-Host "SKIPPED (pattern not found): $file"
    }
}

Write-Host "`nChange 3 applied to all files!"
