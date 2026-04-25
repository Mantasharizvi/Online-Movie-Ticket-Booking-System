'use client';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  X,
  Loader2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MoviesManagement() {
  const { adminToken } = useAuth();
  const [movies, setMovies] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState({ image: false, cover: false, logo: false });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMovieId, setCurrentMovieId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cert: 'UA',
    langs: 'English, Hindi',
    image: '',
    cover: '',
    logo: '',
    rating: '9.0/10',
    votes: '10K+ Votes',
    tags: [] as string[],
    imdb: '',
    pg: '',
    duration: '',
    durationHrs: '2',
    durationMins: '0',
    director: '',
    writers: '',
    stars: '',
    releaseDate: ''
  });

  const AVAILABLE_LANGS = ['Hindi', 'English', 'Japanese', 'Kannada', 'Malayalam', 'Tamil', 'Telugu'];
  const AVAILABLE_GENRES = [
    'Action', 'Thriller', 'Drama', 'Adventure', 'Crime', 
    'Animation', 'Comedy', 'Anime', 'Family', 'Fantasy', 
    'Romantic', 'Sci-Fi', 'Social', 'War', 'Cyberpunk', 'Horror', 'Psychological', 'Mecha'
  ];

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Failed to fetch movies', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!adminToken) return alert('Not authenticated!');
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const uploadForm = new FormData();
    uploadForm.append('image', file);

    try {
      setIsUploading(prev => ({ ...prev, [name]: true }));
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: uploadForm
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [name]: `http://localhost:5000${data.url}` }));
      } else {
        const err = await res.json();
        alert('Image upload failed: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setIsUploading(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleEditClick = (movie: any) => {
    // Parse duration string "2h 30m" -> "2", "30"
    const durMatch = movie.duration?.match(/(\d+)h\s*(\d+)m/);
    const hrs = durMatch ? durMatch[1] : '2';
    const mins = durMatch ? durMatch[2] : '0';

    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      cert: movie.cert || 'UA',
      langs: movie.langs || 'English, Hindi',
      image: movie.image || '',
      cover: movie.cover || '',
      logo: movie.logo || '',
      rating: movie.rating || '9.0/10',
      votes: movie.votes || '10K+ Votes',
      tags: Array.isArray(movie.tags) ? movie.tags : (movie.tags ? movie.tags.split(',').map((t: string) => t.trim()) : []),
      imdb: movie.imdb || '',
      pg: movie.pg || '',
      duration: movie.duration || '',
      durationHrs: hrs,
      durationMins: mins,
      director: movie.director || '',
      writers: movie.writers || '',
      stars: movie.stars || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : ''
    });
    setCurrentMovieId(movie._id);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const toggleLang = (lang: string) => {
    const currentLangs = formData.langs.split(',').map(l => l.trim()).filter(Boolean);
    const updatedLangs = currentLangs.includes(lang)
      ? currentLangs.filter(l => l !== lang)
      : [...currentLangs, lang];
    
    setFormData(prev => ({ ...prev, langs: updatedLangs.join(', ') }));
  };

  const handleViewClick = (movie: any) => {
    setViewData(movie);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return alert('Not authenticated!');
    
    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        duration: `${formData.durationHrs}h ${formData.durationMins}m`
      };

      const url = isEditing 
        ? `http://localhost:5000/api/movies/${currentMovieId}` 
        : 'http://localhost:5000/api/movies';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setIsEditing(false);
        setCurrentMovieId(null);
        setFormData({
          title: '', description: '', cert: 'UA', langs: 'English, Hindi', image: '', cover: '', logo: '', rating: '9.0/10', votes: '10K+ Votes', tags: [], imdb: '', pg: '', duration: '', durationHrs: '2', durationMins: '0', director: '', writers: '', stars: '', releaseDate: ''
        });
        fetchMovies();
      } else {
        const err = await res.json();
        alert(`Failed to ${isEditing ? 'update' : 'add'} movie: ` + err.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (!adminToken) return alert('Not authenticated!');
    setMovieToDelete({ id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!movieToDelete || !adminToken) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${movieToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setMovieToDelete(null);
        fetchMovies();
      } else {
        const err = await res.json();
        alert('Failed to delete movie: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'All' || movie.tags?.includes(filterGenre);
    
    // Check Status: Upcoming or Live
    const isUpcoming = movie.releaseDate && new Date(movie.releaseDate) > new Date();
    const movieStatus = isUpcoming ? 'Upcoming' : 'Live';
    const matchesStatus = filterStatus === 'All' || filterStatus === movieStatus;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Movie Management</h1>
          <p className="text-slate-400 font-medium text-sm">Add, edit, and organize movies for your theater directly in the database.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setCurrentMovieId(null);
            setFormData({
              title: '', description: '', cert: 'UA', langs: 'English, Hindi', image: '', cover: '', logo: '', rating: '9.0/10', votes: '10K+ Votes', tags: [], imdb: '', pg: '', duration: '', durationHrs: '2', durationMins: '0', director: '', writers: '', stars: '', releaseDate: ''
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-900/20"
        >
          <Plus className="w-5 h-5" />
          Add New Movie
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search movies by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 border px-6 py-3 rounded-2xl font-bold transition-all h-full ${isFilterOpen || filterGenre !== 'All' || filterStatus !== 'All' ? 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/20' : 'bg-slate-900/50 border-white/5 text-slate-300 hover:bg-white/5'}`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {(filterGenre !== 'All' || filterStatus !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-white ml-1 animate-pulse" />
            )}
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-4 w-72 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 ease-out">
                <div className="space-y-6">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Status</label>
                    <div className="flex flex-wrap gap-2">
                       {['All', 'Live', 'Upcoming'].map(s => (
                         <button 
                          key={s}
                          onClick={() => setFilterStatus(s)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === s ? 'bg-fuchsia-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Genre</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                       {['All', ...AVAILABLE_GENRES].map(g => (
                         <button 
                          key={g}
                          onClick={() => setFilterGenre(g)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left transition-all ${filterGenre === g ? 'bg-fuchsia-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                         >
                           {g}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-2">
                    <button 
                      onClick={() => {
                        setFilterGenre('All');
                        setFilterStatus('All');
                        setIsFilterOpen(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-fuchsia-500 transition-all shadow-lg shadow-fuchsia-900/20"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-slate-950/50 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px] relative">
          
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-950/50 flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-widest font-semibold">
                <th className="px-8 py-4">Movie</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Genre / Tags</th>
                <th className="px-8 py-4">Duration</th>
                <th className="px-8 py-4">IMDb</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredMovies.length === 0 && !isLoading && (
                 <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">No movies found in database.</td>
                 </tr>
              )}
              {filteredMovies.map((movie) => (
                <tr key={movie._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg bg-slate-900 flex items-center justify-center">
                        {movie.image ? (
                          <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-slate-500 font-bold uppercase">No Img</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base leading-tight mb-0.5">{movie.title}</span>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                           {(movie.langs || 'Unknown').split(',')[0]} • {movie.cert || 'U'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {movie.releaseDate && new Date(movie.releaseDate) > new Date() ? (
                      <span className="px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Live
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {movie.tags && movie.tags.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={tag} className="text-slate-400 text-xs font-medium">
                          {tag}{idx < Math.min(movie.tags.length, 2) - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {movie.tags && movie.tags.length > 2 && <span className="text-slate-500 text-xs ml-0.5">+{movie.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-300 font-semibold">{movie.duration || '-'}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                      <span className="text-white font-bold">{movie.imdb || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleViewClick(movie)}
                        className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(movie)}
                        className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-fuchsia-400 hover:bg-slate-800 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(movie._id, movie.title)}
                        className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-red-500 hover:bg-slate-800 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movie Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative bg-[#0b0f19] border border-white/10 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            
            <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/30 shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
                <p className="text-slate-400 text-sm font-medium">{isEditing ? 'Modify movie details and save changes.' : 'Enter movie details directly into the database.'}</p>
              </div>
              <button 
                disabled={isSubmitting}
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditing(false);
                  setCurrentMovieId(null);
                }}
                className="p-3 rounded-2xl hover:bg-white/5 text-slate-400 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-xs">1</span> Basic Info
                  </h3>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Movie Title *</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="e.g. Inception" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Brief synopsis..." className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium resize-none" />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 px-1">Duration</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-1.5 transition-all focus-within:ring-2 focus-within:ring-fuchsia-500/50">
                       <select 
                        name="durationHrs" 
                        value={formData.durationHrs} 
                        onChange={handleInputChange}
                        className="bg-transparent text-white font-bold outline-none flex-1 py-1.5 pr-2 appearance-none cursor-pointer"
                       >
                         {[0,1,2,3,4,5].map(h => <option key={h} value={h} className="bg-slate-900">{h}h</option>)}
                       </select>
                       <span className="text-slate-600 font-bold">:</span>
                       <select 
                        name="durationMins" 
                        value={formData.durationMins} 
                        onChange={handleInputChange}
                        className="bg-transparent text-white font-bold outline-none flex-1 py-1.5 pl-2 appearance-none cursor-pointer"
                       >
                         {[0,5,10,15,20,25,30,35,40,45,50,55].map(m => <option key={m} value={m} className="bg-slate-900">{m}m</option>)}
                       </select>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 px-1">Tags / Genres</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-900/30 border border-white/5 rounded-3xl">
                    {AVAILABLE_GENRES.map(genre => (
                      <button 
                        key={genre}
                        type="button"
                        onClick={() => toggleTag(genre)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.tags.includes(genre) ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/40' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Imagery & Assets */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span> Visual Assets
                  </h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                    Vertical Poster Image * {isUploading.image && <Loader2 className="w-3 h-3 inline animate-spin" />}
                  </label>
                  <input name="image" onChange={handleFileChange} type="file" accept="image/*" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500/10 file:text-fuchsia-400 hover:file:bg-fuchsia-500/20" />
                  {formData.image && <div className="mt-2 text-xs text-emerald-400 font-bold pl-2">✓ Poster uploaded</div>}
                </div>
                
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                    Cover (Hero) Image * {isUploading.cover && <Loader2 className="w-3 h-3 inline animate-spin" />}
                  </label>
                  <input name="cover" onChange={handleFileChange} type="file" accept="image/*" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500/10 file:text-fuchsia-400 hover:file:bg-fuchsia-500/20" />
                  {formData.cover && <div className="mt-2 text-xs text-emerald-400 font-bold pl-2">✓ Cover uploaded</div>}
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">
                    Logo Image (Optional) {isUploading.logo && <Loader2 className="w-3 h-3 inline animate-spin" />}
                  </label>
                  <input name="logo" onChange={handleFileChange} type="file" accept="image/*" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500/10 file:text-fuchsia-400 hover:file:bg-fuchsia-500/20" />
                  {formData.logo && <div className="mt-2 text-xs text-emerald-400 font-bold pl-2">✓ Logo uploaded</div>}
                </div>

                {/* Additional Details */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">3</span> Additional Details
                  </h3>
                </div>

                <div>
                   <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">IMDb Rating</label>
                   <input name="imdb" value={formData.imdb} onChange={handleInputChange} type="text" placeholder="8.8" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium" />
                </div>

                <div className="md:col-span-2">
                   <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 px-1">Languages</label>
                   <div className="flex flex-wrap gap-2 p-4 bg-slate-900/30 border border-white/5 rounded-3xl">
                    {AVAILABLE_LANGS.map(lang => (
                      <button 
                        key={lang}
                        type="button"
                        onClick={() => toggleLang(lang)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.langs.includes(lang) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Director</label>
                   <input name="director" value={formData.director} onChange={handleInputChange} type="text" placeholder="Christopher Nolan" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium" />
                </div>

                <div>
                   <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Stars</label>
                   <input name="stars" value={formData.stars} onChange={handleInputChange} type="text" placeholder="Leonardo DiCaprio..." className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium" />
                </div>

                <div>
                   <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Release Date (For Upcoming Showcase)</label>
                   <input 
                    name="releaseDate" 
                    value={formData.releaseDate} 
                    onChange={handleInputChange} 
                    type="date" 
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-medium [color-scheme:dark]" 
                   />
                </div>

              </div>

              <div className="flex gap-4 sticky bottom-0 bg-[#0b0f19] pt-4 border-t border-white/5 mt-8">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditing(false);
                    setCurrentMovieId(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl border border-white/5 text-white font-bold hover:bg-white/5 transition-all outline-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-fuchsia-600 text-white font-bold shadow-xl shadow-fuchsia-900/20 hover:bg-fuchsia-500 transition-all outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? 'Update Movie' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Movie Modal */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative bg-[#0b0f19] border border-white/10 rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col md:flex-row">
            
            {/* Left side: Poster */}
            <div className="w-full md:w-1/3 bg-slate-900/50 flex items-center justify-center p-8 border-r border-white/5">
              <div className="w-full aspect-[2/3] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative group">
                {viewData.image ? (
                  <img src={viewData.image} alt={viewData.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold uppercase tracking-wider">No Poster</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-fuchsia-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
                    {viewData.cert || 'UA'}
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-lg">{viewData.imdb || 'N/A'}</span>
                    <span className="text-slate-400 text-sm font-medium">/ 10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Details */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-8 border-b border-white/5 bg-slate-900/30 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">{viewData.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {viewData.tags && viewData.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300 text-xs font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-3 rounded-2xl hover:bg-white/5 text-slate-400 transition-colors group"
                >
                  <X className="w-6 h-6 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Synopsis</h3>
                  <p className="text-slate-300 text-base leading-relaxed font-medium">
                    {viewData.description || "No description available for this movie."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Core Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Duration</span>
                        <span className="text-white font-bold text-sm">{viewData.duration || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Languages</span>
                        <span className="text-white font-bold text-sm">{viewData.langs || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Certificate</span>
                        <span className="text-white font-bold text-sm">{viewData.cert || 'UA'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 text-sm">Release Date</span>
                        <span className="text-white font-bold text-sm">
                          {viewData.releaseDate ? new Date(viewData.releaseDate).toLocaleDateString() : 'Not Set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                     <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Cast & Crew</h3>
                     <div className="space-y-3">
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs mb-1">Director</span>
                          <span className="text-white font-bold text-sm">{viewData.director || '-'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs mb-1">Stars</span>
                          <span className="text-white font-bold text-sm truncate">{viewData.stars || '-'}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {viewData.cover && (
                   <div>
                      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Cover Image</h3>
                      <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10">
                        <img src={viewData.cover} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                   </div>
                )}
              </div>

              <div className="p-8 pt-4 border-t border-white/5 bg-slate-900/20 mt-auto">
                 <button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditClick(viewData);
                  }}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                 >
                   <Edit2 className="w-4 h-4" />
                   Edit Details
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && movieToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500" 
            onClick={() => !isSubmitting && setIsDeleteModalOpen(false)} 
          />
          <div className="relative bg-[#0b0f19] border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 ease-out">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-white mb-2">Confirm Deletion</h2>
              <p className="text-slate-400 font-medium mb-8">
                Are you sure you want to delete <span className="text-white font-bold">"{movieToDelete.title}"</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button 
                  disabled={isSubmitting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-white/5 text-slate-300 font-bold hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Movie
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
