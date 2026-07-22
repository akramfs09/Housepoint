import { useState, useEffect } from 'react';
import api from '../../services/api';

const SellerDetailModal = ({ sellerId, isOpen, onClose, onRefresh, reviewMode = false, showActions = true }) => {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        if (!isOpen || !sellerId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const url = reviewMode
                    ? `/admin/seller-verifications/${sellerId}?review_mode=1`
                    : `/admin/seller-verifications/${sellerId}`;
                const res = await api.get(url);
                setSeller(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [isOpen, sellerId, reviewMode]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
            <div className="bg-[#fdfaf5] w-full max-w-4xl rounded-3xl p-6 md:p-10 max-h-[92vh] overflow-y-auto shadow-2xl relative border border-[#e5d8c0]">
                
                {/* Tombol Close Modal */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 font-bold text-xl transition-colors"
                >
                    ✕
                </button>

                {/* Header Title Desain */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2c2c2c] tracking-tight">Upgrade ke Agen</h1>
                    <p className="text-sm text-[#8b8478] mt-1">Lengkapi data berikut untuk mendapatkan akses menjual properti</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-[#8b8478] font-medium">Memuat detail pengajuan...</div>
                ) : seller ? (
                    <div className="space-y-8 text-left">
                        
                        {/* --- SECTION 1: DATA DIRI --- */}
                        <div>
                            <h3 className="text-[15px] font-bold text-[#2c2c2c] tracking-wide mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#8c6b29]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Data Diri
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Nama Lengkap</label>
                                    <input type="text" readOnly value={seller.nama_lengkap || '-'} className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none"/>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Email Perusahaan (Opsional)</label>
                                    <input type="text" readOnly value={seller.user?.email || '-'} className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none"/>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Nomor Telepon</label>
                                    <input type="text" readOnly value={seller.no_hp || '-'} className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none"/>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Kota / Provinsi</label>
                                    <input type="text" readOnly value={seller.kota || seller.city || seller.province || '-'} className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none"/>
                                </div>
                            </div>
                            <div className="mt-5">
                                <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Alamat Lengkap</label>
                                <textarea readOnly value={seller.alamat || '-'} rows="3" className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none resize-none"></textarea>
                            </div>
                        </div>

                        {/* --- SECTION 2: IDENTITAS --- */}
                        <div>
                            <h3 className="text-[15px] font-bold text-[#2c2c2c] tracking-wide mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#8c6b29]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Identitas
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full md:w-80 h-52 bg-[#ebdcc3]/40 rounded-2xl overflow-hidden border border-[#e5d8c0] flex items-center justify-center shrink-0">
                                    {seller.ktp_url ? (
                                        <img src={seller.ktp_url} alt="KTP" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="px-4 text-center text-xs text-gray-400 italic leading-relaxed">
                                            KTP hanya bisa dibuka oleh superadmin setelah verifikasi tambahan.
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-sm font-bold text-[#2c2c2c]">Panduan Foto Selfie:</h4>
                                    <ul className="text-xs text-[#5c564c] space-y-1.5 list-none">
                                        <li className="flex items-start gap-2">✓ <span>Foto kartu identitas anda KTP/SIM</span></li>
                                        <li className="flex items-start gap-2">✓ <span>Pastikan teks pada KTP/SIM terlihat jelas.</span></li>
                                        <li className="flex items-start gap-2">✓ <span>Gunakan pencahayaan yang terang.</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 3: VERIFIKASI WAJAH --- */}
                        <div>
                            <h3 className="text-[15px] font-bold text-[#2c2c2c] tracking-wide mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#8c6b29]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verifikasi Wajah
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full md:w-80 h-52 bg-[#ebdcc3]/40 rounded-2xl overflow-hidden border border-[#e5d8c0] flex items-center justify-center shrink-0">
                                    {seller.selfie_url ? (
                                        <img src={seller.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Selfie tidak tersedia</span>
                                    )}
                                </div>
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-sm font-bold text-[#2c2c2c]">Panduan Foto Selfie:</h4>
                                    <ul className="text-xs text-[#5c564c] space-y-1.5 list-none">
                                        <li className="flex items-start gap-2">✓ <span>Pegang KTP di bawah dagu tanpa menutupi wajah.</span></li>
                                        <li className="flex items-start gap-2">✓ <span>Pastikan wajah dan teks pada KTP terlihat jelas.</span></li>
                                        <li className="flex items-start gap-2">✓ <span>Gunakan pencahayaan yang terang.</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 4: INFORMASI TAMBAHAN --- */}
                        <div>
                            <h3 className="text-[15px] font-bold text-[#2c2c2c] tracking-wide mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#8c6b29]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Informasi Tambahan
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Nama Agen (Opsional)</label>
                                    <input type="text" readOnly value={seller.nama_agen || '-'} className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none"/>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#2c2c2c] tracking-wider mb-1.5 uppercase">Pengalaman Bidang Properti</label>
                                    <textarea readOnly value={seller.deskripsi || '-'} rows="3" className="w-full bg-white border border-[#e5d8c0] rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none resize-none"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Checkbox Deklarasi */}
                        <div className="flex items-start gap-3 pt-2 text-[#5c564c]">
                            <input type="checkbox" checked readOnly className="mt-1 accent-[#D4AD5D] h-4 w-4 rounded" />
                            <p className="text-xs leading-relaxed">
                                Saya menyatakan bahwa semua data yang saya lampirkan adalah benar dan dapat dipertanggungjawabkan. Saya menyetujui <span className="text-[#8c6b29] underline font-medium cursor-pointer">Syarat & Ketentuan</span> agen HousePoint.
                            </p>
                        </div>

                        {showActions && seller.status === 'pending' && (
                            <div className="pt-6 border-t border-[#e5d8c0]/60 space-y-5">
                                {!showRejectInput ? (
                                    <div className="flex flex-col gap-3 max-w-md mx-auto">
                                        <button 
                                            onClick={handleApprove} 
                                            className="w-full bg-[#D4AD5D] hover:bg-[#c09b50] text-white font-bold py-3.5 px-6 rounded-xl transition duration-300 shadow-md text-sm tracking-wide"
                                        >
                                            Setujui
                                        </button>
                                        <button 
                                            onClick={() => setShowRejectInput(true)} 
                                            className="w-full bg-white hover:bg-gray-50 text-[#ff4d4d] border border-gray-100 font-bold py-3.5 px-6 rounded-xl transition duration-300 shadow-sm text-sm tracking-wide"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-w-2xl mx-auto p-5 bg-white border border-red-100 rounded-2xl shadow-sm">
                                        <div>
                                            <label className="block text-[11px] font-bold text-red-600 mb-1.5 uppercase tracking-wider">Alasan Penolakan</label>
                                            <textarea 
                                                value={alasan} 
                                                onChange={e => setAlasan(e.target.value)} 
                                                placeholder="Alasan penolakan" 
                                                className="w-full bg-white border border-[#e5d8c0] focus:border-red-400 rounded-xl px-4 py-3 text-sm text-[#2c2c2c] focus:outline-none resize-none" 
                                                rows="3" 
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <button 
                                                onClick={() => { setShowRejectInput(false); setAlasan(''); }} 
                                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition"
                                            >
                                                Batal
                                            </button>
                                            <button 
                                                onClick={handleReject} 
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-sm"
                                            >
                                                Kirim Penolakan
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">Gagal memuat data detail.</div>
                )}
            </div>
        </div>
    );
};

export default SellerDetailModal;
