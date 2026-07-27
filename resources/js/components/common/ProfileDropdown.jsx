import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
    Home,
    TrendingUp,
    User,
    MessageSquare,
    Heart,
    Clock,
    Bell,
    Settings,
    LayoutDashboard,
    Store,
    UserCheck,
    Users,
    Activity,
    Flag,
    UserCog,
    ClipboardList,
    LogOut,
    ChevronDown,
    Building2,
    ShieldCheck
} from "lucide-react";

const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

    // ─── State Indicator Badge Dinamis ────────────────────────────────────
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const currentRole = user?.role || "customer";

    // ─── Fetch Unread Counts ─────────────────────────────────────────────
    const fetchUnreadCounts = useCallback(async () => {
        if (!user) return;
        try {
            // Notifikasi Count
            const notifRes = await api.get('/notifications/unread-count');
            setUnreadNotifCount(notifRes.data?.count ?? 0);

            // Chat Count (khusus role yang memiliki fitur chat)
            if (currentRole === 'customer' || currentRole === 'seller') {
                const chatRes = await api.get('/chat/conversations', { params: { per_page: 5 } });
                const statsUnread = chatRes.data?.stats?.unread;
                if (typeof statsUnread === 'number') {
                    setUnreadChatCount(statsUnread);
                } else {
                    const convList = chatRes.data?.data?.data || chatRes.data?.data || [];
                    const unreadSum = Array.isArray(convList) 
                        ? convList.reduce((acc, c) => acc + (c.unread_count || 0), 0)
                        : 0;
                    setUnreadChatCount(unreadSum);
                }
            }
        } catch {
            // Failover silent
        }
    }, [user, currentRole]);

    useEffect(() => {
        fetchUnreadCounts();

        const handleUpdate = () => fetchUnreadCounts();
        window.addEventListener('notifications-updated', handleUpdate);
        window.addEventListener('new-notification', handleUpdate);
        window.addEventListener('chat-updated', handleUpdate);

        return () => {
            window.removeEventListener('notifications-updated', handleUpdate);
            window.removeEventListener('new-notification', handleUpdate);
            window.removeEventListener('chat-updated', handleUpdate);
        };
    }, [fetchUnreadCounts]);

    useEffect(() => {
        const url = user?.avatar_url ||
                    user?.profile?.foto_profil ||
                    user?.profile?.foto_agen ||
                    user?.customer_profile?.foto_profil ||
                    user?.seller_profile?.foto_agen ||
                    user?.seller_profile?.foto_toko;
        setAvatarUrl(url || null);
    }, [user]);

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

    const roleLabel = {
        customer: "User",
        seller: "Agen Properti",
        admin: "Admin",
        super_admin: "Super Admin",
    };

    const menuItems = {
        customer: [
            { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
            { label: 'Profil Saya', path: '/customer/profile', icon: User },
            { label: 'Pesan', path: '/chat', icon: MessageSquare, badgeKey: 'chat' },
            { label: 'Properti Favorit', path: '/favorites', icon: Heart },
            { label: 'Riwayat Pencarian', path: '/history', icon: Clock },
            { label: 'Notifikasi', path: '/notifications', icon: Bell, badgeKey: 'notifications' },
            { label: 'Pengaturan', path: '/settings', icon: Settings },
        ],
        seller: [
            { label: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
            { label: 'Jual Property', path: '/seller/properties', icon: Home },
            { label: 'Statistics', path: '/seller/stats', icon: TrendingUp },
            { label: 'Profil Saya', path: '/seller/profile', icon: User },
            { label: 'Pesan', path: '/chat', icon: MessageSquare, badgeKey: 'chat' },
            { label: 'Properti Favorit', path: '/favorites', icon: Heart },
            { label: 'Riwayat Pencarian', path: '/history', icon: Clock },
            { label: 'Notifikasi', path: '/notifications', icon: Bell, badgeKey: 'notifications' },
            { label: 'Profil Agen', path: '/seller/agen', icon: UserCheck },
            { label: 'Pengaturan', path: '/settings', icon: Settings },
        ],
        admin: [
            { label: 'Dashboard Admin', path: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'Verifikasi Agen', path: '/admin/seller-verifications', icon: UserCheck },
            { label: 'Verifikasi Properti', path: '/admin/properties', icon: Home },
            { label: 'Data Properti', path: '/admin/all-properties', icon: Building2 },
            { label: 'Kelola User', path: '/admin/users', icon: Users },
            { label: 'Log Aktivitas', path: '/admin/activity-logs', icon: Activity },
            { label: 'Notifikasi', path: '/notifications', icon: Bell, badgeKey: 'notifications' },
            { label: 'Kelola Laporan', path: '/admin/reports', icon: Flag },
        ],
        super_admin: [
            { label: 'Dashboard Super', path: '/admin/dashboard', icon: LayoutDashboard },
            { label: 'Kelola Admin', path: '/admin/admins', icon: UserCog },
            { label: 'Review KTP', path: '/admin/ktp-reviews', icon: ShieldCheck },
            { label: 'Verifikasi Agen', path: '/admin/seller-verifications', icon: UserCheck },
            { label: 'Verifikasi Properti', path: '/admin/properties', icon: Home },
            { label: 'Data Properti', path: '/admin/all-properties', icon: Building2 },
            { label: 'Kelola User', path: '/admin/users', icon: Users },
            { label: 'Audit Log', path: '/admin/activity-logs', icon: ClipboardList },
            { label: 'Notifikasi', path: '/notifications', icon: Bell, badgeKey: 'notifications' },
            { label: 'Pengaturan', path: '/admin/settings', icon: Settings },
        ],
    };

    const items = menuItems[user?.role] || [];
    const totalUnread = unreadNotifCount + unreadChatCount;

    return (
        <div className="relative select-none" ref={dropdownRef}>
            {/* Tombol Profil (Trigger) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white border transition-all duration-300 outline-none relative
                    ${isOpen ? 'border-[#D4AD5D] shadow-md shadow-[#D4AD5D]/20 ring-4 ring-[#D4AD5D]/10' : 'border-[#f0ebe1] hover:border-[#D4AD5D]/50 hover:shadow-md'}
                `}
            >
                {/* Bagian Avatar + Indicator Badge Total Unread */}
                <div className="relative shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AD5D] to-[#e6bd65] p-[2px] shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[#D4AD5D] font-bold text-[15px]">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>

                    {/* Badge Lingkaran Merah jika ada pesan/notifikasi masuk */}
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                    )}
                </div>

                {/* Bagian Teks Nama & Role */}
                <div className="hidden sm:flex flex-col items-start text-left max-w-[150px]">
                    <span className="text-[14px] font-bold text-[#2c2c2c] truncate w-full group-hover:text-[#D4AD5D] transition-colors leading-tight">
                        {user?.name || 'Pengguna'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium truncate w-full mt-0.5">
                        {roleLabel[currentRole]}
                    </span>
                </div>

                {/* Ikon Dropdown */}
                <ChevronDown 
                    size={16} 
                    className={`text-gray-400 ml-1 shrink-0 transition-transform duration-300 group-hover:text-[#D4AD5D] ${isOpen ? 'rotate-180 text-[#D4AD5D]' : ''}`} 
                />
            </button>

            {/* Dropdown Menu Pane */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[20px] shadow-2xl shadow-[#D4AD5D]/10 border border-[#f0ebe1] z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Header Info Profil */}
                    <div className="p-5 bg-gradient-to-b from-[#faf7f0] to-white border-b border-[#f0ebe1] relative overflow-hidden group/header">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AD5D]/10 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2" />
                        
                        <h3 className="font-bold text-[#2c2c2c] text-[15px] truncate pr-2">
                            {user?.name || user?.email}
                        </h3>
                        <p className="text-[12px] text-gray-500 mt-1 truncate">
                            {user?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="inline-block border border-[#D4AD5D]/50 text-[#D4AD5D] text-[10px] font-bold rounded-lg px-3 py-1 bg-[#D4AD5D]/5 tracking-wide">
                                {roleLabel[currentRole]}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Online
                            </span>
                        </div>
                    </div>

                    {/* Menu Navigasi */}
                    <div className="py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {items.map((item, index) => {
                            const Icon = item.icon;
                            const badgeCount = item.badgeKey === 'notifications' 
                                ? unreadNotifCount 
                                : item.badgeKey === 'chat' 
                                ? unreadChatCount 
                                : 0;

                            return (
                                <Link
                                    key={index}
                                    to={item.disabled ? '#' : item.path}
                                    onClick={(e) => {
                                        if (item.disabled) {
                                            e.preventDefault();
                                        } else {
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`
                                        flex items-center justify-between px-5 py-2.5 mx-2 my-0.5 rounded-xl transition-all duration-300 group/menu
                                        ${item.disabled 
                                            ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                            : 'text-[#555] hover:bg-[#D4AD5D]/10 hover:text-[#D4AD5D] cursor-pointer'
                                        }
                                    `}
                                >
                                    <div className={`flex items-center gap-3 transform transition-transform duration-300 ${!item.disabled && 'group-hover/menu:translate-x-1.5'}`}>
                                        <Icon 
                                            size={18} 
                                            strokeWidth={2} 
                                            className={`transition-colors duration-300 ${!item.disabled && 'text-gray-400 group-hover/menu:text-[#D4AD5D]'}`} 
                                        />
                                        <span className="text-[13px] font-medium">{item.label}</span>
                                    </div>

                                    {/* Badge Indikator Unread */}
                                    {badgeCount > 0 && (
                                        <span className="text-[10px] font-bold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/40">
                                            {badgeCount > 99 ? '99+' : badgeCount}
                                        </span>
                                    )}

                                    {item.soon && (
                                        <span className="text-[9px] font-bold bg-[#f0ebe1] text-gray-500 px-2 py-0.5 rounded-md tracking-wider">
                                            SOON
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer / Logout */}
                    <div className="p-2 border-t border-[#f0ebe1] bg-gray-50/50">
                        <button
                            onClick={handleLogout}
                            className="w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group/logout overflow-hidden"
                        >
                            <div className="flex items-center gap-3 transform transition-transform duration-300 group-hover/logout:translate-x-1">
                                <LogOut size={18} strokeWidth={2} className="group-hover/logout:scale-110 transition-transform duration-300 text-red-400 group-hover/logout:text-red-600" />
                                <span className="text-[13px] font-bold">Keluar Sesi</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;