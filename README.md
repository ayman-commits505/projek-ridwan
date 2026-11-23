# Ridwan Rattan Export

Static website (HTML, CSS, JavaScript, Bootstrap via CDN). No backend.

## Structure
- `index.html` : main page (must stay in the repository root)
- `css/style.css` : all custom styles
- `js/data.js` : business content (settings, products, variants, prices, shipping rates, FAQ)
- `js/main.js` : page logic (availability, totals, freight, arrival estimate, order sending)
- `assets/img/` : product photos and favicon

## Change the contact details
Open `js/data.js` and edit `whatsappNumber`, `whatsappDisplay` and `email` in `CONFIG`.

## Publish on GitHub Pages
1. Upload all files and folders to a GitHub repository (keep `index.html` in the root).
2. Settings > Pages > Source: Deploy from a branch > `main` / `(root)` > Save.
3. Open the link GitHub gives you.
