import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear and redirect if on protected route
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('foodbridge_token');
        localStorage.removeItem('foodbridge_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

// Donations APIs
export const donationsApi = {
  getAll: (params) => api.get('/api/donations', { params }),
  getById: (id) => api.get(`/api/donations/${id}`),
  create: (data) => api.post('/api/donations', data),
  update: (id, data) => api.put(`/api/donations/${id}`, data),
  cancel: (id, data) => api.post(`/api/donations/${id}/cancel`, data),
  uploadImage: (id, formData) =>
    api.post(`/api/donations/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyDonorDonations: () => api.get('/api/donations/my/donor'),
};

// Requests APIs
export const requestsApi = {
  requestDonation: (donationId, data) => api.post(`/api/donations/${donationId}/request`, data),
  getMyNgoRequests: () => api.get('/api/requests/my'),
  getDonationRequests: (donationId) => api.get(`/api/donations/${donationId}/requests`),
  decideRequest: (requestId, data) => api.post(`/api/requests/${requestId}/decision`, data),
};

// Collections APIs
export const collectionsApi = {
  getDetails: (donationId) => api.get(`/api/collections/${donationId}`),
  markReady: (donationId) => api.post(`/api/collections/${donationId}/ready`),
  verifyHandoff: (donationId, data) => api.post(`/api/collections/${donationId}/verify-handoff`, data),
};

// Notifications APIs
export const notificationsApi = {
  getAll: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all'),
};

// Feedback & Reports APIs
export const feedbackReportsApi = {
  submitFeedback: (data) => api.post('/api/feedback', data),
  getDonationFeedback: (donationId) => api.get(`/api/feedback/donation/${donationId}`),
  submitReport: (data) => api.post('/api/reports', data),
  getMyReports: () => api.get('/api/reports/my'),
};

// Admin APIs
export const adminApi = {
  getUsers: (params) => api.get('/api/admin/users', { params }),
  toggleUserStatus: (userId) => api.put(`/api/admin/users/${userId}/toggle-status`),
  verifyNgo: (ngoUserId, data) => api.put(`/api/admin/ngos/${ngoUserId}/verify`, data),
  getDonations: (params) => api.get('/api/admin/donations', { params }),
  deleteDonation: (donationId, reason) => api.delete(`/api/admin/donations/${donationId}`, { params: { reason } }),
  getRequests: () => api.get('/api/admin/requests'),
  getReports: (params) => api.get('/api/admin/reports', { params }),
  resolveReport: (reportId, data) => api.put(`/api/admin/reports/${reportId}/resolve`, data),
};

// Analytics APIs
export const analyticsApi = {
  getOverview: () => api.get('/api/analytics/overview'),
  getCategories: () => api.get('/api/analytics/categories'),
  getTrends: () => api.get('/api/analytics/trends'),
  getDonorStats: () => api.get('/api/analytics/donor'),
  getNgoStats: () => api.get('/api/analytics/ngo'),
};

export default api;

