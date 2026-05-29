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

export default api;