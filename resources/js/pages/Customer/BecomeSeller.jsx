import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import SelfieCapture from '../../components/common/SelfieCapture';
import RejectionHistoryModal from '../../components/common/RejectionHistoryModal';

const BecomeSeller = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [statusInfo, setStatusInfo] = useState(null);
    const [appealStatus, setAppealStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [formData, setFormData] = useState({
        nama_toko: '',          // 🆕 ganti dari nama_lengkap
        no_hp: '',
        alamat: '',
        deskripsi: '',
        syarat_ketentuan: false,
    });
    const [ktpFile, setKtpFile] = useState(null);
    const [selfieFile, setSelfieFile] = useState(null);
    const [fotoTokoFile, setFotoTokoFile] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showRejectionHistory, setShowRejectionHistory] = useState(false);
    const [showAppealModal, setShowAppealModal] = useState(false);
    const [appealReason, setAppealReason] = useState('');

    const fetchStatus = async () => {
        try {
            const [statusRes, appealRes] = await Promise.all([
                api.get('/seller/status'),
                api.get('/seller/appeal-status'),
            ]);
            setStatusInfo(statusRes.data.data);
            setAppealStatus(appealRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => fetchStatus(), 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (statusInfo?.status === 'approved') {
            refreshUser();
        }
    }, [statusInfo?.status, refreshUser]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ktpFile || !selfieFile) {
            setError('Mohon upload KTP dan ambil selfie.');
            return;
        }
        if (!formData.syarat_ketentuan) {
            setError('Anda harus menyetujui Syarat & Ketentuan.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        const form = new FormData();
        form.append('ktp', ktpFile);
        form.append('selfie', selfieFile);
        if (fotoTokoFile) form.append('foto_toko', fotoTokoFile);
        form.append('nama_toko', formData.nama_toko);       // 🆕 kirim nama toko
        form.append('no_hp', formData.no_hp);
        form.append('alamat', formData.alamat);
        form.append('deskripsi', formData.deskripsi);
        form.append('syarat_ketentuan', formData.syarat_ketentuan ? '1' : '0');

        try {
            await api.post('/seller/register', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitAppeal = async () => {
        if (!appealReason.trim()) {
            setError('Alasan banding harus diisi.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await api.post('/seller/appeal', { alasan: appealReason });
            setShowAppealModal(false);
            setAppealReason('');
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim banding.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToDashboard = async () => {
        setIsRefreshing(true);
        await refreshUser();
        setIsRefreshing(false);
        navigate('/seller/dashboard');
    };

    if (loadingStatus) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A065]"></div>
            </div>
        );
    }

    const rejectionHistory = statusInfo?.rejection_history || [];

    // ==================== Status: Pending ====================
    if (statusInfo?.has_applied && statusInfo?.status === 'pending') {
        return (
            <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] p-8 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Pengajuan Sedang Diproses</h2>
                <p className="text-[#8b8478] text-sm max-w-md mx-auto mb-6">
                    Pengajuan Anda sebagai seller sedang dalam antrian verifikasi admin. Mohon tunggu, Anda akan menerima notifikasi setelah pengajuan disetujui atau ditolak.
                </p>
                {rejectionHistory.length > 0 && (
                    <button onClick={() => setShowRejectionHistory(true)} className="text-[#C5A065] text-sm hover:underline">
                        📋 Lihat Riwayat Penolakan ({rejectionHistory.length})
                    </button>
                )}
                <RejectionHistoryModal isOpen={showRejectionHistory} onClose={() => setShowRejectionHistory(false)} history={rejectionHistory} />
            </div>
        );
    }

    // ==================== Status: Approved ====================
    if (statusInfo?.has_applied && statusInfo?.status === 'approved') {
        return (
            <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Selamat! Anda Sudah Menjadi Seller</h2>
                <p className="text-[#8b8478] text-sm max-w-md mx-auto mb-6">
                    Akun Anda telah disetujui sebagai seller. Sekarang Anda bisa mengelola properti dan mulai menjual.
                </p>
                <button
                    onClick={handleGoToDashboard}
                    disabled={isRefreshing}
                    className="bg-[#C5A065] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#b08d55] transition mb-4 disabled:opacity-50"
                >
                    {isRefreshing ? 'Menyiapkan...' : 'Ke Dashboard Seller'}
                </button>
                {rejectionHistory.length > 0 && (
                    <div>
                        <button onClick={() => setShowRejectionHistory(true)} className="text-[#C5A065] text-sm hover:underline">
                            📋 Lihat Riwayat Penolakan ({rejectionHistory.length})
                        </button>
                    </div>
                )}
                <RejectionHistoryModal isOpen={showRejectionHistory} onClose={() => setShowRejectionHistory(false)} history={rejectionHistory} />
            </div>
        );
    }

    // ==================== Status: Rejected / Not Applied / Can Reapply ====================
    const showForm = !statusInfo?.has_applied
        || (statusInfo?.status === 'rejected' && statusInfo.apply_count < statusInfo.max_applies && statusInfo.cooldown_days_left === 0);

    return (
        <div className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            {/* Blok banding / batas maksimal */}
            {statusInfo?.apply_count >= 3 && (
                <div className="space-y-4">
                    {appealStatus?.status === 'pending' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                            🟡 Banding Anda sedang ditinjau oleh admin. Mohon tunggu.
                        </div>
                    )}
                    {appealStatus?.status === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                            🟢 Banding Anda disetujui! Anda mendapat 1 kesempatan tambahan.
                        </div>
                    )}
                    {appealStatus?.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                            🔴 Banding Anda ditolak. Anda tidak dapat mengajukan banding lagi.
                        </div>
                    )}
                    {!appealStatus && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                            <p>Anda telah mencapai batas maksimal pengajuan ({statusInfo.max_applies} kali).</p>
                            <button onClick={() => setShowAppealModal(true)} className="mt-2 bg-[#C5A065] text-white px-4 py-2 rounded-lg text-sm">
                                Ajukan Banding
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Pesan cooldown */}
            {statusInfo?.has_applied && statusInfo?.status === 'rejected' && statusInfo?.apply_count < 3 && !showForm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                    <p>Anda dapat mengajukan ulang dalam <strong>{statusInfo.cooldown_days_left} hari</strong>.</p>
                </div>
            )}

            {/* Form pengajuan */}
            {showForm && (
                <>
                    {rejectionHistory.length > 0 && (
                        <div className="text-center">
                            <button onClick={() => setShowRejectionHistory(true)} className="text-[#C5A065] text-sm hover:underline">
                                📋 Lihat Riwayat Penolakan ({rejectionHistory.length})
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-[#e5d8c0] space-y-5">
                        {/* Nama Toko */}
                        <div>
                            <label className="block text-sm font-medium text-[#2c2c2c] mb-1">
                                🏪 Nama Toko <span className="text-gray-400 font-normal">(opsional)</span>
                            </label>
                            <input type="text" name="nama_toko" value={formData.nama_toko} onChange={handleChange}
                                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm text-[#5a554c] focus:ring-1 focus:ring-[#C5A065] outline-none"
                                placeholder="Nama toko Anda" />
                        </div>

                        {/* Nomor HP */}
                        <div>
                            <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Nomor HP</label>
                            <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange}
                                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm text-[#5a554c] focus:ring-1 focus:ring-[#C5A065] outline-none" required />
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Alamat Lengkap</label>
                            <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2"
                                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm text-[#5a554c] focus:ring-1 focus:ring-[#C5A065] outline-none" required />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-[#2c2c2c] mb-1">
                                Deskripsi Singkat <span className="text-gray-400 font-normal">(opsional)</span>
                            </label>
                            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="3"
                                placeholder="Ceritakan tentang pengalaman atau keahlian Anda..."
                                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm text-[#5a554c] focus:ring-1 focus:ring-[#C5A065] outline-none" />
                        </div>

                        {/* KTP */}
                        <div>
                            <label className="block text-sm font-medium text-[#2c2c2c] mb-2">📄 Upload KTP</label>
                            <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files[0])}
                                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-[13px] text-[#5a554c] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#C5A065] file:text-white hover:file:bg-[#b08d55] transition" required />
                            <p className="text-[11px] text-gray-400 mt-1">Format: JPG, JPEG, PNG (Maks 2 MB)</p>
                        </div>

                        {/* Selfie */}
                        <SelfieCapture onCapture={file => setSelfieFile(file)} />

                        {/* Foto Profil Toko */}
                        <div>
                            <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                                🏪 Upload Foto Toko <span className="text-gray-400 font-normal">(opsional)</span>
                            </label>
                            <input type="file" accept="image/*" onChange={e => setFotoTokoFile(e.target.files[0])}
                                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-[13px] text-[#5a554c] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#C5A065] file:text-white hover:file:bg-[#b08d55] transition" />
                            <p className="text-[11px] text-gray-400 mt-1">Format: JPG, JPEG, PNG (Maks 2 MB)</p>
                        </div>

                        {/* Syarat & Ketentuan */}
                        <div className="border-t border-[#e5d8c0] pt-4">
                            <div className="bg-[#faf7f0] p-4 rounded-lg text-xs text-[#5a554c] mb-4 max-h-32 overflow-y-auto">
                                <h4 className="font-bold text-sm text-[#2c2c2c] mb-2">Syarat & Ketentuan Seller HousePoint</h4>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Seller wajib memberikan informasi yang benar, akurat, dan sesuai dengan dokumen identitas resmi (KTP).</li>
                                    <li>Seller bertanggung jawab penuh atas keabsahan dan legalitas properti yang diunggah.</li>
                                    <li>Seller dilarang mengunggah properti fiktif, menyesatkan, atau melanggar hukum.</li>
                                    <li>HousePoint berhak melakukan moderasi dan verifikasi terhadap setiap listing properti.</li>
                                    <li>Seller wajib menjaga profesionalitas dan etika dalam berkomunikasi dengan calon pembeli.</li>
                                    <li>Pelanggaran terhadap ketentuan ini dapat mengakibatkan penonaktifan akun seller secara sepihak.</li>
                                </ol>
                            </div>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" name="syarat_ketentuan" checked={formData.syarat_ketentuan} onChange={handleChange}
                                    className="mt-1 accent-[#C5A065]" required />
                                <span className="text-sm text-[#2c2c2c]">
                                    Saya telah membaca dan menyetujui <strong>Syarat & Ketentuan</strong> yang berlaku.
                                </span>
                            </label>
                        </div>

                        <button type="submit"
                            disabled={isSubmitting || !ktpFile || !selfieFile || !formData.syarat_ketentuan}
                            className="w-full bg-[#C5A065] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#b08d55] disabled:opacity-50 disabled:cursor-not-allowed transition">
                            {isSubmitting ? 'Mengirim...' : (statusInfo?.status === 'rejected' ? 'Ajukan Ulang' : 'Kirim Pengajuan')}
                        </button>
                    </form>
                </>
            )}

            {/* Tombol Riwayat Penolakan */}
            {rejectionHistory.length > 0 && !showForm && statusInfo?.status !== 'pending' && (
                <div className="text-center">
                    <button onClick={() => setShowRejectionHistory(true)} className="text-[#C5A065] text-sm hover:underline">
                        📋 Lihat Riwayat Penolakan ({rejectionHistory.length})
                    </button>
                </div>
            )}

            {/* Modal Banding */}
            {showAppealModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">Ajukan Banding</h3>
                        <p className="text-sm text-[#8b8478] mb-4">
                            Tulis alasan mengapa Anda layak menjadi seller meskipun telah ditolak 3 kali.
                        </p>
                        <textarea
                            value={appealReason}
                            onChange={e => setAppealReason(e.target.value)}
                            placeholder="Tulis alasan Anda..."
                            className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                            rows="4"
                            required
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowAppealModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg">Batal</button>
                            <button onClick={handleSubmitAppeal} disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-[#C5A065] rounded-lg hover:bg-[#b08d55] disabled:opacity-50">
                                {isSubmitting ? 'Mengirim...' : 'Kirim Banding'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <RejectionHistoryModal isOpen={showRejectionHistory} onClose={() => setShowRejectionHistory(false)} history={rejectionHistory} />
        </div>
    );
};

export default BecomeSeller;