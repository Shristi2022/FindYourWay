const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    summary: { type: String, required: true },
    ticketId: { type: String, required: true, unique: true },
    status: { type: String, default: 'Confirmed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
