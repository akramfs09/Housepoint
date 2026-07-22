import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './router/AppRouter';
import { useAuth } from './hooks/useAuth';      // ✅ perbaiki di sini
import echo, { refreshEchoAuthToken } from './echo';
import { toast } from 'react-hot-toast';

// Komponen dalam yang bisa mengakses AuthContext
function AppInner() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        refreshEchoAuthToken();
        const channel = echo.private(`user.${user.id}`);

        // Listener chat yang sudah ada (tetap dipertahankan)
        channel.listen('.new.message', (data) => {
            toast.success(`${data.sender_name}: ${data.body}`);
        });

        // Listener notifikasi Laravel (database + broadcast)
        channel.notification((notification) => {
            const payload = notification.data || notification;
            const { type, ...data } = payload;

            switch (type) {
                case 'chat_message':
                    toast.success(`${data.sender_name}: ${data.body}`);
                    break;
                case 'seller_verification':
                    if (data.status === 'approved') {
                        toast.success('Pengajuan seller Anda disetujui!');
                    } else {
                        toast.error(`❌ Pengajuan seller ditolak: ${data.alasan || 'tanpa alasan'}`);
                    }
                    break;
                case 'property_moderation':
                    if (data.status === 'approved') {
                        toast.success('Properti Anda disetujui!');
                    } else {
                        toast.error(`❌ Properti ditolak: ${data.alasan || 'tanpa alasan'}`);
                    }
                    break;
                case 'appeal':
                    if (data.status === 'approved') {
                        toast.success('Banding Anda disetujui!');
                    } else {
                        toast.error(`❌ Banding ditolak: ${data.catatan || 'tanpa catatan'}`);
                    }
                    break;
                case 'payment_success':
                    toast.success('Pembayaran berhasil! Properti Anda telah dipublikasikan.');
                    break;
                case 'new_seller_application':
                    toast.info(`Pengajuan seller baru dari ${data.seller_name}`);
                    break;
                case 'new_property_submission':
                    toast.info(`Properti baru diajukan: ${data.title}`);
                    break;
                case 'new_appeal':
                    toast.info(`Banding baru dari ${data.seller_name}`);
                    break;
                default:
                    toast.info('ℹAnda memiliki notifikasi baru');
            }

            // Anda juga bisa memicu event custom untuk memperbarui badge lonceng
            window.dispatchEvent(new CustomEvent('new-notification', {
                detail: {
                    id: notification.id || `broadcast-${Date.now()}`,
                    data: payload,
                    read_at: null,
                    created_at: notification.created_at || new Date().toISOString(),
                },
            }));
        });

        return () => {
            echo.leaveChannel(`user.${user.id}`);
        };
    }, [user]);

    return (
        <ErrorBoundary>
            <AppRouter />
        </ErrorBoundary>
    );
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppInner />
            </AuthProvider>
        </Router>
    );
}
