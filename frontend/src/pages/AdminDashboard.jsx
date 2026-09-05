import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck, DollarSign, Clock, Users, Calendar,
  Activity, CheckCircle2, Edit3, RefreshCw, Search, Lock, Radio, ArrowUpRight, X, Trash2,
  Phone, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, MOCK_ROOMS } from '../services/api';
import FadeIn from '../components/common/FadeIn';
import Pagination from '../components/common/Pagination';

export default function AdminDashboard({ adminTab, setAdminTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('ALL');
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);

  // Blogs State
  const [blogs, setBlogs] = useState([]);
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', image: null, image_preview: '', image_url: '', tags: '', published: false });

  // Create Room State
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: '', room_type: 'PODCAST', description: 'A professional studio space ready for your next project.', tagline: '',
    hourly_rate: 50, half_day_rate: 150, full_day_rate: 300, max_capacity: 4,
    image: null, image_preview: '',
    acoustics_rating: 'STC-60 Sound Isolation'
  });

  // Pagination State
  const [bookingsPage, setBookingsPage] = useState(1);
  const [studiosPage, setStudiosPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [blogsPage, setBlogsPage] = useState(1);
  const tableItemsPerPage = 10;
  const gridItemsPerPage = 8;

  const loadAdminData = () => {
    setLoading(true);

    api.getAnalytics()
      .then(res => setAnalytics(res))
      .catch((err) => {
        console.error("Failed to fetch analytics:", err);
        setAnalytics(null);
      });

    api.getRooms()
      .then(res => {
        if (Array.isArray(res)) setRooms(res);
        else if (res && Array.isArray(res.results)) setRooms(res.results);
        else setRooms([]);
      })
      .catch((err) => {
        console.error("Failed to fetch rooms:", err);
        setRooms([]);
      });

    api.getBookings()
      .then(res => {
        // Filter out temporary holds that were cancelled/released
        const validBookings = res.filter(b => !(b.status === 'CANCELLED' && b.customer_email === 'hold@pending.com'));
        setBookings(validBookings);
      })
      .catch((err) => {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      });

    api.getUsers()
      .then(res => setUsersList(res.results || res))
      .catch(() => setUsersList([]))

    api.getBlogs()
      .then(res => setBlogs(res.results || res))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateBookingStatus(id, newStatus);
    } catch (e) { }
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const openCreateModal = () => {
    setEditingRoomId(null);
    setNewRoom({
      name: '', room_type: 'PODCAST', description: 'A professional studio space ready for your next project.', tagline: '',
      hourly_rate: 50, half_day_rate: 150, full_day_rate: 300, max_capacity: 4,
      image: null, image_preview: '',
      acoustics_rating: 'STC-60 Sound Isolation'
    });
    setShowCreateRoom(true);
  };

  const openEditModal = (room) => {
    setEditingRoomId(room.id);
    setNewRoom({
      ...room,
      image: null,
      image_preview: room.image || ''
    });
    setShowCreateRoom(true);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Auto-generate slug from name
      const slug = newRoom.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = { ...newRoom, slug };
      // Remove image_preview from payload
      delete payload.image_preview;
      // If image is null, don't send it so we don't overwrite existing image with null
      if (!payload.image) delete payload.image;

      if (editingRoomId) {
        const updated = await api.updateRoom(editingRoomId, payload);
        setRooms(rooms.map(r => r.id === editingRoomId ? updated : r));
        toast.success('Studio Room updated successfully!');
      } else {
        const created = await api.createRoom(payload);
        setRooms([created, ...rooms]);
        toast.success('Studio Room created successfully!');
      }
      setShowCreateRoom(false);
      setEditingRoomId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save room');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-[#111111]">Are you sure you want to delete this studio? This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.deleteRoom(id);
                setRooms(prev => prev.filter(r => r.id !== id));
                toast.success('Studio Room deleted!');
              } catch (err) {
                toast.error(err.message || 'Failed to delete room');
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Delete Studio
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#fff',
        color: '#111',
        border: '1px solid #e2e8f0',
        padding: '16px',
        maxWidth: '400px',
      }
    });
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const updated = await api.updateUser(editingUser.id, editingUser);
      setUsersList(usersList.map(u => u.id === editingUser.id ? updated : u));
      toast.success('User updated successfully');
      setShowEditUserModal(false);
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.deleteUser(userId);
        setUsersList(usersList.filter(u => u.id !== userId));
        toast.success("User deleted successfully.");
      } catch (e) {
        toast.error("Failed to delete user.");
      }
    }
  };

  const openCreateBlogModal = () => {
    setEditingBlogId(null);
    setNewBlog({ title: '', content: '', image: null, image_preview: '', image_url: '', tags: '', published: false });
    setShowCreateBlog(true);
  };

  const openEditBlogModal = (blog) => {
    setEditingBlogId(blog.id);
    setNewBlog({ ...blog, image: null, image_preview: blog.image || '' });
    setShowCreateBlog(true);
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editingBlogId) {
        const updated = await api.updateBlog(editingBlogId, newBlog);
        setBlogs(blogs.map(b => b.id === editingBlogId ? updated : b));
        toast.success('Blog updated successfully!');
      } else {
        const created = await api.createBlog(newBlog);
        setBlogs([created, ...blogs]);
        toast.success('Blog created successfully!');
      }
      setShowCreateBlog(false);
      setEditingBlogId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save blog');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await api.deleteBlog(id);
        setBlogs(blogs.filter(b => b.id !== id));
        toast.success("Blog deleted successfully.");
      } catch (e) {
        toast.error("Failed to delete blog.");
      }
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Derivations
  const paginatedBookings = filteredBookings.slice((bookingsPage - 1) * tableItemsPerPage, bookingsPage * tableItemsPerPage);
  
  const filteredRooms = rooms.filter(room => capacityFilter === 'ALL' || room.max_capacity === parseInt(capacityFilter));
  const paginatedRooms = filteredRooms.slice((studiosPage - 1) * gridItemsPerPage, studiosPage * gridItemsPerPage);

  const paginatedUsers = usersList.slice((usersPage - 1) * tableItemsPerPage, usersPage * tableItemsPerPage);
  
  const paginatedBlogs = blogs.slice((blogsPage - 1) * tableItemsPerPage, blogsPage * tableItemsPerPage);

  return (
    <div className="min-h-screen bg-[#F3F3F5] text-slate-900 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 lg:pb-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Admin Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">Studio Operations Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Manage studio bookings, pricing tiers, time slots, and security audit trails.</p>
          </div>

          <button
            onClick={loadAdminData}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
          </button>
        </div>

        {/* TAB 0: Dashboard / Analytics */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-900">Analytics Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Hours Booked */}
              <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm shadow-emerald-100/50 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500">Hours Booked</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {bookings.reduce((total, b) => {
                      if (!b.start_time || !b.end_time) return total;
                      const [sh, sm] = b.start_time.split(':').map(Number);
                      const [eh, em] = b.end_time.split(':').map(Number);
                      return total + (eh + em / 60) - (sh + sm / 60);
                    }, 0).toFixed(1)} hrs
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">Active studio utilization</div>
                </div>
              </div>

              {/* Total Reservations */}
              <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm shadow-amber-100/50 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar className="w-16 h-16 text-amber-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500">Total Reservations</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">{bookings.length}</div>
                  <div className="text-[10px] font-bold text-amber-600">Confirmed sessions</div>
                </div>
              </div>

              {/* Active Studios */}
              <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm shadow-amber-100/50 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Radio className="w-16 h-16 text-amber-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500">Active Studios</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">{rooms.length} Suites</div>
                  <div className="text-[10px] font-bold text-amber-600">Total registered in database</div>
                </div>
              </div>
            </div>
            
            {/* Studio Utilization Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-base font-bold text-slate-900">Recent Bookings</h4>
                  </div>
                  <button onClick={() => setAdminTab('bookings')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                </div>
                
                <div className="space-y-4 flex-1">
                  {bookings.slice(0, 4).map((booking, idx) => (
                    <div key={booking.id || idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                          {booking.customer_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{booking.customer_name}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">{booking.studio?.name || 'Studio'} • {booking.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">{booking.start_time}</div>
                        <div className={`text-[10px] font-bold uppercase ${booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-500'}`}>{booking.status}</div>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-8 flex flex-col items-center justify-center space-y-2">
                      <Calendar className="w-8 h-8 text-slate-300" />
                      <span>No recent bookings found.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Engagement */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-sky-600" />
                  <h4 className="text-base font-bold text-slate-900">Platform Engagement</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</div>
                    <div className="text-3xl font-black text-slate-900">{usersList.length || 0}</div>
                    <div className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Active Growth
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completion Rate</div>
                    <div className="text-3xl font-black text-slate-900">
                      {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED').length / bookings.length) * 100) : 0}%
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Successful Bookings
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="font-bold text-slate-600">Peak Booking Hours</span>
                    <span className="font-bold text-slate-900">
                      {bookings.length > 0 ? (
                        (() => {
                          const counts = {};
                          bookings.forEach(b => {
                            if (b.start_time) {
                              const hour = parseInt(b.start_time.split(':')[0], 10);
                              counts[hour] = (counts[hour] || 0) + 1;
                            }
                          });
                          let peakHour = 14;
                          let maxCount = -1;
                          Object.entries(counts).forEach(([hour, count]) => {
                            if (count > maxCount) {
                              maxCount = count;
                              peakHour = parseInt(hour, 10);
                            }
                          });
                          return `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 2).toString().padStart(2, '0')}:00`;
                        })()
                      ) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex gap-1 h-8 items-end">
                    {(() => {
                      const buckets = [0, 0, 0, 0, 0, 0, 0, 0];
                      bookings.forEach(b => {
                        if (!b.start_time) return;
                        const hour = parseInt(b.start_time.split(':')[0], 10);
                        if (hour >= 8 && hour < 24) {
                          const idx = Math.floor((hour - 8) / 2);
                          if (idx >= 0 && idx < 8) buckets[idx]++;
                        }
                      });
                      const max = Math.max(...buckets, 1);
                      return buckets.map(count => (count / max) * 10);
                    })().map((val, i) => (
                      <div key={i} className="flex-1 bg-sky-100 rounded-t-sm hover:bg-sky-200 transition-colors" style={{ height: `${val > 0 ? val * 10 : 2}%` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1 uppercase">
                    <span>Morning</span>
                    <span>Evening</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Booking Management Table */}
        {adminTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Reservation Records</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search ref or customer..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setBookingsPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Studio Suite</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                          <Calendar className="w-10 h-10 animate-bounce text-slate-300" />
                          <div className="text-sm font-bold text-slate-500">No items</div>
                          <p className="text-xs">There are no reservation records to display.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 cursor-pointer" onClick={() => setSelectedBookingForDetails(b)}>{b.booking_reference}</td>
                        <td className="py-3.5 px-4 cursor-pointer" onClick={() => setSelectedBookingForDetails(b)}>
                          <div className="font-bold text-slate-900">{b.customer_name}</div>
                          <div className="text-[10px] text-slate-500">{b.customer_email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer" onClick={() => setSelectedBookingForDetails(b)}>{b.studio_details?.name || 'Studio Room'}</td>
                        <td className="py-3.5 px-4 text-slate-700 cursor-pointer" onClick={() => setSelectedBookingForDetails(b)}>
                          <div>{b.booking_date}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{b.start_time} - {b.end_time}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : b.status === 'COMPLETED'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : b.status === 'HOLD'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-red-50 text-red-700 border-red-300'
                            }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 px-2 py-1 focus:outline-none"
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="HOLD">HOLD</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination 
                currentPage={bookingsPage} 
                totalItems={filteredBookings.length} 
                itemsPerPage={tableItemsPerPage} 
                onPageChange={setBookingsPage} 
              />
            </div>

          </div>
        )}

        {/* Booking Details Modal (Premium Redesign) */}
        {selectedBookingForDetails && createPortal(
          <div className="fixed inset-0 z-[9999] flex p-4 sm:p-6 bg-[#000000]/60 backdrop-blur-md overflow-y-auto items-center justify-center">
            <div className="relative w-full max-w-2xl bg-white border border-[#E5E5E7] rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">

              {/* Header section with gradient */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-6 text-white relative">
                <button
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <h4 className="text-2xl font-black tracking-tight mb-1">Booking Overview</h4>
                <p className="text-sm text-slate-300 font-medium flex items-center gap-2">
                  Reference Code: <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-md">{selectedBookingForDetails.booking_reference}</span>
                </p>
              </div>

              {/* Body Content */}
              <div className="p-8 space-y-6">

                {/* Top Grid: Customer & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Card */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Customer Information</div>
                    <div className="text-lg font-black text-slate-900 leading-tight">{selectedBookingForDetails.customer_name}</div>
                    <div className="text-sm text-slate-500 mt-1">{selectedBookingForDetails.customer_email}</div>

                    {selectedBookingForDetails.customer_phone ? (
                      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-700 font-bold font-mono">{selectedBookingForDetails.customer_phone}</span>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${selectedBookingForDetails.customer_phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition-all text-xs font-bold" title="Call">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a href={`https://wa.me/${selectedBookingForDetails.customer_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-lg transition-all text-xs font-bold" title="WhatsApp">
                            <MessageCircle className="w-3.5 h-3.5" /> Chat
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-400 italic">No phone provided</div>
                    )}
                  </div>

                  {/* Schedule Card */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule Details</div>
                    <div className="text-lg font-black text-slate-900 leading-tight">{selectedBookingForDetails.booking_date}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {selectedBookingForDetails.start_time} - {selectedBookingForDetails.end_time}</div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                        {selectedBookingForDetails.duration_hours} Hour Session
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Studio Suite, Status & Payment */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Selected Studio</div>
                    <div className="text-base font-black text-slate-900">{selectedBookingForDetails.studio_details?.name || 'Studio Room'}</div>
                  </div>
                  
                  <div className="flex-1 sm:text-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:px-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-1.5">Payment</div>
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full border ${selectedBookingForDetails.reservation_fee_paid ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                      {selectedBookingForDetails.reservation_fee_paid ? '₹100 Paid' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex-1 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-1.5">Current Status</div>
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full border ${selectedBookingForDetails.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                      selectedBookingForDetails.status === 'COMPLETED' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                        selectedBookingForDetails.status === 'HOLD' ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' :
                          'bg-red-50 text-red-700 border-red-300'
                      }`}>
                      {selectedBookingForDetails.status}
                    </span>
                  </div>
                </div>

                {/* Notes Section (if any) */}
                {selectedBookingForDetails.notes && (
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" /> Customer Notes</div>
                    <div className="text-sm text-slate-700 font-medium leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                      {selectedBookingForDetails.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          , document.body)}

        {/* TAB 2: Studio Suites Manager */}
        {adminTab === 'studios' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">Studio Suites</h3>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={capacityFilter}
                  onChange={(e) => { setCapacityFilter(e.target.value); setStudiosPage(1); }}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#111111] flex-1 sm:flex-none cursor-pointer"
                >
                  <option value="ALL">All Capacities</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>

                <button
                  onClick={() => showCreateRoom ? setShowCreateRoom(false) : openCreateModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap"
                >
                  {showCreateRoom ? 'Cancel' : '+ Create New Studio'}
                </button>
              </div>
            </div>

            {showCreateRoom && createPortal(
              <div className="fixed inset-0 z-[9999] flex p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                <div className="relative m-auto w-full max-w-sm bg-white border border-[#E5E5E7] rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                  <button
                    onClick={() => setShowCreateRoom(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#111111] bg-slate-50 hover:bg-slate-100 rounded-full transition-all z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="mb-5 pr-8">
                    <h4 className="text-xl font-black text-[#111111] tracking-tight">{editingRoomId ? 'Edit Studio' : 'New Studio'}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{editingRoomId ? 'Update studio space details.' : 'Add a new creative space to your facility.'}</p>
                  </div>

                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Studio Name</label>
                      <input type="text" required placeholder="e.g. Studio X - The Vault" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-slate-300" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Cover Image</label>
                      <div className="relative">
                        <input type="file" accept="image/*" required onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setNewRoom({ ...newRoom, image: file, image_preview: URL.createObjectURL(file) });
                          }
                        }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#111111] file:text-white hover:file:bg-[#222222] transition-all cursor-pointer" />
                        {newRoom.image_preview && (
                          <div className="mt-3 rounded-xl overflow-hidden bg-slate-100 h-28 relative group">
                            <img src={newRoom.image_preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Max Capacity</label>
                      <select required value={newRoom.max_capacity} onChange={e => setNewRoom({ ...newRoom, max_capacity: parseInt(e.target.value) })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all cursor-pointer">
                        <option value={1}>1 Creator (Solo)</option>
                        <option value={2}>2 People (Host + Guest)</option>
                        <option value={3}>3 People (Small Group)</option>
                        <option value={4}>4 People (Panel Session)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button type="submit" disabled={creating} className="w-full py-3 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-md active:translate-y-0">
                        {creating ? 'Saving...' : editingRoomId ? 'Update Studio Space' : 'Create Studio Space'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {rooms.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-3xl mt-4">
                <p className="text-slate-500 font-medium mb-4">You haven't created any studio spaces yet.</p>
                <button
                  onClick={openCreateModal}
                  className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  + Create Your First Studio
                </button>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-3xl mt-4">
                <p className="text-slate-500 font-medium">No studios match the selected capacity.</p>
              </div>
            ) : (
              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {paginatedRooms.map(room => (
                    <div key={room.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-3 sm:p-6 flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-full rounded-xl mb-4 overflow-hidden">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-2">{room.name}</h4>

                      <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3 mt-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                          <span className="font-bold text-slate-500">Max Capacity:</span>
                          <span className="bg-slate-100 px-2 py-1 rounded-md font-extrabold text-[#111111]">{room.max_capacity} Guests</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 sm:mt-6 flex gap-2">
                      <button onClick={() => openEditModal(room)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all">
                        <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                </div>
                <Pagination 
                  currentPage={studiosPage} 
                  totalItems={filteredRooms.length} 
                  itemsPerPage={gridItemsPerPage} 
                  onPageChange={setStudiosPage} 
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Security & Audit Logs */}
        {adminTab === 'security' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">


            {/* Users List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Registered Users</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Number</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-800 font-bold">{u.first_name || u.username}</td>
                        <td className="py-3 px-4 text-slate-500">{u.phone_number || (u.email.includes('@studiofloor.com') ? '+' + u.email.split('@')[0] : u.email)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {u.role || 'CUSTOMER'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end items-center gap-1">
                            <button onClick={() => handleEditUser(u)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
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
            
            {/* Edit User Modal */}
            {showEditUserModal && createPortal(
              <div className="fixed inset-0 z-[9999] flex p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                <div className="relative m-auto w-full max-w-sm bg-white border border-[#E5E5E7] rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                  <button
                    onClick={() => setShowEditUserModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#111111] bg-slate-50 hover:bg-slate-100 rounded-full transition-all z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="mb-5 pr-8">
                    <h4 className="text-xl font-black text-[#111111] tracking-tight">Edit User</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Update user details and access level.</p>
                  </div>

                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Username / Name</label>
                      <input type="text" required value={editingUser.username || ''} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-slate-300" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Email</label>
                      <input type="email" required value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-slate-300" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Role</label>
                      <select required value={editingUser.role || 'CUSTOMER'} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all cursor-pointer">
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button type="submit" disabled={savingUser} className="w-full py-3 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-md active:translate-y-0">
                        {savingUser ? 'Saving...' : 'Save User Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

        {/* TAB 4: Blogs Manager */}
        {adminTab === 'blogs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Platform Blogs</h3>
                <button
                  className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  onClick={openCreateBlogModal}
                >
                  + Create New Blog
                </button>
              </div>
              
              {blogs.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                  <p className="text-slate-500 font-medium text-sm mb-4">No blogs found.</p>
                  <button
                    onClick={openCreateBlogModal}
                    className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    + Create Your First Blog
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {paginatedBlogs.map(blog => (
                        <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-800 font-bold">{blog.title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${blog.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{new Date(blog.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end items-center gap-1">
                              <button onClick={() => openEditBlogModal(blog)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteBlog(blog.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination 
                    currentPage={blogsPage} 
                    totalItems={blogs.length} 
                    itemsPerPage={tableItemsPerPage} 
                    onPageChange={setBlogsPage} 
                  />
                </div>
              )}
            </div>

            {/* Create/Edit Blog Modal */}
            {showCreateBlog && createPortal(
              <div className="fixed inset-0 z-[9999] flex p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                <div className="relative m-auto w-full max-w-lg bg-white border border-[#E5E5E7] rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                  <button
                    onClick={() => setShowCreateBlog(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#111111] bg-slate-50 hover:bg-slate-100 rounded-full transition-all z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="mb-5 pr-8">
                    <h4 className="text-xl font-black text-[#111111] tracking-tight">{editingBlogId ? 'Edit Blog' : 'New Blog'}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Create rich content for your audience.</p>
                  </div>

                  <form onSubmit={handleCreateBlog} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Title *</label>
                      <input type="text" required value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-slate-300" placeholder="Enter blog title" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Content *</label>
                      <textarea required value={newBlog.content} onChange={e => setNewBlog({ ...newBlog, content: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-slate-300 min-h-[120px]" placeholder="Enter blog content (HTML allowed)" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Cover Image</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setNewBlog({
                              ...newBlog,
                              image: e.target.files[0],
                              image_preview: URL.createObjectURL(e.target.files[0])
                            });
                          }
                        }} 
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#111111] file:text-white hover:file:bg-[#222222] transition-all" 
                      />
                      {newBlog.image_preview && (
                        <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                          <img src={newBlog.image_preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1 uppercase tracking-widest">Tags</label>
                      <input type="text" value={newBlog.tags || ''} onChange={e => setNewBlog({ ...newBlog, tags: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-slate-300" placeholder="e.g., equipment, tutorial, news" />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="published" checked={newBlog.published} onChange={e => setNewBlog({ ...newBlog, published: e.target.checked })} className="w-4 h-4 text-[#111111] rounded border-slate-300 focus:ring-[#111111]" />
                      <label htmlFor="published" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Publish immediately
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowCreateBlog(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs">
                        Cancel
                      </button>
                      <button type="submit" disabled={creating} className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white font-bold rounded-xl transition-all shadow-md text-xs disabled:opacity-50">
                        {creating ? 'Saving...' : 'Save Blog'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

      </div>
    </div>
  );
}
