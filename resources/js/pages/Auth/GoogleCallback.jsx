import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/**
 * Halaman callback setelah login dengan Google.
 * Laravel redirect ke /auth/google/callback?token=xxx
 * Halaman ini mengambil token, menyimpannya, dan redirect ke dashboard.
 */
const GoogleCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [status, setStatus] = useState('Memproses login Google...');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            const messages = {
                google_not_configured: 'Fitur login Google belum dikonfigurasi.',
                google_failed: 'Login Google gagal. Silakan coba lagi.',
                banned: 'Akun Anda telah diblokir.',
            };
            setStatus(messages[error] || 'Terjadi kesalahan.');
            setTimeout(() => navigate('/login'), 2500);
            return;
        }

        if (!token) {
            setStatus('Token tidak ditemukan.');
            setTimeout(() => navigate('/login'), 2500);
            return;
        }

        // Simpan token ke localStorage
        localStorage.setItem('token', token);

        // Fetch data user
        api.get('/user')
            .then(({ data }) => {
                const user = data.data;
                setUser(user);

                // Redirect ke dashboard sesuai role
                const roleRoutes = {
                    customer: '/dashboard',
                    seller: '/seller/dashboard',
                    admin: '/admin/dashboard',
                    super_admin: '/admin/dashboard',
                };
                navigate(roleRoutes[user.role] ?? '/');
            })
            .catch(() => {
                localStorage.removeItem('token');
                setStatus('Gagal memuat data pengguna.');
                setTimeout(() => navigate('/login'), 2500);
            });
    }, [navigate, setUser]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2]">
            <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-4 max-w-sm w-full">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-[#D4A44C] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-600 text-center">{status}</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
