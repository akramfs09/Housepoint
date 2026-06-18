import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    fetchFeaturedQueueEta,
    initiateFeaturedPayment,
    publishFeaturedProperty,
} from '../../services/api';

const FeaturedModal = ({ property, onClose }) => {
    const [eta, setEta] = useState(null);
    const [loading, setLoading] = useState(false);

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    useEffect(() => {
        const fetchEta = async () => {
            try {
                const { data } = await fetchFeaturedQueueEta();
                setEta(data.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal memuat estimasi antrian.');
            }
        };

        fetchEta();
    }, []);

    const handlePay = async () => {
        if (!window.snap) {
            toast.error('Midtrans Snap belum siap. Muat ulang halaman lalu coba lagi.');
            return;
        }

        setLoading(true);

        try {
            const { data } = await initiateFeaturedPayment(property.id);
            const snapToken = data.data?.snap_token;

            if (!snapToken) {
                toast.error('Snap Token tidak tersedia.');
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: async () => {
                    try {
                        await publishFeaturedProperty(property.id);
                        toast.success('Properti masuk antrian unggulan.');
                        onClose(true);
                    } catch (error) {
                        toast.error(error.response?.data?.message || 'Pembayaran sukses, tapi antrian belum bisa diperbarui.');
                    }
                },
                onPending: () => {
                    toast.success('Pembayaran tertunda. Selesaikan pembayaran agar properti masuk antrian.');
                },
                onError: () => {
                    toast.error('Pembayaran gagal.');
                },
                onClose: () => {
                    toast('Popup pembayaran ditutup.');
                },
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memproses pembayaran unggulan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">Upgrade ke Unggulan</h2>
                <p className="text-sm mb-4">{property.title} ({property.type})</p>

                {eta && (
                    <div className="bg-gray-100 p-3 rounded-lg text-sm mb-4 space-y-1">
                        <p>Posisi antrian: <strong>{eta.position}</strong></p>
                        <p>Estimasi tayang: <strong>{eta.estimated_date}</strong> ({eta.eta_days} hari)</p>
                        <p>Durasi tayang: <strong>{eta.duration_days} hari</strong></p>
                        <p className="text-xs text-gray-500 mt-1">*Estimasi dapat berubah</p>
                    </div>
                )}

                <p className="text-lg font-semibold mb-4">Biaya: {formatCurrency(eta?.price || 50000)}</p>

                <div className="flex gap-2 justify-end">
                    <button onClick={() => onClose(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                        Batal
                    </button>
                    <button
                        onClick={handlePay}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturedModal;
