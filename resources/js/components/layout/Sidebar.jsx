import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
    User,
    Camera,
    Lock,
    Settings,
    LogOut,
    Building2,
    Home,
    TrendingUp,
    MessageSquare,
    Heart,
    Clock,
    Bell,
    LayoutDashboard,
    UserCheck,
    Users,
    Activity,
    Flag,
    UserCog,
    ClipboardList,
    ShieldCheck
} from "lucide-react";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [avatarUrl, setAvatarUrl] = useState(null);

    // ─── State Indicator Badge Dinamis ────────────────────────────────────
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const currentRole = user?.role || "customer"; 

    // ─── Fetch Unread Counts ─────────────────────────────────────────────
    const fetchUnreadCounts = useCallback(async () => {
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
    }, [currentRole]);

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

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const roleLabel = {
        customer: "User",
        seller: "Agen Properti",
        admin: "Admin",
        super_admin: "Super Admin",
    };

    const handleAvatarClick = () => {
        document.getElementById("avatar-upload")?.click();
    };

    const isActive = (path) => {
        if (!path || path === "#") return false;
        if (path === "/seller/properties") {
            return location.pathname.startsWith("/seller/properties");
        }
        return location.pathname === path;
    };

    // ─── Menu Item Component ──────────────────────────────────────────────
    const MenuItem = ({
        icon: Icon,
        title,
        path,
        locked = false,
        badgeKey = null, // 'notifications' | 'chat' | null
    }) => {
        const active = isActive(path);
        
        // Ambil jumlah unread secara dinamis berdasarkan badgeKey
        const badgeCount = badgeKey === 'notifications' 
            ? unreadNotifCount 
            : badgeKey === 'chat' 
            ? unreadChatCount 
            : 0;

        const handleClick = (e) => {
            if (path === "#" || locked) {
                e.preventDefault();
            }
        };

        return (
            <Link
                to={path === "#" ? "#" : path}
                onClick={handleClick}
                className={`
                    relative flex items-center justify-between px-5 py-3 mx-2 my-1
                    transition-all duration-300 ease-out group text-[14px] rounded-xl overflow-hidden
                    ${
                        active
                            ? "bg-gradient-to-r from-[#D4AD5D] to-[#e8c67e] text-white shadow-md shadow-[#D4AD5D]/30"
                            : "text-[#555] hover:text-[#D4AD5D] hover:bg-[#D4AD5D]/10"
                    }
                    ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
            >
                {/* Efek Garis Samping Kiri (Aktif) */}
                <div 
                    className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-r-md transition-all duration-300 ease-out ${
                        active ? "bg-white/50 h-full" : "bg-[#D4AD5D] h-0 group-hover:h-full opacity-0 group-hover:opacity-100"
                    }`}
                />

                {/* Konten Menu dengan Efek Geser (Translate) */}
                <div className="flex items-center gap-3 transform transition-transform duration-300 group-hover:translate-x-1.5 z-10">
                    <Icon
                        size={20}
                        strokeWidth={active ? 2.5 : 2}
                        className={`transition-all duration-300 ${
                            active
                                ? "text-white scale-110"
                                : "text-[#888] group-hover:text-[#D4AD5D] group-hover:scale-110"
                        }`}
                    />
                    <span className={`transition-all duration-300 ${active ? "font-bold tracking-wide" : "font-medium"}`}>
                        {title}
                    </span>
                </div>

                {/* Badge Lingkaran Merah & Lock Icon */}
                <div className="flex items-center gap-2 transform transition-transform duration-300 group-hover:-translate-x-1 z-10">
                    {badgeCount > 0 && (
                        <span className={`text-[10px] font-bold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center shadow-sm transition-all duration-300 ${
                            active ? "bg-white text-[#D4AD5D]" : "bg-red-500 text-white animate-pulse shadow-red-500/40"
                        }`}>
                            {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                    )}
                    {locked && <Lock size={14} className="text-gray-400 group-hover:text-[#D4AD5D] transition-colors" />}
                </div>
            </Link>
        );
    };

    // ─── Menu Groups ─────────────────────────────────────────────────────
    const agentMenus = [
        { title: "Jual Properti", icon: Home, path: "#", locked: true },
        { title: "Statistics", icon: TrendingUp, path: "#", locked: true },
    ];

    const getGeneralMenus = () => {
        if (currentRole === "customer") {
            return [
                { title: "Dashboard", icon: LayoutDashboard, path: "/customer/dashboard" },
                { title: "Profil Saya", icon: User, path: "/customer/profile" },
                { title: "Pesan", icon: MessageSquare, path: "/chat", badgeKey: "chat" },
                { title: "Properti Favorit", icon: Heart, path: "/favorites" },
                { title: "Riwayat Pencarian", icon: Clock, path: "/history" },
                { title: "Notifikasi", icon: Bell, path: "/notifications", badgeKey: "notifications" },
            ];
        }
        if (currentRole === "seller") {
            return [
                { title: "Dashboard", icon: LayoutDashboard, path: "/seller/dashboard" },
                { title: "Jual Property", icon: Home, path: "/seller/properties" },
                { title: "Statistics", icon: TrendingUp, path: "/seller/stats" },
                { title: "Profil Saya", icon: User, path: "/seller/profile" },
                { title: "Pesan", icon: MessageSquare, path: "/chat", badgeKey: "chat" },
                { title: "Properti Favorit", icon: Heart, path: "/favorites" },
                { title: "Riwayat Pencarian", icon: Clock, path: "/history" },
                { title: "Notifikasi", icon: Bell, path: "/notifications", badgeKey: "notifications" },
                { title: "Profil Agen", icon: UserCheck, path: "/seller/agen" },
            ];
        }
        if (currentRole === "admin") {
            return [
                { title: "Dashboard Admin", icon: LayoutDashboard, path: "/admin/dashboard" },
                { title: "Verifikasi Agen", icon: UserCheck, path: "/admin/seller-verifications" },
                { title: "Verifikasi Properti", icon: Home, path: "/admin/properties" },
                { title: "Data Properti", icon: Building2, path: "/admin/all-properties" },
                { title: "Kelola User", icon: Users, path: "/admin/users" },
                { title: "Log Aktivitas", icon: Activity, path: "/admin/activity-logs" },
                { title: "Notifikasi", icon: Bell, path: "/notifications", badgeKey: "notifications" },
                { title: "Kelola Laporan", icon: Flag, path: "/admin/reports" },
            ];
        }
        if (currentRole === "super_admin") {
            return [
                { title: "Dashboard Super", icon: LayoutDashboard, path: "/admin/dashboard" },
                { title: "Kelola Admin", icon: UserCog, path: "/admin/admins" },
                { title: "Review KTP", icon: ShieldCheck, path: "/admin/ktp-reviews" },
                { title: "Verifikasi Agen", icon: UserCheck, path: "/admin/seller-verifications" },
                { title: "Verifikasi Properti", icon: Home, path: "/admin/properties" },
                { title: "Data Properti", icon: Building2, path: "/admin/all-properties" },
                { title: "Kelola User", icon: Users, path: "/admin/users" },
                { title: "Audit Log", icon: ClipboardList, path: "/admin/activity-logs" },
                { title: "Notifikasi", icon: Bell, path: "/notifications", badgeKey: "notifications" },
            ];
        }
        return [];
    };

    const mainMenus = getGeneralMenus();

    // ─── Main Render ─────────────────────────────────────────────────────
    return (
        <div className="space-y-4 sticky top-24 select-none w-full max-w-[280px]">
            {/* CARD 1: Profile Block */}
            <div className="bg-white rounded-[20px] shadow-sm hover:shadow-xl hover:shadow-[#D4AD5D]/10 hover:-translate-y-1 transition-all duration-500 border border-[#f0ebe1] p-6 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AD5D]/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AD5D]/20 transition-all duration-500" />
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={user?.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                        ) : (
                            <User size={40} className="text-gray-300" />
                        )}
                    </div>
                    <button
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AD5D] to-[#b8954f] text-white border-2 border-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-125 active:scale-95 z-10"
                    >
                        <Camera size={14} />
                    </button>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                </div>

                <h2 className="text-[18px] font-bold text-[#333] mb-0.5 truncate px-1 transition-colors group-hover:text-[#D4AD5D]">
                    {user?.name || "Akram Fakhri"}
                </h2>
                <p className="text-gray-500 text-[12px] mb-4 truncate px-2 font-medium">
                    {user?.email || "akramfakh@gmail.com"}
                </p>

                <div className="inline-block border border-[#D4AD5D]/50 text-[#D4AD5D] text-[11px] font-bold rounded-lg px-5 py-1 mb-3 bg-[#D4AD5D]/5 tracking-wide shadow-sm">
                    {roleLabel[currentRole] || "User"}
                </div>

                {currentRole === "customer" && (
                    <button
                        onClick={() => navigate("/customer/become-seller")}
                        className="w-full relative overflow-hidden bg-white border border-[#D4AD5D] text-[#D4AD5D] hover:text-white py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AD5D]/20 hover:-translate-y-0.5 mt-2 group/btn"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AD5D] to-[#e6bd65] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10" />
                        Upgrade ke Agen
                    </button>
                )}
            </div>

            {/* CARD 2: Locked Agent Menus (Khusus Customer) */}
            {currentRole === "customer" && (
                <div className="bg-white rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#f0ebe1] py-2">
                    {agentMenus.map((item, index) => (
                        <MenuItem key={index} {...item} />
                    ))}
                </div>
            )}

            {/* CARD 3: Main Navigation */}
            {mainMenus.length > 0 && (
                <div className="bg-white rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#f0ebe1] py-2">
                    {mainMenus.map((item, index) => (
                        <MenuItem key={index} {...item} />
                    ))}
                </div>
            )}

            {/* CARD 4: Utilities */}
            <div className="bg-white rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#f0ebe1] py-2">
                {currentRole !== 'admin' && (
                    <Link
                        to={currentRole === 'super_admin' ? '/admin/settings' : '/settings'}
                        className="relative flex items-center justify-between px-5 py-3 mx-2 rounded-xl text-[#555] hover:text-[#D4AD5D] hover:bg-[#D4AD5D]/10 transition-all duration-300 group overflow-hidden"
                    >
                        <div className="flex items-center gap-3 transform transition-transform duration-300 group-hover:translate-x-1.5">
                            <Settings size={20} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-700 text-[#888] group-hover:text-[#D4AD5D]" />
                            <span className="font-medium">Pengaturan</span>
                        </div>
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full relative flex items-center justify-between px-5 py-3 mx-2 mt-1 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group overflow-hidden"
                >
                    <div className="flex items-center gap-3 transform transition-transform duration-300 group-hover:translate-x-1.5">
                        <LogOut size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-300 text-red-400 group-hover:text-red-600" />
                        <span className="font-bold">Logout</span>
                    </div>
                </button>
            </div>

            <div className="text-center text-[10px] text-gray-400 font-medium pt-2 tracking-wide flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                HousePoint <span className="w-1 h-1 rounded-full bg-gray-300 inline-block"></span> v3.0
            </div>
        </div>
    );
};

export default Sidebar;