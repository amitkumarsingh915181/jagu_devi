# Jaggu Birthday Surprise Website

A responsive birthday website built with HTML, CSS, vanilla JavaScript, and an animated SVG heart loader.

## Run it
1. Extract the ZIP.
2. Open `index.html` in a browser. For the best local development experience, use VS Code with Live Server.
3. Replace the placeholder photos in `assets/` with your actual images. Keep the filenames the same:
   - `childhood-1.jpg`
   - `childhood-2.jpg`
   - `current-1.jpg`
   - `current-2.jpg`
4. Background music plays automatically on opening the link (or on the first tap/click if the browser blocks initial autoplay), and can be toggled via the top-right button.
5. Customize the birthday letter directly in `index.html`.

## Files
- `index.html` — page content and sections
- `style.css` — theme, responsive layout, SVG/cake/envelope animations
- `script.js` — loader, scroll reveals, photo modal, letter, cake wish, music and replay
- `assets/` — add your own images and optional music

## Notes
- No backend, framework, or build step required.
- Placeholder photo panels are shown until you add your own images.
- If you rename an image, update its path in both `index.html` and the related photo card data attribute.
- Background music is optional; the page remains fully functional without it.
