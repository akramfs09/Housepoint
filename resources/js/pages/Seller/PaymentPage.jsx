import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initiatePayment, fetchMyProperties, fetchMidtransConfig } from '../../services/api';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { loadMidtransSnap } from '../../utils/loadMidtransSnap';

export default function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadPrice, setUploadPrice] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [propertiesRes, configRes] = await Promise.all([
                    fetchMyProperties(),
                    fetchMidtransConfig(),
                ]);
                const { data } = propertiesRes;
                const found = (data.data || []).find((item) => item.id === parseInt(id, 10));
                if (found) setProperty(found);
                setUploadPrice(configRes.data?.data?.upload_price ?? 50000);
            } catch (error) {
                toast.error('Gagal memuat data properti.');
            }
        };

        load();
    }, [id]);

    const handlePay = async () => {
        if (!property) return;
        setLoading(true);

        try {
            const snap = await loadMidtransSnap();
            const { data } = await initiatePayment(property.id);
            const snapToken = data.data?.snap_token;

            if (snapToken && snap) {
                snap.pay(snapToken, {
                    onSuccess: async function () {
                        try {
                            const response = await api.patch(`/seller/properties/${property.id}/publish`);
                            toast.success(response.data?.message || 'Pembayaran berhasil.');
                        } catch (error) {
                            toast.error(error.response?.data?.message || 'Pembayaran sukses, tapi status properti belum bisa diperbarui.');
                        }

                        navigate('/seller/properties');
                    },
                    onPending: function () {
                        toast.success('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.');
                    },
                    onError: function () {
                        toast.error('Pembayaran gagal. Silakan coba lagi.');
                    },
                    onClose: function () {
                        toast('Anda menutup pop-up pembayaran.');
                    },
                });
            } else {
                toast.error('Gagal memuat Snap Token. Pastikan Midtrans sudah dikonfigurasi.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memulai pembayaran.');
        } finally {
            setLoading(false);
        }
    };

    if (!property) return <div className="p-6">Memuat...</div>;

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Pembayaran Upload Properti</h1>

            <div className="border rounded-xl p-6 mb-6 bg-white shadow-sm">
                <h2 className="font-semibold text-lg mb-4">{property.title}</h2>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tipe</span>
                    <span>{property.type}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Kota</span>
                    <span>{property.city}</span>
                </div>
                <div className="flex justify-between mb-4 pt-4 border-t">
                    <span className="font-bold text-lg">Total Pembayaran</span>
                    <span className="font-bold text-lg text-blue-600">
                        Rp {(Number(uploadPrice) || 0).toLocaleString('id-ID')}
                    </span>
                </div>

                <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                    {loading ? 'Memproses...' : 'Bayar Sekarang'}
                </button>

                <button
                    onClick={() => navigate('/seller/properties')}
                    className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                    Kembali ke Daftar Properti
                </button>
            </div>
        </div>
    );
}
