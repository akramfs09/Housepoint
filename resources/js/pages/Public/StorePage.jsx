import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get(`/store/${sellerId}`);
                setStore(data.store);
                const responseData = data.properties?.data || data.properties || [];
                setProperties(responseData);
                setPagination({
                    currentPage: data.properties?.meta?.current_page || 1,
                    lastPage: data.properties?.meta?.last_page || 1,
                    total: data.properties?.meta?.total || 0,
                });
            } catch {
                toast.error('Toko tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [sellerId]);

    if (loading) return (
        <div className="min-h-screen bg-[#efe6d5]">
            <Navbar />
            <div className="flex items-center justify-center py-20">
                <p>Memuat...</p>
            </div>
            <Footer />
        </div>
    );

    if (!store) return (
        <div className="min-h-screen bg-[#efe6d5]">
            <Navbar />
            <div className="flex items-center justify-center py-20">
                <p>Toko tidak ditemukan.</p>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />

            {/* Header Toko */}
            <div className="bg-gradient-to-r from-[#C5A065] to-[#d49b37] text-white py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/50">
                        {store.foto_toko ? (
                            <img src={store.foto_toko} alt={store.nama_toko} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">🏪</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{store.nama_toko || 'Tanpa Nama Toko'}</h1>
                        <p className="text-white/80 mt-1">{store.deskripsi || 'Tidak ada deskripsi.'}</p>
                        <p className="text-white/80 text-sm mt-2">👤 {store.nama_penjual} &bull; ✉️ {store.email}</p>
                    </div>
                </div>
            </div>

            {/* Daftar Properti */}
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h2 className="text-2xl font-bold mb-6">Properti yang Dijual</h2>
                {loading ? (
                    <p className="text-center py-10">Memuat properti...</p>
                ) : properties.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">Belum ada properti.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {properties.map(p => (
                                <PropertyCard key={p.id} property={p} mode="public" />
                            ))}
                        </div>

                        {pagination && pagination.lastPage > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            api.get(`/store/${sellerId}?page=${page}`)
                                                .then(({ data }) => {
                                                    setProperties(data.properties?.data || []);
                                                    setPagination(prev => ({
                                                        ...prev,
                                                        currentPage: data.properties?.meta?.current_page || page,
                                                    }));
                                                })
                                                .catch(() => toast.error('Gagal memuat halaman.'));
                                        }}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium ${
                                            page === pagination.currentPage
                                                ? 'bg-[#C5A065] text-white'
                                                : 'border hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
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