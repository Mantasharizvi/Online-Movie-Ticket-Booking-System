const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, enum: ['normal', 'comfort'], default: 'normal' }
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theaterName: { type: String, required: true },
  screen: { type: String, required: true },
  format: { type: String, default: '2D' },
  timeString: { type: String, required: true }, // e.g., "05:00 PM"
  showTime: { type: Date, required: true },
  ticketPrice: { type: Number, required: true }, // Normal price
  comfortPrice: { type: Number, required: true, default: 0 }, // Comfort price
  seats: [seatSchema]
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
