const VITE_API_URL = import.meta.env.VITE_API_URL;
export const API_BASE = VITE_API_URL ? (VITE_API_URL.endsWith('/api') ? VITE_API_URL : `${VITE_API_URL}/api`) : '/api';

// Helper to get stored auth token
export const getAuthToken = () => localStorage.getItem('studioplus_token');

// Generic fetch wrapper with automatic JWT header attachment
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('studioplus_token');
      }
      const errorData = await res.json().catch(() => ({ message: res.statusText }));

      let errorMessage = errorData.detail || errorData.message;
      if (!errorMessage && typeof errorData === 'object') {
        const firstValue = Object.values(errorData)[0];
        if (Array.isArray(firstValue) && firstValue.length > 0) {
          errorMessage = firstValue[0];
        } else if (typeof firstValue === 'string') {
          errorMessage = firstValue;
        }
      }

      throw new Error(errorMessage || 'API Request failed');
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (error) {
    console.warn(`[API Call Fallback] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => request('/auth/register/', { method: 'POST', body: JSON.stringify(userData) }),
  firebaseLogin: (idToken, fullName) => request('/auth/firebase-login/', { method: 'POST', body: JSON.stringify({ id_token: idToken, full_name: fullName }) }),
  getProfile: () => request('/auth/profile/'),
  getUsers: () => request('/auth/users/'),
  updateUser: (id, userData) => request(`/auth/users/${id}/`, { method: 'PATCH', body: JSON.stringify(userData) }),
  deleteUser: (id) => request(`/auth/users/${id}/`, { method: 'DELETE' }),

  // Studios
  getRooms: () => request('/studios/rooms/'),
  createRoom: (roomData) => {
    if (roomData.image instanceof File) {
      const formData = new FormData();
      Object.keys(roomData).forEach(key => formData.append(key, roomData[key]));
      return request('/studios/rooms/', { method: 'POST', body: formData });
    }
    return request('/studios/rooms/', { method: 'POST', body: JSON.stringify(roomData) });
  },
  updateRoom: (id, roomData) => {
    if (roomData.image instanceof File) {
      const formData = new FormData();
      Object.keys(roomData).forEach(key => formData.append(key, roomData[key]));
      return request(`/studios/rooms/${id}/`, { method: 'PATCH', body: formData });
    }
    return request(`/studios/rooms/${id}/`, { method: 'PATCH', body: JSON.stringify(roomData) });
  },
  deleteRoom: (id) => request(`/studios/rooms/${id}/`, { method: 'DELETE' }),
  getAddons: () => request('/studios/addons/'),

  // Blogs
  getBlogs: () => request('/studios/blogs/'),
  createBlog: (blogData) => {
    if (blogData.image instanceof File) {
      const formData = new FormData();
      Object.keys(blogData).forEach(key => {
        if (blogData[key] !== null && blogData[key] !== undefined) {
          formData.append(key, blogData[key]);
        }
      });
      return request('/studios/blogs/', { method: 'POST', body: formData });
    }
    return request('/studios/blogs/', { method: 'POST', body: JSON.stringify(blogData) });
  },
  updateBlog: (id, blogData) => {
    if (blogData.image instanceof File) {
      const formData = new FormData();
      Object.keys(blogData).forEach(key => {
        if (blogData[key] !== null && blogData[key] !== undefined) {
          formData.append(key, blogData[key]);
        }
      });
      return request(`/studios/blogs/${id}/`, { method: 'PATCH', body: formData });
    }
    return request(`/studios/blogs/${id}/`, { method: 'PATCH', body: JSON.stringify(blogData) });
  },
  deleteBlog: (id) => request(`/studios/blogs/${id}/`, { method: 'DELETE' }),

  // Bookings
  getBookings: (email = '') => request(`/bookings/reservations/${email ? `?email=${email}` : ''}`),
  createBooking: (bookingData) => request('/bookings/reservations/', { method: 'POST', body: JSON.stringify(bookingData) }),
  holdSlot: (holdData) => request('/bookings/reservations/hold_slot/', { method: 'POST', body: JSON.stringify(holdData) }),
  cancelHold: (holdId) => request(`/bookings/reservations/${holdId}/release_hold/`, { method: 'POST' }),
  updateBookingStatus: (id, status) => request(`/bookings/reservations/${id}/update_status/`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getBookedSlots: (studioId, date, holdId = null) => request(`/bookings/reservations/booked_slots/?studio=${studioId}&date=${date}${holdId ? `&hold_id=${holdId}` : ''}&_t=${Date.now()}`),
  createPaymentOrder: (holdId, customerData) => request(`/bookings/reservations/${holdId}/create_payment_order/`, { method: 'POST', body: JSON.stringify(customerData) }),
  verifyPayment: (holdId, orderId) => request(`/bookings/reservations/${holdId}/verify_payment/`, { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),

  // Analytics & Audit
  getAnalytics: () => request('/analytics/summary/'),
  getUsers: () => request('/auth/users/'),
};

// Seed Fallback Data for offline / instant load preview
export const MOCK_ROOMS = [
  {
    id: 1,
    name: 'Studio A - Broadcast Presentation Suite',
    slug: 'broadcast-master-suite',
    room_type: 'BROADCAST',
    tagline: '4K Multi-Camera Live Stream & Keynote Studio',
    description: 'Designed for high-end corporate webcasts, product launches, video podcasts, and keynote broadcasts. Features acoustic floating floors, customizable DMX LED wall, and triple Shure SM7B setup.',
    hourly_rate: '120.00',
    half_day_rate: '420.00',
    full_day_rate: '780.00',
    max_capacity: 8,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    acoustics_rating: 'STC-65 Ultra Isolation Noise Floor',
    is_active: true,
    equipment: [
      { id: 1, name: 'Sony FX6 Cinema Camera', category: 'CAM', model_spec: 'Full-frame 4K 120fps Cinema Line', quantity: 3 },
      { id: 2, name: 'Shure SM7B Vocal Mic', category: 'MIC', model_spec: 'Cardioid Dynamic Studio Microphone', quantity: 4 },
      { id: 3, name: 'Aputure 600d Pro Light', category: 'LIGHT', model_spec: 'Daylight LED Monolight with Softboxes', quantity: 4 }
    ]
  },
  {
    id: 2,
    name: 'Studio B - Podcast Master Lounge',
    slug: 'podcast-lounge-suite',
    room_type: 'PODCAST',
    tagline: 'Cozy Sound-Treated Lounge for Intimate Conversations',
    description: 'Premium warm aesthetic podcast room featuring custom leather seating, Rodecaster Pro II interface, 4x Electro-Voice RE20 microphones, and ambient RGB neon backlighting.',
    hourly_rate: '85.00',
    half_day_rate: '300.00',
    full_day_rate: '550.00',
    max_capacity: 5,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
    acoustics_rating: 'STC-60 Studio Acoustical Foam & Diffusers',
    is_active: true,
    equipment: [
      { id: 4, name: 'Rodecaster Pro II Console', category: 'AUDIO', model_spec: 'Integrated Audio Production Studio', quantity: 1 },
      { id: 5, name: 'Electro-Voice RE20', category: 'MIC', model_spec: 'Broadcast Dynamic Mic with Variable-D', quantity: 4 }
    ]
  },
  {
    id: 3,
    name: 'Studio C - Audio Mastering & Voiceover Box',
    slug: 'audio-mastering-suite',
    room_type: 'AUDIO_MASTER',
    tagline: 'Whisper-Quiet Booth for Voiceovers & Sound Design',
    description: 'Precision calibrated voiceover and audio post-production room. Equipped with Neumann U87 Ai condenser microphone, Genelec 8341A SAM monitors, and Pro Tools Ultimate HD.',
    hourly_rate: '95.00',
    half_day_rate: '340.00',
    full_day_rate: '620.00',
    max_capacity: 3,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    acoustics_rating: 'NC-15 Absolute Silence Enclosure',
    is_active: true,
    equipment: []
  }
];

export const MOCK_ADDONS = [
  { id: 1, name: 'Dedicated Sound Engineer', price: '45.00', price_type: 'PER_HOUR', description: 'On-site audio technician to manage levels and live mixing.', icon_name: 'Headphones' },
  { id: 2, name: '4K Teleprompter Setup', price: '55.00', price_type: 'FLAT', description: '17-inch presidential teleprompter with operator iPad app.', icon_name: 'Tv' },
  { id: 3, name: 'Raw Footage Export (SSD Drive)', price: '35.00', price_type: 'FLAT', description: 'Instant ISO camera file export to high-speed USB-C drive.', icon_name: 'HardDrive' }
];
