'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronRight, Filter } from 'lucide-react';

interface MovieGalleryProps {
  movies: any[];
  showtimes: any[];
}

export default function MovieGallery({ movies, showtimes }: MovieGalleryProps) {
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  
  const [isLangsExpanded, setIsLangsExpanded] = useState(true);
  const [isGenresExpanded, setIsGenresExpanded] = useState(true);
  const [isFormatsExpanded, setIsFormatsExpanded] = useState(true);

  const languages = ['Hindi', 'English', 'Japanese', 'Kannada', 'Malayalam', 'Tamil', 'Telugu'];
  const genres = [
    'Action', 'Thriller', 'Drama', 'Adventure', 'Crime', 
    'Animation', 'Comedy', 'Anime', 'Family', 'Fantasy', 
    'Romantic', 'Sci-Fi', 'Social', 'War', 'Cyberpunk', 'Horror', 'Psychological', 'Mecha'
  ];
  const formats = [
    '2D', '3D', '4DX 3D', '4DX', 'IMAX 2D', 'MX4D 3D', 'MX4D', 'DOLBY CINEMA 2D', 'IMAX 3D', 'Dolby Atmos'
  ];

  const toggleFilter = (item: string, type: 'lang' | 'genre' | 'format') => {
    if (type === 'lang') {
      setSelectedLangs(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else if (type === 'genre') {
      setSelectedGenres(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else if (type === 'format') {
      setSelectedFormats(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      // Language Filter (OR within category)
      if (selectedLangs.length > 0) {
        const movieLangs = movie.langs?.split(',').map((l: string) => l.trim()) || [];
        if (!selectedLangs.some(l => movieLangs.includes(l))) return false;
      }

      // Genre Filter (OR within category)
      if (selectedGenres.length > 0) {
        if (!selectedGenres.some(g => movie.tags?.includes(g))) return false;
      }

      // Format Filter
      if (selectedFormats.length > 0) {
        // Find if this movie has any showtime matching any selected format
        const movieShowtimes = showtimes.filter(s => {
          const mId = typeof s.movie === 'string' ? s.movie : s.movie?._id;
          return mId === movie._id;
        });
        const movieFormats = movieShowtimes.map(s => s.format);
        if (!selectedFormats.some(f => movieFormats.includes(f))) return false;
      }
      
      return true;
    });
  }, [movies, showtimes, selectedLangs, selectedGenres, selectedFormats]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
      
      {/* Left Sidebar - Filters */}
      <div className="w-full lg:w-[280px] shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Filters</h2>
          <button 
            onClick={() => {
              setSelectedLangs([]);
              setSelectedGenres([]);
              setSelectedFormats([]);
            }}
            className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold uppercase tracking-widest"
          >
            Clear All
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Languages Filter */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-fuchsia-500/10 transition-all hover:border-fuchsia-500/20">
            <div 
              onClick={() => setIsLangsExpanded(!isLangsExpanded)}
              className="flex justify-between items-center p-4 bg-slate-800/50 cursor-pointer group/header"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <ChevronUp className={`w-4 h-4 text-fuchsia-400 transition-transform duration-300 ${isLangsExpanded ? 'rotate-0' : 'rotate-180'}`} />
                Languages
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedLangs([]); }} 
                className="text-xs text-slate-400 hover:text-fuchsia-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className={`transition-all duration-300 ease-in-out ${isLangsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="p-4 flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button 
                    key={lang} 
                    onClick={() => toggleFilter(lang, 'lang')}
                    className={`px-3 py-1.5 text-xs rounded border transition-all ${selectedLangs.includes(lang) ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,132,252,0.3)]' : 'text-slate-300 bg-slate-800 border-slate-700 hover:border-fuchsia-500/50 hover:text-fuchsia-400'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Genres Filter */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-fuchsia-500/10 transition-all hover:border-fuchsia-500/20">
            <div 
              onClick={() => setIsGenresExpanded(!isGenresExpanded)}
              className="flex justify-between items-center p-4 bg-slate-800/50 cursor-pointer group/header"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <ChevronUp className={`w-4 h-4 text-fuchsia-400 transition-transform duration-300 ${isGenresExpanded ? 'rotate-0' : 'rotate-180'}`} />
                Genres
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedGenres([]); }} 
                className="text-xs text-slate-400 hover:text-fuchsia-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className={`transition-all duration-300 ease-in-out ${isGenresExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="p-4 flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button 
                    key={genre} 
                    onClick={() => toggleFilter(genre, 'genre')}
                    className={`px-3 py-1.5 text-xs rounded border transition-all ${selectedGenres.includes(genre) ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,132,252,0.3)]' : 'text-slate-300 bg-slate-800 border-slate-700 hover:border-fuchsia-500/50 hover:text-fuchsia-400'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formats Filter */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-fuchsia-500/10 transition-all hover:border-fuchsia-500/20">
            <div 
              onClick={() => setIsFormatsExpanded(!isFormatsExpanded)}
              className="flex justify-between items-center p-4 bg-slate-800/50 cursor-pointer group/header"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <ChevronUp className={`w-4 h-4 text-fuchsia-400 transition-transform duration-300 ${isFormatsExpanded ? 'rotate-0' : 'rotate-180'}`} />
                Format
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedFormats([]); }} 
                className="text-xs text-slate-400 hover:text-fuchsia-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className={`transition-all duration-300 ease-in-out ${isFormatsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="p-4 flex flex-wrap gap-2">
                {formats.map(format => (
                  <button 
                    key={format} 
                    onClick={() => toggleFilter(format, 'format')}
                    className={`px-3 py-1.5 text-xs rounded border transition-all ${selectedFormats.includes(format) ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,132,252,0.3)]' : 'text-slate-300 bg-slate-800 border-slate-700 hover:border-fuchsia-500/50 hover:text-fuchsia-400'}`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Browse by Cinemas Section */}
        <div className="mt-8 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 border border-fuchsia-500/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-fuchsia-500/20" />
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-2 relative z-10">Browse by Cinema</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase leading-relaxed mb-6 max-w-[180px] relative z-10 tracking-wider">
              Explore show timings at your favorite local theaters
            </p>
            <Link 
              href="/cinemas" 
              className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-950/20 relative z-10"
            >
              Explore All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Right Content Area - Movies List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-3xl font-bold text-white tracking-tight">Movies In Lucknow</h2>
           <span className="text-slate-500 font-bold text-sm tracking-widest uppercase">{filteredMovies.length} Movies</span>
        </div>
        
        {/* Active Filter Pills */}
        {(selectedLangs.length > 0 || selectedGenres.length > 0 || selectedFormats.length > 0) && (
          <div className="flex flex-wrap gap-3 mb-8 animate-in fade-in slide-in-from-left-4 duration-300">
            {[...selectedLangs, ...selectedGenres, ...selectedFormats].map(filter => (
              <button 
                key={filter} 
                onClick={() => {
                  if (languages.includes(filter)) setSelectedLangs(prev => prev.filter(f => f !== filter));
                  else if (genres.includes(filter)) setSelectedGenres(prev => prev.filter(f => f !== filter));
                  else setSelectedFormats(prev => prev.filter(f => f !== filter));
                }}
                className="px-4 py-2 border border-fuchsia-500/50 rounded-full text-xs font-black uppercase tracking-widest text-fuchsia-400 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition-all flex items-center gap-2"
              >
                {filter}
                <span className="text-[10px] opacity-60">✕</span>
              </button>
            ))}
          </div>
        )}

        {/* Coming Soon Banner */}
        <Link href="/movies/upcoming" className="w-full bg-slate-900/80 border border-fuchsia-500/20 rounded-2xl p-6 flex justify-between items-center mb-8 hover:bg-slate-900 transition-colors cursor-pointer group block">
          <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Coming Soon</h3>
          <span className="text-fuchsia-400 text-xs font-black uppercase tracking-widest flex items-center group-hover:text-fuchsia-300 transition-all">
            Explore Upcoming Movies <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 min-h-[400px]">
          {filteredMovies.length === 0 ? (
             <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
                <Filter className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No movies match your selection</p>
                <button 
                  onClick={() => { setSelectedLangs([]); setSelectedGenres([]); }}
                  className="mt-4 text-fuchsia-500 underline underline-offset-4 text-xs font-bold"
                >
                  Clear all filters
                </button>
             </div>
          ) : filteredMovies.map((movie: any) => (
            <div key={movie._id} className="flex flex-col gap-3 group animate-in fade-in zoom-in duration-500">
              {/* Poster */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800 transition-all duration-300 group-hover:border-fuchsia-500/50 group-hover:shadow-fuchsia-500/20 group-hover:-translate-y-2">
                <Link href={`/movies/${movie._id}`} className="block w-full h-full">
                  <img 
                    src={movie.image || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=2000"} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Votes/Likes Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md py-3 px-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-fuchsia-400">★ {movie.rating || 'N/A'}</span>
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{movie.votes || '0'} Votes</span>
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Info Text below poster */}
              <div className="flex flex-col px-1">
                <Link href={`/movies/${movie._id}`}>
                  <h3 className="text-lg font-black text-white leading-tight mb-1 group-hover:text-fuchsia-400 transition-colors line-clamp-1 uppercase tracking-tight">
                    {movie.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                   <span className="text-slate-500">{movie.cert || 'UA'}</span>
                   <span className="text-slate-400 truncate max-w-[120px]">{movie.langs || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
