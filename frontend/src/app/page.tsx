import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ChevronUp, ChevronRight } from 'lucide-react';
import { heroBackground } from '@/lib/data';
import MovieGallery from '@/components/MovieGallery';

async function getMovies() {
  try {
    const res = await fetch('http://localhost:5000/api/movies', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return [];
  }
}

async function getShowtimes() {
  try {
    const res = await fetch('http://localhost:5000/api/showtimes', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch showtimes:", error);
    return [];
  }
}

export default async function Home() {
  const languages = ['Hindi', 'English', 'Japanese', 'Kannada', 'Malayalam', 'Tamil', 'Telugu'];
  
  const genres = [
    'Action', 'Thriller', 'Drama', 'Adventure', 'Crime', 
    'Animation', 'Comedy', 'Anime', 'Family', 'Fantasy', 
    'Romantic', 'Sci-Fi', 'Social', 'War'
  ];
  
  const formats = [
    '2D', '3D', '4DX 3D', '4DX', 'IMAX 2D', 'MX4D 3D', 'MX4D', 'DOLBY CINEMA 2D'
  ];

  const movies = await getMovies();
  const showtimes = await getShowtimes();
  const featuredMovies = movies.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-fuchsia-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden border-b border-fuchsia-500/10">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20 object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 block pb-2 drop-shadow-xl">
            Book the Best Seats in Town
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Experience cinema like never before. Grab your tickets for the latest blockbusters effortlessly.
          </p>
        </div>
      </div>


      {/* Featured Movies Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-fuchsia-500/10">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
          <button className="text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors">
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredMovies.map((movie: any) => (
            <Link href={`/movies/${movie._id}`} key={movie._id} className="group cursor-pointer block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-2xl shadow-black/50 border border-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-fuchsia-500/20 group-hover:border-fuchsia-500/30">
                <img 
                  src={movie.image || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=2000"} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-fuchsia-600 rounded-md text-white backdrop-blur-md bg-opacity-80">
                      ★ {movie.rating || 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-fuchsia-300 transition-colors">{movie.title}</h3>
                  <p className="text-sm text-gray-400">{movie.tags?.slice(0, 2).join(' • ')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <MovieGallery movies={movies} showtimes={showtimes} />
    </main>
  );
}
