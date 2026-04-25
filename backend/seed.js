const mongoose = require('mongoose');
const Movie = require('./src/models/Movie');
const Showtime = require('./src/models/Showtime');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/movie_booking')
  .then(async () => {
    console.log("Connected to MongoDB for seeding...");
    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await User.deleteMany({});

    // Seed Admin
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin', salt);
    await User.create({
      name: 'Admin',
      email: 'admin',
      password: hashedAdminPassword,
      role: 'admin'
    });
    console.log("Admin user created (admin/admin)");

    const movies = [
       {
          title: "Interstellar: Horizon",
          description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival across the cosmos in a dying universe.",
          duration: "2h 49m",
          tags: ["Sci-Fi", "Adventure", "Drama"],
          image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
          cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop",
          imdb: "8.6",
          langs: "English, Hindi, Telugu",
          director: "Christopher Nolan",
          stars: "Matthew McConaughey, Anne Hathaway",
          writers: "Jonathan Nolan, Christopher Nolan",
          cert: "UA",
          pg: "General"
       },
       {
          title: "Neon City",
          description: "In the sprawling metropolis of Neon City, a rogue detective uncovers a conspiracy that threatens the fragile truce between humans and androids.",
          duration: "2h 15m",
          tags: ["Action", "Cyberpunk", "Thriller"],
          image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop",
          cover: "https://images.unsplash.com/photo-1555580399-56b0266da452?q=80&w=2000&auto=format&fit=crop",
          imdb: "7.9",
          langs: "English",
          director: "Denis Villeneuve",
          stars: "Ryan Gosling, Harrison Ford",
          writers: "Hampton Fancher",
          cert: "A",
          pg: "Mature"
       },
       {
          title: "The Silent Forest",
          description: "A terrifying psychological thriller where a family must live in complete silence while hiding from creatures that hunt by sound alone.",
          duration: "1h 55m",
          tags: ["Horror", "Thriller", "Psychological"],
          image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000&auto=format&fit=crop",
          cover: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop",
          imdb: "8.2",
          langs: "English, Hindi, Tamil",
          director: "John Krasinski",
          stars: "Emily Blunt, John Krasinski",
          writers: "Bryan Woods",
          cert: "A",
          pg: "Horror"
       },
       {
          title: "Neon Genesis: Origins",
          description: "An ancient biomechanical weapon is unearthed in the deep ocean, forcing a reluctant teenage pilot to step up to save the remaining world.",
          duration: "2h 05m",
          tags: ["Anime", "Action", "Mecha"],
          image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
          cover: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000&auto=format&fit=crop",
          imdb: "9.1",
          langs: "Japanese, English",
          director: "Hideaki Anno",
          stars: "Megumi Ogata",
          writers: "Hideaki Anno",
          cert: "UA",
          pg: "Action"
       },
        {
           title: "Dune: Prophecy",
           description: "Set 10,000 years before the ascension of Paul Atreides, follow two Harkonnen sisters as they combat forces that threaten the future of humankind.",
           duration: "2h 30m",
           tags: ["Sci-Fi", "Drama", "Adventure"],
           image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop",
           cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop",
           imdb: "TBD",
           langs: "English, Hindi",
           releaseDate: new Date('2026-12-15'),
           cert: "UA",
           pg: "Action"
        },
        {
           title: "Star Wars: New Order",
           description: "A new generation of Jedi must rise when a mysterious threat from the Unknown Regions emerges to claim the galaxy.",
           duration: "2h 15m",
           tags: ["Sci-Fi", "Action", "Adventure"],
           image: "https://images.unsplash.com/photo-1547700055-b61cacebece9?q=80&w=1000&auto=format&fit=crop",
           cover: "https://images.unsplash.com/photo-1506318137071-a8e063b4b4bf?q=80&w=2000&auto=format&fit=crop",
           imdb: "TBD",
           langs: "English",
           releaseDate: new Date('2027-05-24'),
           cert: "U",
           pg: "General"
        },
        {
           title: "Avatar: The Seed Bearer",
           description: "Jake Sully and Neytiri take their family to the volcanic regions of Pandora to seek refuge with a new clan.",
           duration: "3h 10m",
           tags: ["Sci-Fi", "Action", "Adventure"],
           image: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop",
           cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2000&auto=format&fit=crop",
           imdb: "TBD",
           langs: "English, Hindi, Telugu, Tamil",
           releaseDate: new Date('2026-11-20'),
           cert: "UA",
           pg: "Action"
        }
    ];
    
    const createdMovies = await Movie.insertMany(movies);
    console.log(`Created ${createdMovies.length} movies.`);

    const generateSeats = () => {
      const seats = [];
      const rows = ['A','B','C','D','E','F','G','H','I','J'];
      rows.forEach(row => {
        for (let i = 1; i <= 16; i++) {
          // pre-book ~15% of seats randomly to simulate a live theater
          seats.push({ row, number: i, isBooked: Math.random() < 0.15 });
        }
      });
      return seats;
    };

    const showtimes = [];
    const dates = [new Date('2026-03-18'), new Date('2026-03-19'), new Date('2026-03-20')];

    for (const movie of createdMovies) {
       for (const date of dates) {
           showtimes.push({
              movie: movie._id,
              theaterName: 'PVR: SUPERPLEX Lulu',
              screen: 'Screen 1',
              format: 'IMAX 3D',
              timeString: '10:30 AM',
              showTime: date,
              ticketPrice: 450,
              seats: generateSeats()
           });
           showtimes.push({
              movie: movie._id,
              theaterName: 'PVR: SUPERPLEX Lulu',
              screen: 'Screen 2',
              format: '4DX',
              timeString: '01:15 PM',
              showTime: date,
              ticketPrice: 550,
              seats: generateSeats()
           });
           showtimes.push({
              movie: movie._id,
              theaterName: 'Cinepolis: VIP',
              screen: 'Premium Screen',
              format: 'Dolby Atmos',
              timeString: '06:45 PM',
              showTime: date,
              ticketPrice: 650,
              seats: generateSeats()
           });
       }
    }

    await Showtime.insertMany(showtimes);
    console.log(`Created ${showtimes.length} showtimes.`);

    mongoose.disconnect();
    console.log("Seeding complete!");
  })
  .catch((err) => {
     console.error("Seeding error:", err);
     mongoose.disconnect();
  });
