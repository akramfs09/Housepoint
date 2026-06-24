import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';

const StorePage = () => {
    const { sellerId } = useParams();
    const [store, setStore] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadStoreData = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/store/${sellerId}?page=${currentPage}`);
                setStore(data.store);
                
                const responseData = data.properties?.data || data.properties || [];
                setProperties(responseData);
                
                setPagination({
                    currentPage: data.properties?.meta?.current_page || currentPage,
                    lastPage: data.properties?.meta?.last_page || 1,
                    total: data.properties?.meta?.total || responseData.length,
                });
            } catch (error) {
                toast.error('Gagal memuat profil toko.');
            } finally {
                setLoading(false);
            }
        };
        loadStoreData();
    }, [sellerId, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-[#FAF6EE] text-[#2c2c2c] font-sans antialiased text-left">
            <Navbar />

            {/* ================= HEADER TOKO PREMIUM ================= */}
            <div className="bg-gradient-to-r from-[#D3A25D] to-[#bfa057] text-white py-14 px-4 shadow-sm">
                <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/30 backdrop-blur-sm shrink-0 shadow-md">
                        {store?.foto_toko ? (
                            <img src={store.foto_toko} alt={store.nama_toko} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">🏪</span>
                        )}
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{store?.nama_toko || 'Agen Properti Pilihan'}</h1>
                        <p className="text-white/90 text-sm max-w-2xl leading-relaxed font-medium">{store?.deskripsi || 'Menyediakan hunian eksklusif dan properti komersial terbaik.'}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-xs text-amber-100 font-semibold pt-1">
                            <span className="flex items-center gap-1.5">👤 {store?.nama_penjual || 'Verified Agen'}</span>
                            <span className="hidden sm:inline text-white/40">&bull;</span>
                            <span className="flex items-center gap-1.5">✉️ {store?.email || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= DAFTAR GRID PROPERTI BANYAK ================= */}
            <div className="max-w-[1240px] mx-auto py-12 px-4">
                <div className="mb-8 px-1">
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Koleksi Properti Agen</h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Menampilkan {properties.length} properti unggulan dari etalase agen ini
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-32 text-xs font-medium text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        Memuat daftar hunian terbaik...
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-sm font-medium">😔 Belum ada daftar properti di toko ini.</p>
                    </div>
                ) : (
                    <>
                        {/* Grid Tiga Kolom Sejajar Banyak Baris Ke Bawah (Perfect Pixel Match) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8">
                            {properties.map(p => (
                                <PropertyCard 
                                    key={p.id} 
                                    property={p} 
                                    mode="public" 
                                />
                            ))}
                        </div>

                        {/* ================= PAGINATION BOX STYLE ================= */}
                        {pagination && pagination.lastPage > 1 && (
                            <div className="flex justify-center items-center gap-1.5 mt-14">
                                <button 
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                                >
                                    ‹
                                </button>

                                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                                    <button 
                                        key={page} 
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            page === pagination.currentPage
                                                ? 'bg-[#8c6b39] text-white shadow-sm'
                                                : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => handlePageChange(Math.min(pagination.lastPage, currentPage + 1))}
                                    disabled={currentPage === pagination.lastPage}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default StorePage;