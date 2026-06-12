# FindYourWay

FindYourWay is a travel route search and booking demo app with a JavaScript frontend and Express/MongoDB backend.

## Features
- Search routes between cities using geocoding and OSRM driving estimates
- Filter and sort travel options by fastest, cheapest, or balanced
- Signup/login with JWT authentication
- Book trips and view booking history

## Project Structure
- `index.html`, `style.css`, `script.js` — frontend UI
- `backend/` — Express API and controllers
- `backend/models/` — Mongoose models
- `backend/routes/` — API route definitions
- `backend/controllers/` — request handlers and business logic
- `backend/middleware/` — auth middleware

## Requirements
- Node.js 18+ or compatible
- MongoDB running locally or via Atlas

## Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create or update `backend/.env` with your MongoDB connection:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/findyourway
   JWT_SECRET=your_secret_here
   ```

3. Start the backend:
   ```bash
   npm start
   ```

4. Open `index.html` in a browser for the frontend.

## Notes
- The frontend expects the backend API at `http://localhost:5000`
- Booking and auth now use MongoDB via Mongoose
- Legacy JSON persistence files were removed from the repository

## GitHub Actions
A simple CI workflow installs dependencies and validates the backend modules.
