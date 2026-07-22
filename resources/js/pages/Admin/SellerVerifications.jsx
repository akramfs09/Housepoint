import { useState, useEffect } from 'react';
import api from '../../services/api';
import SellerDetailModal from '../../components/common/SellerDetailModal';

const SellerVerifications = () => {
    const [sellers, setSellers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Status filter key mappings:
    // 'all' -> Semua, 'pending' -> Pending, 'approved' -> Disetujui, 'rejected' -> Ditolak
    const [filterStatus, setFilterStatus] = useState('all');

    const statuses = [
        { key: 'all', label: 'Semua' },
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Disetujui' },
        { key: 'rejected', label: 'Ditolak' }
    ];

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20 };
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }
            const res = await api.get('/admin/seller-verifications', { params });
            setSellers(res.data.data);
            setMeta(res.data.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, [page, filterStatus]);

    const handleOpenOverview = (sellerId) => {
        setSelectedSellerId(sellerId);
        setShowModal(true);
    };

    // Fungsi utilitas format tanggal (contoh: "24 Okt 2023")
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="space-y-8 bg-[#fdfaf5] min-h-screen p-6 rounded-3xl">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2c2c2c] tracking-tight">
                        
                    </h1>
                    <p className="text-sm text-[#8b8478] mt-1">
                        
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-[#fdfaf5] border border-[#e5d8c0] rounded-xl overflow-hidden p-1 shadow-sm">
                    {statuses.map((status) => (
                        <button
                            key={status.key}
                            onClick={() => {
                                setPage(1);
                                setFilterStatus(status.key);
                            }}
                            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                filterStatus === status.key
                                    ? 'bg-[#D4AD5D] text-white shadow-md'
                                    : 'text-[#8b8478] hover:bg-[#faf7f0] hover:text-[#2c2c2c]'
                            }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Content */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-400 font-medium">
                    Memuat data...
                </div>
            ) : sellers.length === 0 ? (
                <div className="flex justify-center items-center py-20 text-gray-400 font-medium">
                    Tidak ada pengajuan baru.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sellers.map((seller) => (
                        <div key={seller.id} className="bg-white rounded-2xl shadow-sm border border-[#f0ebe1] flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
                            
                            {/* Kiri: Gambar/Dokumen */}
                            <div className="sm:w-[35%] w-full h-48 sm:h-auto shrink-0 bg-gray-100 relative overflow-hidden border-b sm:border-b-0 sm:border-r border-[#f0ebe1]">
                                {/* Ganti placeholder src dengan URL foto dokumen dari seller jika ada */}
                                <img 
                                    src={seller.dokumen_url || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=400&auto=format&fit=crop"} 
                                    alt="Dokumen" 
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            {/* Kanan: Info Detail */}
                            <div className="p-5 sm:w-[65%] w-full flex flex-col justify-between min-w-0">
                                
                                {/* Info User & Status */}
                                <div className="flex justify-between items-start gap-3 w-full">
                                    {/* Wrapper Nama & Avatar dgn min-w-0 agar bisa di-truncate */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#faf7f0] border border-[#f0ebe1] flex items-center justify-center shrink-0">
                                            {seller.user?.avatar_url ? (
                                                <img 
                                                    src={seller.user.avatar_url} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[#D4AD5D] font-bold text-lg">
                                                    {(seller.nama_lengkap || seller.user?.name || 'U').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-extrabold text-[16px] text-[#2c2c2c] leading-tight truncate">
                                                {seller.nama_lengkap || seller.user?.name}
                                            </h3>
                                            <p className="text-[12px] text-[#8b8478] truncate mt-0.5">
                                                {seller.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badge Status - shrink-0 agar ukurannya tetap */}
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider shrink-0 ${
                                        seller.status === 'approved'
                                            ? 'bg-green-100 text-green-700'
                                            : seller.status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-[#fdf4db] text-[#d99f2a]'
                                    }`}>
                                        {seller.status === 'approved'
                                            ? 'APPROVED'
                                            : seller.status === 'rejected'
                                                ? 'REJECTED'
                                                : 'PENDING'}
                                    </span>
                                </div>

                                {/* Kotak Meta Info (Tanggal & Agen) */}
                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    <div className="bg-[#faf7f0] p-3 rounded-xl border border-[#f0ebe1]">
                                        <p className="text-[9px] text-[#a1998a] font-bold tracking-widest mb-1">DIAJUKAN PADA</p>
                                        <p className="text-[13px] font-semibold text-[#2c2c2c] truncate">
                                            {formatDate(seller.created_at)}
                                        </p>
                                    </div>
                                    <div className="bg-[#faf7f0] p-3 rounded-xl border border-[#f0ebe1]">
                                        <p className="text-[9px] text-[#a1998a] font-bold tracking-widest mb-1">AGEN</p>
                                        <p className="text-[13px] font-semibold text-[#2c2c2c] truncate">
                                            {seller.nama_agen || 'Independent'}
                                        </p>
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <button
                                    onClick={() => handleOpenOverview(seller.id)}
                                    className="w-full mt-5 py-2.5 rounded-xl border border-[#e5d8c0] text-[#2c2c2c] text-[13px] font-bold hover:bg-[#faf7f0] hover:border-[#D4AD5D] transition-all duration-300"
                                >
                                    Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Footer */}
            {meta && (
                <div className="bg-white border border-[#e5d8c0] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 shadow-sm">
                    <span className="text-sm text-[#8b8478]">
                        Menampilkan <strong className="text-[#2c2c2c]">{sellers.length}</strong> dari <strong className="text-[#2c2c2c]">{meta.total || sellers.length}</strong> pengajuan baru
                    </span>
                    
                    <div className="flex gap-1.5 items-center">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            &lt;
                        </button>
                        
                        {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                    p === page 
                                        ? 'bg-[#8c6b29] text-white border-transparent shadow-sm' 
                                        : 'bg-white border border-[#e5d8c0] text-[#8b8478] hover:bg-[#faf7f0]'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        
                        <button 
                            disabled={page === (meta.last_page || 1)}
                            onClick={() => setPage(p => p + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            <SellerDetailModal
                sellerId={selectedSellerId}
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedSellerId(null); }}
                onRefresh={fetchSellers}
            />
        </div>
    );
};

export default SellerVerifications;