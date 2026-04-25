const mongoose = require('mongoose');
require('dotenv').config();
const Cinema = require('./src/models/Cinema');

const cinemas = [
  {
    name: "PVR: SUPERPLEX Lulu",
    address: "2nd Floor, Lulu Mall, Sushant Golf City, IBB-2T-5, Shaheed Path, Lucknow",
    city: "Lucknow",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2000",
    facilities: ['Parking', 'Food Court', 'Recliner', 'IMAX'],
    rating: 4.5
  },
  {
    name: "Cinepolis: VIP",
    address: "Fun Republic Mall, Lohia Path, Gomti Nagar, Lucknow",
    city: "Lucknow",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=2000",
    facilities: ['VIP Seats', 'Gourmet Food', 'Valet Parking'],
    rating: 4.8
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movie_booking')
  .then(async () => {
    console.log('Connected to MongoDB');
    await Cinema.deleteMany({});
    await Cinema.insertMany(cinemas);
    console.log('Seeded Cinemas successfully');
    process.exit();
  })
  .catch(err => {
    console.error('Error seeding cinemas:', err);
    process.exit(1);
  });
