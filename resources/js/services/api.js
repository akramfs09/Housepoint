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

// Fetch detail properti publik berdasarkan slug
export const fetchPublicPropertyDetail = (slug) => {
    return api.get(`/properties/${slug}`);
};

export default api;