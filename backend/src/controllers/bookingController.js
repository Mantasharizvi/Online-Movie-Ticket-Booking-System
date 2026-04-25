const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const { sendBookingEmail } = require('../utils/emailService');

exports.createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, totalAmount } = req.body;

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    // Validate seat availability and lock them
    for (const seat of seats) {
      const showSeat = showtime.seats.find(s => s.row === seat.row && s.number === seat.number);
      if (!showSeat) return res.status(400).json({ message: `Seat ${seat.row}${seat.number} does not exist.` });
      if (showSeat.isBooked) return res.status(400).json({ message: `Seat ${seat.row}${seat.number} is already booked.` });
      
      showSeat.isBooked = true;
      showSeat.bookedBy = req.user.id;
    }

    await showtime.save();

    const booking = new Booking({
      user: req.user.id,
      showtime: showtimeId,
      seats,
      totalAmount,
      paymentStatus: 'completed' // Simulating completed payment
    });

    await booking.save();

    // Send Confirmation Email Asynchronously (Don't block the response)
    try {
      const user = await User.findById(req.user.id);
      const populatedShowtime = await Showtime.findById(showtimeId).populate('movie');
      
      if (user && populatedShowtime) {
        sendBookingEmail({
          userEmail: user.email,
          userName: user.name,
          movieTitle: populatedShowtime.movie.title,
          theaterName: populatedShowtime.theaterName,
          showTime: populatedShowtime.showTime,
          seats: seats,
          totalAmount: totalAmount,
          bookingId: booking._id
        });
      }
    } catch (emailErr) {
      console.error("Failed to trigger email notification:", emailErr);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate({
      path: 'showtime',
      populate: { path: 'movie', select: 'title image' }
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: { path: 'movie', select: 'title' }
      });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
