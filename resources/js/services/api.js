import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Interceptor request — sertakan token dari localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF (opsional, tidak wajib untuk token-based)
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        if (!document.cookie.includes('XSRF-TOKEN')) {
            return axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true,
            }).then(() => config);
        }
    }
    return config;
});

let isRefreshing = false;

// Interceptor response — tangani 419, 401, 403
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        // 419 CSRF token mismatch → refresh & retry
        if (status === 419 && !isRefreshing) {
            isRefreshing = true;
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true,
            });
            isRefreshing = false;
            return api(error.config);
        }

        // 401 Unauthorized → redirect ke login, kecuali dari /user (silent)
        if (status === 401 && !window.location.pathname.startsWith('/login')) {
            if (url !== '/user') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // 403 Forbidden → refresh user data & redirect ke dashboard sesuai role
        if (status === 403 && !window.location.pathname.startsWith('/login')) {
            try {
                const res = await api.get('/user');
                const role = res.data?.data?.role;
                if (role === 'super_admin' || role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else if (role === 'seller') {
                    window.location.href = '/seller/dashboard';
                } else {
                    window.location.href = '/customer/dashboard';
                }
            } catch (e) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// ==========================================
//  Properti Seller (Private)
// ==========================================

// Ambil daftar properti milik seller
export const fetchMyProperties = (params = {}) => {
    return api.get('/seller/properties', { params });
};

export const fetchMyProperty = (id) => {
    return api.get(`/seller/properties/${id}`);
};

// Dashboard statistik seller
export const fetchSellerDashboard = (params = {}) => {
    return api.get('/seller/dashboard', { params });
};

// Upload properti baru (draft)
export const createProperty = (formData) => {
    return api.post('/seller/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Update properti
export const updateProperty = (id, formData) => {
    // Gunakan POST dengan _method=PUT untuk multipart/form-data
    formData.append('_method', 'PUT');
    return api.post(`/seller/properties/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Hapus properti (soft delete)
export const deleteProperty = (id) => {
    return api.delete(`/seller/properties/${id}`);
};

// Ajukan properti ke moderasi (draft → pending)
export const submitProperty = (id) => {
    return api.patch(`/properties/${id}/submit`);
};

// ==========================================
//  Unggulan (Featured) - Seller
// ==========================================

// Ambil estimasi antrian unggulan
export const fetchFeaturedQueueEta = () => {
    return api.get('/seller/featured-queue/eta');
};

// Inisiasi pembayaran unggulan
export const initiateFeaturedPayment = (propertyId) => {
    return api.post(`/seller/properties/${propertyId}/featured`);
};

// Verifikasi pembayaran unggulan
export const publishFeaturedProperty = (propertyId) => {
    return api.patch(`/seller/properties/${propertyId}/featured/publish`);
};

// Batalkan pembayaran unggulan yang belum selesai
export const cancelFeaturedPayment = (propertyId) => {
    return api.patch(`/seller/properties/${propertyId}/featured/cancel`);
};

// ==========================================
//  Pembayaran (Private - Seller)
// ==========================================

// Inisiasi pembayaran untuk properti approved
export const initiatePayment = (propertyId) => {
    return api.post(`/seller/properties/${propertyId}/pay`);
};

// ==========================================
//  Moderasi Properti (Private - Admin/Super Admin)
// ==========================================

// Ambil daftar properti pending
export const fetchPendingProperties = () => {
    return api.get('/admin/properties/pending');
};

// Ambil semua data properti untuk admin/super admin
export const fetchAdminProperties = (params = {}) => {
    return api.get('/admin/properties', { params });
};

export const fetchAdminUsersStats = () => {
    return api.get('/admin/users/stats');
};

export const fetchAdminAdminsStats = () => {
    return api.get('/admin/admins/stats');
};

export const fetchPaymentHistories = (params = {}) => {
    return api.get('/admin/payment-histories', { params });
};

export const fetchPaymentHistoryDetail = (id) => {
    return api.get(`/admin/payment-histories/${id}`);
};

// Setujui properti
export const approveProperty = (id) => {
    return api.patch(`/properties/${id}/approve`);
};

// Tolak properti dengan alasan
export const rejectProperty = (id, alasan) => {
    return api.patch(`/properties/${id}/reject`, { alasan });
};

// ==========================================
//  Katalog Publik (Public)
// ==========================================

// Fetch properti publik (katalog)
export const fetchPublicProperties = (params = {}) => {
    return api.get('/properties', { params });
};

// Fetch properti unggulan
export const fetchFeaturedProperties = () => {
    return api.get('/properties/featured');
};

// Fetch detail properti publik berdasarkan slug
export const fetchPublicPropertyDetail = (slug) => {
    return api.get(`/properties/${slug}`);
};

// ==========================================
//  Konten Website
// ==========================================

export const fetchWebsiteContent = () => {
    return api.get('/website-content');
};

export const fetchAdminWebsiteContent = () => {
    return api.get('/admin/website-content');
};

export const fetchMidtransConfig = () => {
    return api.get('/midtrans/config');
};

export const updateWebsiteContent = (formData) => {
    return api.post('/admin/website-content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ==========================================
//  Kontak: Laporan Pengguna & Ulasan Website
// ==========================================

export const submitUserReport = (payload) => {
    return api.post('/contact/reports', payload);
};

export const fetchMyUserReports = () => {
    return api.get('/contact/reports');
};

export const fetchUserReportMessages = (id) => {
    return api.get(`/contact/reports/${id}/messages`);
};

export const sendUserReportMessage = (id, payload) => {
    return api.post(`/contact/reports/${id}/messages`, payload);
};

export const fetchMyWebsiteReview = () => {
    return api.get('/contact/review');
};

export const upsertWebsiteReview = (payload) => {
    return api.post('/contact/review', payload);
};

export const deleteMyWebsiteReview = () => {
    return api.delete('/contact/review');
};

export const fetchPublicWebsiteReviews = (params = {}) => {
    return api.get('/reviews', { params });
};

export const fetchFeaturedWebsiteReviews = () => {
    return api.get('/reviews/featured');
};

export const fetchAdminReports = (params = {}) => {
    return api.get('/admin/reports', { params });
};

export const updateAdminReport = (id, payload) => {
    return api.patch(`/admin/reports/${id}`, payload);
};

export const fetchAdminReportMessages = (id) => {
    return api.get(`/admin/reports/${id}/messages`);
};

export const sendAdminReportMessage = (id, payload) => {
    return api.post(`/admin/reports/${id}/messages`, payload);
};

export const fetchAdminWebsiteReviews = (params = {}) => {
    return api.get('/admin/website-reviews', { params });
};

export const updateAdminWebsiteReview = (id, payload) => {
    return api.patch(`/admin/website-reviews/${id}`, payload);
};

export const confirmKtpAccess = (payload) => {
    return api.post('/admin/seller-verifications/ktp-access', payload);
};

// ==========================================
//  Riwayat Pencarian (Customer & Customer/Seller)
// ==========================================

export const fetchSearchHistory = (params = {}) => {
    return api.get('/search-history', { params });
};

export const storeSearchHistory = (payload) => {
    return api.post('/search-history', payload);
};

export const deleteSearchHistory = (id) => {
    return api.delete(`/search-history/${id}`);
};

export const clearSearchHistory = () => {
    return api.delete('/search-history');
};

export default api;
