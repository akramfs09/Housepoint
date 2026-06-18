import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Ambil jumlah unread & 5 notifikasi terbaru
    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count ?? 0);
        } catch {}
    }, []);

    const fetchLatest = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications?per_page=5');
            const list = data?.data?.data || data?.data || [];
            setNotifications(Array.isArray(list) ? list : []);
        } catch {}
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        fetchLatest();

        // Tangani event real‑time dari App.jsx
        const handleNewNotification = (e) => {
            const newNotif = e.detail;
            // Tambahkan notif baru ke urutan pertama, jaga maksimal 5
            setNotifications(prev => {
                const updated = [newNotif, ...prev];
                if (updated.length > 5) updated.pop();
                return updated;
            });
            setUnreadCount(prev => prev + 1);
        };

        window.addEventListener('new-notification', handleNewNotification);
        return () => window.removeEventListener('new-notification', handleNewNotification);
    }, [fetchUnreadCount, fetchLatest]);

    const handleToggle = () => {
        setOpen(prev => !prev);
        // Refresh daftar setiap kali dropdown dibuka
        if (!open) fetchLatest();
    };

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch {}
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative p-2 text-2xl hover:bg-white/10 rounded-full transition"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b flex justify-between items-center">
                        <span className="font-semibold text-sm">Notifikasi</span>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm">Tidak ada notifikasi</p>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className={`p-3 hover:bg-gray-50 border-b last:border-0 text-sm ${!n.read_at ? 'bg-[#faf7f0]' : ''}`}>
                                {/* Render sesuai tipe */}
                                {n.data?.type === 'chat_message' && (
                                    <p><strong>{n.data.sender_name}</strong>: {n.data.body?.substring(0, 50)}</p>
                                )}
                                {n.data?.type === 'seller_verification' && (
                                    <p>Pengajuan seller <strong>{n.data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong></p>
                                )}
                                {n.data?.type === 'property_moderation' && (
                                    <p>Properti <strong>{n.data.title}</strong> <strong>{n.data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong></p>
                                )}
                                {n.data?.type === 'appeal' && (
                                    <p>Banding <strong>{n.data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong></p>
                                )}
                                {n.data?.type === 'payment_success' && (
                                    <p>Pembayaran berhasil! Properti <strong>{n.data.title}</strong> telah dipublikasikan.</p>
                                )}
                                {n.data?.type === 'new_seller_application' && (
                                    <p>Pengajuan seller baru dari <strong>{n.data.seller_name}</strong></p>
                                )}
                                {n.data?.type === 'new_property_submission' && (
                                    <p>Properti <strong>{n.data.title}</strong> diajukan</p>
                                )}
                                {n.data?.type === 'new_appeal' && (
                                    <p>Banding baru dari <strong>{n.data.seller_name}</strong></p>
                                )}
                                <span className="text-xs text-gray-400 block mt-1">
                                    {new Date(n.created_at).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))
                    )}
                    <Link
                        to="/notifications"
                        onClick={() => setOpen(false)}
                        className="block text-center p-2 text-blue-600 text-sm hover:bg-gray-50 border-t"
                    >
                        Lihat semua
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;