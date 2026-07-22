import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api, { confirmKtpAccess } from '../../services/api';
import SellerDetailModal from '../../components/common/SellerDetailModal';

const KtpReviews = () => {
    const [sellers, setSellers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [submittingAccess, setSubmittingAccess] = useState(false);
    const [pendingSellerId, setPendingSellerId] = useState(null);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/seller-ktp-reviews', {
                params: { page, per_page: 20, search },
            });
            setSellers(res.data.data || []);
            setMeta(res.data.meta || null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memuat data seller.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, [page, search]);

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleOpenKtp = (sellerId) => {
        setPendingSellerId(sellerId);
        setCurrentPassword('');
        setShowAccessModal(true);
    };

    const handleVerifyAndOpen = async (event) => {
        event.preventDefault();
        if (!currentPassword.trim()) {
            toast.error('Password saat ini wajib diisi.');
            return;
        }

        setSubmittingAccess(true);
        try {
            await confirmKtpAccess({ current_password: currentPassword });
            setSelectedSellerId(pendingSellerId);
            setShowDetailModal(true);
            setShowAccessModal(false);
            toast.success('Akses KTP berhasil dibuka sementara.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verifikasi gagal.');
        } finally {
            setSubmittingAccess(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen space-y-8 rounded-3xl bg-[#fdfaf5] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#2c2c2c]">
                        
                    </h1>
                    <p className="mt-1 text-sm text-[#8b8478]">
                        
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center gap-2 rounded-2xl border border-[#eadcc4] bg-white p-2 shadow-sm">
                    <Search className="ml-2 h-4 w-4 text-[#8b8478]" />
                    <input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Cari nama, email, agen, alamat, atau nomor HP"
                        className="h-10 flex-1 bg-transparent px-1 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-[#c49a4a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#ad812f]"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 font-medium text-gray-400">
                    Memuat data...
                </div>
            ) : sellers.length === 0 ? (
                <div className="flex items-center justify-center py-20 font-medium text-gray-400">
                    Tidak ada seller yang ditemukan.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {sellers.map((seller) => (
                        <div key={seller.id} className="flex overflow-hidden rounded-2xl border border-[#f0ebe1] bg-white shadow-sm transition-shadow hover:shadow-md">
                            <div className="relative h-48 w-full shrink-0 overflow-hidden border-b border-[#f0ebe1] bg-gray-100 sm:h-auto sm:w-[35%] sm:border-b-0 sm:border-r">
                                <img
                                    src={seller.foto_agen || seller.foto_profil || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=400&auto=format&fit=crop'}
                                    alt="Seller"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex w-full min-w-0 flex-col justify-between p-5 sm:w-[65%]">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-[16px] font-extrabold leading-tight text-[#2c2c2c]">
                                            {seller.nama_lengkap || seller.user?.name}
                                        </h3>
                                        <p className="mt-0.5 truncate text-[12px] text-[#8b8478]">
                                            {seller.user?.email}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[#fdf4db] px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#d99f2a]">
                                        {seller.status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-[#f0ebe1] bg-[#faf7f0] p-3">
                                        <p className="mb-1 text-[9px] font-bold tracking-widest text-[#a1998a]">DIAJUKAN PADA</p>
                                        <p className="truncate text-[13px] font-semibold text-[#2c2c2c]">{formatDate(seller.created_at)}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#f0ebe1] bg-[#faf7f0] p-3">
                                        <p className="mb-1 text-[9px] font-bold tracking-widest text-[#a1998a]">ALAMAT</p>
                                        <p className="truncate text-[13px] font-semibold text-[#2c2c2c]">{seller.alamat || '-'}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleOpenKtp(seller.id)}
                                    className="mt-5 w-full rounded-xl border border-[#e5d8c0] py-2.5 text-[13px] font-bold text-[#2c2c2c] transition-all duration-300 hover:border-[#D4AD5D] hover:bg-[#faf7f0]"
                                >
                                    Buka KTP
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e5d8c0] bg-white p-4 shadow-sm sm:flex-row">
                    <span className="text-sm text-[#8b8478]">
                        Menampilkan <strong className="text-[#2c2c2c]">{sellers.length}</strong> dari <strong className="text-[#2c2c2c]">{meta.total || sellers.length}</strong> seller
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            &lt;
                        </button>
                        {Array.from({ length: meta.last_page || 1 }, (_, index) => index + 1).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setPage(value)}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                    value === page
                                        ? 'border-transparent bg-[#8c6b29] text-white shadow-sm'
                                        : 'border border-[#e5d8c0] bg-white text-[#8b8478] hover:bg-[#faf7f0]'
                                }`}
                            >
                                {value}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={page === (meta.last_page || 1)}
                            onClick={() => setPage((current) => current + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}

            {showAccessModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-[#eadcc4] bg-white p-6 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-[#2c241b]">Verifikasi Akses KTP</h2>
                            <p className="mt-1 text-sm text-[#8b8478]">
                                Masukkan password aktif superadmin untuk membuka preview KTP sementara.
                            </p>
                        </div>

                        <form onSubmit={handleVerifyAndOpen} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[#746b5e]">Password Saat Ini</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                                    placeholder="Masukkan password"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAccessModal(false);
                                        setPendingSellerId(null);
                                        setCurrentPassword('');
                                    }}
                                    className="rounded-lg border border-[#eadcc4] px-4 py-2 text-sm font-bold text-[#746b5e]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingAccess}
                                    className="rounded-lg bg-[#c49a4a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#ad812f] disabled:opacity-60"
                                >
                                    {submittingAccess ? 'Memverifikasi...' : 'Verifikasi & Buka'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SellerDetailModal
                sellerId={selectedSellerId}
                isOpen={showDetailModal}
                reviewMode={true}
                showActions={false}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedSellerId(null);
                    setPendingSellerId(null);
                }}
                onRefresh={fetchSellers}
            />
        </div>
    );
};

export default KtpReviews;
