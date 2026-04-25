const Showtime = require('../models/Showtime');

exports.getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate('movie', 'title');
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createShowtime = async (req, res) => {
  try {
    const showtime = new Showtime(req.body);
    await showtime.save();
    res.status(201).json(showtime);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getShowtimesByMovie = async (req, res) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId }).populate('movie', 'title');
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie', 'title');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.status(200).json(showtime);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
