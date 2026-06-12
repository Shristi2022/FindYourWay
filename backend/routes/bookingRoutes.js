const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all booking routes
router.use(verifyToken);

// POST /api/bookings
router.post('/', bookingController.createBooking);

// GET /api/bookings
router.get('/', bookingController.getAllBookings);

// GET /api/bookings/:id
router.get('/:id', bookingController.getBookingById);

// PUT /api/bookings/:id
router.put('/:id', bookingController.updateBookingStatus);

module.exports = router;
