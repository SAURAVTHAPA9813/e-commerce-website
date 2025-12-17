# Product Pages Folder

This folder contains individual product detail pages for all products in the E-Garden store.

## Current Product Pages (22 total)

### Plants (17 pages)
- monstera_deliciosa.html
- snake_plant_sansevieria.html
- fiddle_leaf_fig.html
- golden_pothos.html
- zz_plant.html
- peace_lily.html
- ficus_audrey_tree.html
- pink_rhododendron.html
- string_of_pearls.html
- aloe_vera.html
- bunny_ear_cactus.html
- basil_plant.html
- cherry_tomato_plant.html
- orchid_phalaenopsis.html
- african_violet.html
- tillandsia_ionantha.html
- japanese_maple.html

### Care Tools (4 pages)
- premium_watering_can_2l.html
- plant_misting_bottle.html
- gardening_gloves.html
- premium_potting_mix_10l.html

### Template
- olive_tree.html (use this as a template for new products)

---

## How to Add a New Product Page

### Step 1: Copy the Template
Copy `olive_tree.html` and rename it using this format:
```
Product Name → filename
"Cactus Plant" → cactus_plant.html
"Indoor Succulent (Small)" → indoor_succulent_small.html
```

**Rules for filename:**
- Convert to lowercase
- Replace spaces with underscores (_)
- Remove special characters: () / , . ! ? @ # $ % & *
- Keep hyphens (-) as-is

### Step 2: Edit the New File
Open your new HTML file and customize:

1. **Update the title** (line 8):
   ```html
   <title>Your Product Name | E-Garden</title>
   ```

2. **Update product name** (search for "Ficus Audrey"):
   Replace all instances with your product name

3. **Update product price** (search for "$"):
   Update pricing information

4. **Update product images**:
   Replace image sources with your product images

5. **Update product description**:
   Edit the product info section

6. **Update care instructions**:
   Modify the accordion sections with relevant care info

### Step 3: Add Product to Database
Make sure your product exists in the XAMPP database with the **exact same name** you used for the filename (before converting to lowercase/underscores).

Example:
- Database: "Cactus Plant"
- Filename: cactus_plant.html ✅

The JavaScript will automatically generate the correct link!

### Step 4: Test
1. Visit shop.html or caretool.html
2. Find your product in the grid
3. Click the product name
4. Should navigate to your new product page

---

## Important Notes

⚠️ **All resource paths use `../` prefix** because files are in a subfolder:
- CSS: `href="../style.css"`
- JS: `src="../js/products.js"`
- Images: `src="../e garden logo1 copy.png"`
- Links: `href="../shop.html"`

⚠️ **Product links are auto-generated** by `js/products.js`:
- The `generateProductUrl()` function converts product names to filenames
- Clicking any product name will navigate to `products/{filename}.html`

⚠️ **Naming convention is critical**:
- Database product name: "Premium Watering Can (2L)"
- Generated URL: `products/premium_watering_can_2l.html`
- Make sure your filename matches this pattern!

---

## Need Help?

If a product link isn't working:
1. Check the browser console for errors
2. Verify the filename matches the generated URL
3. Make sure all resource paths use `../` prefix
4. Ensure the product exists in the database with correct name
