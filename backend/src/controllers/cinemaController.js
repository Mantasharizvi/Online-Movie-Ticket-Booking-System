const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');

exports.getCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find();
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCinemaDetails = async (req, res) => {
  try {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);
    
    const cinema = await Cinema.findOne({ name: decodedName });
    if (!cinema) {
      // Return basic info if cinema is not in the model but exists in showtimes
      return res.status(404).json({ message: "Cinema details not found. Please try again later." });
    }

    // Fetch showtimes for this cinema, populate movie info
    const showtimes = await Showtime.find({ theaterName: decodedName }).populate('movie');
    
    // Group showtimes by movie
    const groupedShowtimes = {};
    showtimes.forEach(st => {
      const mId = st.movie._id.toString();
      if (!groupedShowtimes[mId]) {
        groupedShowtimes[mId] = {
          movie: st.movie,
          showtimes: []
        };
      }
      groupedShowtimes[mId].showtimes.push(st);
    });

    res.json({
      cinema,
      movies: Object.values(groupedShowtimes)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Endpoints
exports.addCinema = async (req, res) => {
  try {
    const cinema = new Cinema(req.body);
    await cinema.save();
    res.status(201).json(cinema);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cinema);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCinema = async (req, res) => {
  try {
    await Cinema.findByIdAndDelete(req.params.id);
    res.json({ message: "Cinema deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
