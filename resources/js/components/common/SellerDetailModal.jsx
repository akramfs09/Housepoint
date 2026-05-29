import { useState, useEffect } from 'react';
import api from '../../services/api';

const SellerDetailModal = ({ sellerId, isOpen, onClose, onRefresh }) => {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        if (!isOpen || !sellerId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/admin/seller-verifications/${sellerId}`);
                setSeller(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [isOpen, sellerId]);

    useEffect(() => {
        if (!isOpen) {
            setSeller(null);
            setAlasan('');
            setShowRejectInput(false);
        }
    }, [isOpen]);

    const handleApprove = async () => {
        try {
            await api.patch(`/admin/seller-verifications/${seller.id}/approve`);
            alert('Seller berhasil disetujui. Selfie telah dihapus otomatis.');
            onClose();
            onRefresh();
        } catch (err) {
            alert('Gagal menyetujui: ' + err.response?.data?.message);
        }
    };

    const handleReject = async () => {
        if (!alasan.trim()) {
            alert('Alasan penolakan harus diisi.');
            return;
        }
        try {
            await api.patch(`/admin/seller-verifications/${seller.id}/reject`, { alasan });
            onClose();
            onRefresh();
        } catch (err) {
            alert('Gagal menolak: ' + err.response?.data?.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#2c2c2c]">Detail Pengajuan Seller</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : seller ? (
                    <div className="space-y-4">
                        {/* Foto Profil Akun */}
                        {seller.foto_profil && (
                            <div className="flex justify-center">
                                <img src={seller.foto_profil} alt="Foto Profil Akun" className="w-24 h-24 rounded-full object-cover border-2 border-[#C5A065]" />
                            </div>
                        )}

                        {/* 🆕 Foto Toko */}
                        {seller.foto_toko ? (
                            <div className="flex justify-center">
                                <img src={seller.foto_toko} alt="Foto Toko" className="w-24 h-24 rounded-full object-cover border-2 border-blue-400" />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <p className="text-sm text-gray-400 italic">Tidak ada foto toko</p>
                            </div>
                        )}

                        {/* KTP dan Selfie */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-[#2c2c2c] mb-1">📄 KTP</h4>
                                {seller.ktp_url ? (
                                    <img src={seller.ktp_url} alt="KTP" className="w-full h-48 object-contain bg-gray-100 rounded-lg" />
                                ) : (
                                    <p className="text-sm text-gray-400">Tidak tersedia</p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-[#2c2c2c] mb-1">🤳 Selfie</h4>
                                {seller.selfie_url ? (
                                    <img src={seller.selfie_url} alt="Selfie" className="w-full h-48 object-contain bg-gray-100 rounded-lg" />
                                ) : (
                                    <p className="text-sm text-gray-400">Tidak tersedia</p>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-[#faf7f0] p-4 rounded-lg space-y-2">
                            <p><strong>Nama Pemilik:</strong> {seller.nama_lengkap || '-'}</p>
                            <p><strong>Nama Toko:</strong> {seller.nama_toko || '-'}</p>
                            <p><strong>Email:</strong> {seller.user?.email}</p>
                            <p><strong>No HP:</strong> {seller.no_hp || '-'}</p>
                            <p><strong>Alamat:</strong> {seller.alamat || '-'}</p>
                            <p><strong>Deskripsi:</strong> {seller.deskripsi || '-'}</p>
                        </div>

                        {/* Aksi */}
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            {!showRejectInput ? (
                                <>
                                    <button onClick={() => setShowRejectInput(true)} className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">Tolak</button>
                                    <button onClick={handleApprove} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">Setujui</button>
                                </>
                            ) : (
                                <div className="flex flex-col w-full gap-3">
                                    <textarea value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Tulis alasan penolakan..." className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" rows="3" />
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setShowRejectInput(false)} className="px-4 py-2 text-sm text-gray-600">Batal</button>
                                        <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Kirim Penolakan</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">Gagal memuat data.</div>
                )}
            </div>
        </div>
    );
};

export default SellerDetailModal;