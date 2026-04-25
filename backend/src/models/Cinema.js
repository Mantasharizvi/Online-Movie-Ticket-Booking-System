const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String },
  facilities: [{ type: String }], // e.g., ['Parking', 'Food Court', 'Recliner']
  rating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cinema', cinemaSchema);
