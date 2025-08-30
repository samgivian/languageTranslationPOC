# Language Translation POC

This project is a simple bank-style React application with a toggleable translation feature powered by Google's Gemini API.

## Features
- Multiple pages (Home, Accounts, Contact) using React Router.
- Translation script embedded in `index.html` that can be enabled or disabled via a button.
- All translation API payloads are logged to `payloads.json` via a small Node server.

## Running
1. Ensure you have Node.js installed.
2. Start the server:
   ```bash
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The translation toggle button appears in the navigation bar. Logged payloads can be found in `payloads.json`.
