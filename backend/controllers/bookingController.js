const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const { name, email, phone, age, gender, summary } = req.body;
        const userId = req.user.id;

        if (!name || !email || !phone || !age || !gender || !summary) {
            return res.status(400).json({ message: 'All booking fields are required' });
        }

        const ticketId = `FYW-${Date.now()}`;
        const newBooking = new Booking({
            userId,
            name,
            email,
            phone,
            age,
            gender,
            summary,
            ticketId,
            status: 'Confirmed'
        });

        await newBooking.save();

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        console.error('Booking Create Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Booking ticket ID conflict, please try again' });
        }
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Get Bookings Error:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const userId = req.user.id;
        const booking = await Booking.findOne({ _id: req.params.id, userId });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json(booking);
    } catch (error) {
        console.error('Get Booking Error:', error);
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const userId = req.user.id;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId },
            { status },
            { new: true }
        );

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.status(200).json({ message: 'Booking status updated', booking });
    } catch (error) {
        console.error('Update Booking Error:', error);
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
};
