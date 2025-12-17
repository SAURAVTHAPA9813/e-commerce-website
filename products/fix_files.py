#!/usr/bin/env python3
import re

files = [
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
]

old_pattern = r'''            function setupRecommendationButtons\(\) \{
                const addItemButtons = document\.querySelectorAll\('\.add-item-btn'\);

                addItemButtons\.forEach\(button => \{
                    button\.addEventListener\('click', function\(\) \{
                        if \(this\.classList\.contains\('added'\)\) \{
                            // Already added - do nothing or show message
                            return;
                        \}

                        // Get product data from button attributes
                        const productData = \{
                            id: this\.dataset\.id,
                            name: this\.dataset\.name,
                            price: parseFloat\(this\.dataset\.price\),
                            image: this\.dataset\.image,
                            description: this\.dataset\.description,
                            quantity: 1
                        \};

                        // Add to cart using your existing cart system
                        if \(window\.SimpleCart && typeof window\.SimpleCart\.addItem === 'function'\) \{
                            window\.SimpleCart\.addItem\(productData\);
                        \} else if \(typeof addItem === 'function'\) \{
                            addItem\(productData\);
                        \} else \{
                            console\.warn\('Cart system not available'\);
                        \}

                        // Visual feedback
                        this\.classList\.add\('added'\);
                        this\.textContent = '✓ Added';

                        // Optional: Reset after 2 seconds
                        setTimeout\(\(\) => \{
                            this\.classList\.remove\('added'\);
                            this\.textContent = 'Add';
                        \}, 2000\);
                    \}\);
                \}\);
            \}'''

new_text = '''            function setupRecommendationButtons() {
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
            }'''

for filename in files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Use regex to replace
        new_content = re.sub(old_pattern, new_text, content, count=1, flags=re.MULTILINE)

        if new_content != content:
            with open(filename, 'w', encoding='utf-8', newline='') as f:
                f.write(new_content)
            print(f"Updated: {filename}")
        else:
            print(f"No change needed: {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("\nAll files processed!")
