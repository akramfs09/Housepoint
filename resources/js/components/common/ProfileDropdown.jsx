import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        navigate('/');
    };

    // Menu berdasarkan role
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
            { label: '✅ Verifikasi Seller', path: '/admin/seller-verifications' },
            { label: '🏠 Moderasi Properti', path: '/admin/properties', icon: '🏠' },
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Tombol Profil */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 border border-[#d7c8b1] rounded-full px-4 py-2 bg-white shadow-sm hover:bg-gray-50 transition"
            >
                <div className="w-8 h-8 rounded-full bg-[#C5A065] flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-[13px] font-medium text-[#5a554c] hidden sm:block">
                    {user?.name || user?.email}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#e5d8c0] z-50 overflow-hidden">
                    {/* Info Profil */}
                    <div className="p-4 bg-[#faf7f0] border-b border-[#e5d8c0]">
                        <p className="font-bold text-[#2c2c2c] text-sm">{user?.name || user?.email}</p>
                        <p className="text-[11px] text-gray-500 mt-1">✉️ {user?.email}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            🏷️ Role: {
                                user?.role === 'super_admin' ? 'Super Admin' : 
                                user?.role === 'admin' ? 'Admin' : 
                                user?.role === 'seller' ? 'Seller' : 'Customer'
                            }
                            &nbsp;&nbsp;🟢 Aktif
                        </p>
                    </div>

                    {/* Menu Navigasi */}
                    <div className="py-2">
                        {items.map((item, index) => (
                            <Link
                                key={index}
                                to={item.disabled ? '#' : item.path}
                                onClick={() => { if (!item.disabled) setIsOpen(false); }}
                                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition ${
                                    item.disabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-[#2c2c2c] hover:bg-[#faf7f0] hover:text-[#C5A065]'
                                }`}
                            >
                                <span>{item.label}</span>
                                {item.soon && (
                                    <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                                        Segera
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#e5d8c0]">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition flex items-center gap-3"
                        >
                            🚪 Keluar Sesi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;