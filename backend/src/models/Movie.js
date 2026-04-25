const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  cert: { type: String }, 
  langs: { type: String }, 
  image: { type: String },
  cover: { type: String }, 
  logo: { type: String }, 
  rating: { type: String }, 
  votes: { type: String }, 
  tags: [{ type: String }], 
  imdb: { type: String },
  pg: { type: String }, 
  duration: { type: String }, 
  director: { type: String },
  writers: { type: String },
  stars: { type: String },
  releaseDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
