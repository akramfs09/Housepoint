import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const menuItems = {
        customer: [
            { label: '🏠 Jual Propertimu', path: '/customer/become-seller' },
            { label: '📈 Statistik Properti', path: '/customer/become-seller' },
            { label: '👤 Profil Saya', path: '/customer/profile' },
            { label: '💬a Pesan', path: '/chat' },
            { label: '❤️a Properti Favorit', path: '/favorites' },
            { label: '⏱️ Riwayat', path: '#', disabled: true, soon: true },
            { label: '🔔a Notifikasi', path: '/notifications' },
            { label: '⚙️ Pengaturan Akun', path: '#', disabled: true, soon: true },
        ],
        seller: [
            { label: '📋 Jual Property', path: '/seller/properties', icon: '📋' },
            { label: '📈 Statistik Properti', path: '/seller/stats' },
            { label: '📊 Dashboard Seller', path: '/seller/dashboard' },
            { label: '👤 Profil Saya', path: '/seller/profile' },
            { label: '💬 Pesan', path: '/chat' },
            { label: '❤️ Properti Favorit', path: '/favorites' },
            { label: '⏱️ Riwayat', path: '#', disabled: true, soon: true },
            { label: '🔔 Notifikasi', path: '/notifications' },
            { label: '🏪 Profil Toko', path: '/seller/store' },
            { label: '⚙️ Pengaturan Akun', path: '#', disabled: true, soon: true },
        ],
        admin: [
            { label: '📊 Dashboard Admin', path: '/admin/dashboard' },
            { label: '✅ Verifikasi Agen', path: '/admin/seller-verifications' },
            { label: '🏠 Verifikasi Properti', path: '/admin/properties', icon: '🏠' },
            { label: '🚩 Data Properti', path: '#', disabled: true, soon: true },
            { label: '👥 Kelola User', path: '/admin/users' },
            { label: '📋 Log Aktivitas', path: '/admin/activity-logs' },
            { label: '🔔 Notifikasi', path: '/notifications' },
            { label: '🚩 Kelola Laporan', path: '#', disabled: true, soon: true },
        ],
        super_admin: [
            { label: '📊 Dashboard Super Admin', path: '/admin/dashboard' },
            { label: '✅ Verifikasi Seller', path: '/admin/seller-verifications' },
            { label: '🏠 Moderasi Properti', path: '/admin/properties', icon: '🏠' },
            { label: '👥 Kelola User', path: '/admin/users' },
            { label: '👤 Kelola Admin Lain', path: '/admin/admins' },
            { label: '📋 Log Aktivitas', path: '/admin/activity-logs' },
            { label: '📋 Audit Log', path: '/admin/admins/audit-logs' },
            { label: '🔔 Notifikasi', path: '/notifications' },
            { label: '🚩 Kelola Laporan', path: '#', disabled: true, soon: true },
        ],
    };

    const items = menuItems[user?.role] || [];

    const isActive = (path) => {
        if (path === '#') return false;
        if (path === '/seller/properties') {
            return location.pathname.startsWith('/seller/properties');
        }
        return location.pathname === path;
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] overflow-hidden sticky top-24">
            <div className="p-5 bg-[#faf7f0] border-b border-[#e5d8c0] text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A065] flex items-center justify-center text-white font-bold text-xl mb-3">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <p className="font-bold text-[#2c2c2c] text-sm">{user?.name || user?.email}</p>
                <p className="text-[11px] text-gray-500 mt-1 truncate">✉️ {user?.email}</p>
                <span className="inline-block mt-2 text-[11px] bg-[#C5A065] text-white px-3 py-1 rounded-full">
                    {user?.role === 'super_admin' ? 'Super Admin' : 
                     user?.role === 'admin' ? 'Admin' : 
                     user?.role === 'seller' ? 'Seller' : 'Customer'}
                </span>
            </div>

            <nav className="py-3">
                {items.map((item, index) => (
                    <Link
                        key={index}
                        to={item.disabled ? '#' : item.path}
                        onClick={(e) => item.disabled && e.preventDefault()}
                        className={`flex items-center gap-3 px-5 py-3 text-[13px] transition border-l-[3px] ${
                            isActive(item.path)
                                ? 'bg-[#faf7f0] text-[#C5A065] border-l-[#C5A065] font-medium'
                                : item.disabled
                                    ? 'text-gray-400 cursor-not-allowed border-l-transparent'
                                    : 'text-[#2c2c2c] hover:bg-[#faf7f0] hover:text-[#C5A065] border-l-transparent'
                        }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.soon && (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                                Segera
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="border-t border-[#e5d8c0] px-5 py-3">
                <button
                    onClick={handleLogout}
                    className="w-full text-left text-[13px] text-red-500 hover:bg-red-50 rounded-lg px-4 py-2 transition flex items-center gap-3"
                >
                    <span className="text-lg">🚪</span> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;