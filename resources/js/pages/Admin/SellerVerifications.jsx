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

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20 };
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
    }, [page]);

    const handleOpenOverview = (sellerId) => {
        setSelectedSellerId(sellerId);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2c2c2c]">Verifikasi Seller</h2>
            <p className="text-sm text-[#8b8478]">Approve atau tolak pengajuan seller baru</p>

            <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#faf7f0] text-[#8b8478]">
                        <tr>
                            <th className="p-4 text-left">Nama</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : sellers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Tidak ada pengajuan baru.</td></tr>
                        ) : (
                            sellers.map(seller => (
                                <tr key={seller.id} className="border-t border-[#e5d8c0]">
                                    <td className="p-4 font-medium text-[#2c2c2c]">{seller.nama_lengkap || seller.user?.name}</td>
                                    <td className="p-4 text-[#5a554c]">{seller.user?.email}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenOverview(seller.id)}
                                            className="bg-[#C5A065] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#b08d55] transition"
                                        >
                                            Overview
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginasi */}
            {meta && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded-lg text-sm ${p === page ? 'bg-[#C5A065] text-white' : 'bg-white border text-[#5a554c]'}`}
                        >
                            {p}
                        </button>
                    ))}
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