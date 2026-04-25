'use client';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Shield, 
  User as UserIcon,
  Trash2,
  Edit2,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UsersManagement() {
  const { adminToken, admin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) fetchUsers();
  }, [adminToken]);

  const handleDelete = (id: string, name: string) => {
    // Robust check for self-deletion using both id and _id naming conventions
    const currentAdminId = admin?.id || (admin as any)?._id;
    if (id === currentAdminId) return alert('You cannot delete yourself!');
    
    setUserToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete || !adminToken) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete.id));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` 
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, ...editFormData } : u));
        setIsEditModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` 
        },
        body: JSON.stringify(addFormData)
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [newUser, ...prev]);
        setIsAddModalOpen(false);
        setAddFormData({ name: '', email: '', password: '', role: 'admin' });
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'All' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">User Management</h1>
          <p className="text-slate-400 font-medium text-sm">Manage user accounts, roles, and system access.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-fuchsia-900/20 font-sans"
        >
          <UserPlus className="w-5 h-5" />
          Add Internal User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
            className={`flex items-center gap-2 border px-6 py-3 rounded-2xl font-bold transition-all shadow-xl h-full ${isRoleFilterOpen || filterRole !== 'All' ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'}`}
          >
            <Filter className="w-5 h-5" />
            Role: {filterRole === 'All' ? 'All' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}
            <ChevronDown className={`w-4 h-4 transition-transform ${isRoleFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Role Filter Dropdown */}
          {isRoleFilterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsRoleFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-4 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 ease-out">
                {['All', 'admin', 'user'].map(role => (
                   <button 
                    key={role}
                    onClick={() => {
                      setFilterRole(role);
                      setIsRoleFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${filterRole === role ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                   >
                     {role}
                   </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">User Account</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Joined Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    <td className="px-8 py-6"><div className="h-12 w-48 bg-slate-900 rounded-2xl" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-24 bg-slate-900 rounded-xl" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-900 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-900 rounded" /></td>
                    <td className="px-8 py-6"></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold uppercase tracking-widest">No users found</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner border border-white/5
                          ${user.role === 'admin' ? 'bg-fuchsia-500/10 text-fuchsia-400' : 'bg-slate-800 text-slate-400'}`}>
                          {user.name?.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="font-bold text-white text-base leading-tight mb-0.5">{user.name}</span>
                         <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <Mail className="w-3 h-3" />
                            {user.email}
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {user.role === 'admin' ? (
                          <div className="flex items-center gap-1.5 text-fuchsia-400 font-bold text-xs uppercase tracking-wider bg-fuchsia-500/10 px-3 py-1.5 rounded-xl border border-fuchsia-500/20">
                             <Shield className="w-3.5 h-3.5" />
                             Admin
                          </div>
                       ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider bg-slate-800 px-3 py-1.5 rounded-xl border border-white/5">
                             <UserIcon className="w-3.5 h-3.5" />
                             Customer
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[10px] rounded-xl font-black uppercase tracking-widest border backdrop-blur-md shadow-lg flex items-center gap-2 w-fit
                      ${user.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5'}`}>
                      {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-400 font-bold">{formatDate(user.createdAt)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(user)}
                        title="Edit User"
                        className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-slate-500 hover:text-fuchsia-400 hover:bg-slate-800 transition-all group/btn relative overflow-hidden"
                      >
                        <Edit2 className="w-4 h-4 relative z-10" />
                        <div className="absolute inset-0 bg-fuchsia-500/10 scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id, user.name)}
                        title="Delete User"
                        className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-slate-500 hover:text-red-500 hover:bg-slate-800 transition-all group/btn relative overflow-hidden"
                      >
                        <Trash2 className="w-4 h-4 relative z-10" />
                        <div className="absolute inset-0 bg-red-500/10 scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/10 rounded-bl-full -translate-y-8 translate-x-8" />
            
            <form onSubmit={handleUpdateUser} className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Edit User Account</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Update profile and permissions</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Account Role</label>
                    <div className="relative group/select">
                      <select 
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-6 pr-12 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="user">Customer</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover/select:text-fuchsia-400 transition-colors pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1">Access Status</label>
                    <div className="relative group/select">
                      <select 
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        className={`w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-6 pr-12 focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold appearance-none cursor-pointer
                          ${editFormData.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Disabled</option>
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none
                        ${editFormData.status === 'active' ? 'text-emerald-500/50 group-hover/select:text-emerald-400' : 'text-red-500/50 group-hover/select:text-red-400'}`} />
                    </div>
                  </div>
                </div>

                {editingUser?._id === admin?.id && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-500/80 font-bold leading-relaxed">
                      You are editing your own account. Permissions and access changes are restricted to ensure you don't lose admin access.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-white/5 text-slate-400 hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-fuchsia-900/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" 
            onClick={() => !isSubmitting && setIsDeleteModalOpen(false)} 
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 ease-out">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-3">Delete Account</h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                Are you sure you want to delete user <span className="text-white">"{userToDelete.name}"</span>? This action is permanent and cannot be reversed.
              </p>

              <div className="flex gap-4">
                <button 
                  disabled={isSubmitting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-950 border border-white/5 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-red-900/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
       {/* Add User Modal */}
       {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 ease-out">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Add Internal User</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Create a new administrator account</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                   <input 
                    required
                    type="text" 
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold"
                   />
                 </div>
                 <div>
                   <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                   <input 
                    required
                    type="email" 
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold"
                   />
                 </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 text-center">Assign Role</label>
                <div className="grid grid-cols-2 gap-3">
                   {['admin', 'user'].map(r => (
                     <button 
                      type="button"
                      key={r}
                      onClick={() => setAddFormData({ ...addFormData, role: r })}
                      className={`py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${addFormData.role === r ? 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/20' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10 hover:text-white'}`}
                     >
                       <div className="flex items-center justify-center gap-2">
                          {r === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                          {r}
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              <div>
                 <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Temporary Password</label>
                 <input 
                  required
                  type="password" 
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  placeholder="Create a password"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold"
                 />
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-fuchsia-600 text-white font-bold hover:bg-fuchsia-500 transition-all shadow-lg shadow-fuchsia-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {isSubmitting ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : (
                     <>
                       <UserPlus className="w-5 h-5" />
                       Create User
                     </>
                   )}
                 </button>
              </div>
            </form>
          </div>
        </div>
       )}
    </div>
  );
}
