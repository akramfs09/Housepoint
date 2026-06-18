import { useState, useEffect, useCallback } from 'react';
import { fetchPublicProperties, fetchFeaturedProperties } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';

const PROPERTY_TYPES = [
    { value: '', label: 'Semua Tipe' },
    { value: 'rumah', label: 'Rumah' },
    { value: 'apartemen', label: 'Apartemen' },
    { value: 'ruko', label: 'Ruko' },
    { value: 'tanah', label: 'Tanah' },
    { value: 'gedung', label: 'Gedung' },
];

const SORT_OPTIONS = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'price_asc', label: 'Harga: Rendah → Tinggi' },
    { value: 'price_desc', label: 'Harga: Tinggi → Rendah' },
    { value: 'popular', label: 'Paling Populer' },
];

const normalizeResourceList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const PropertyCatalog = () => {
    const [featured, setFeatured] = useState([]);
    const [popular, setPopular] = useState([]);
    const [favorited, setFavorited] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        city: '',
        province: '',
        min_price: '',
        max_price: '',
        bedrooms: '',
        sort_by: 'latest',
        page: 1,
    });

    // Ambil properti unggulan
    useEffect(() => {
        const loadFeatured = async () => {
            try {
                const { data } = await fetchFeaturedProperties();
                setFeatured(normalizeResourceList(data));
            } catch {}
        };
        loadFeatured();
    }, []);

    const loadProperties = useCallback(async (page, currentFilters) => {
        setLoading(true);
        try {
            const params = { ...currentFilters, page, per_page: 12 };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });

            const { data } = await fetchPublicProperties(params);
            
            // Tangkap data section populer & favorit
            setPopular(normalizeResourceList(data.popular));
            setFavorited(normalizeResourceList(data.favorited));
            
            const allData = data.data?.data || data.data || [];
            setProperties(Array.isArray(allData) ? allData : []);
            setPagination({
                currentPage: data.data?.meta?.current_page || 1,
                lastPage: data.data?.meta?.last_page || 1,
                total: data.data?.meta?.total || 0,
            });
        } catch (error) {
            toast.error('Gagal memuat katalog properti.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProperties(filters.page, filters);
    }, [filters, loadProperties]);

    const handleFavoriteChange = useCallback((propertyId, isFavorited) => {
        const update = prev => prev.map(p => p.id === propertyId ? { ...p, is_favorited: isFavorited } : p);
        setFeatured(update);
        setPopular(update);
        setFavorited(update);
        setProperties(update);
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />

            {/* Hero */}
            <div className="bg-gradient-to-r from-[#C5A065] to-[#d49b37] text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Temukan Properti Impian Anda</h1>
                    <p className="text-white/80">Jelajahi berbagai pilihan properti terbaik dari seller terpercaya</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-4">
                {/* ===== SECTION: UNGGULAN ===== */}
                {featured.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">🌟 Unggulan</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {featured.map(p => (
                                <div key={p.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                                    <PropertyCard property={p} mode="public" onFavoriteChange={handleFavoriteChange} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== SECTION: TERPOPULER ===== */}
                {popular.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">🔥 Terpopuler Minggu Ini</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {popular.map(p => (
                                <div key={p.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                                    <PropertyCard property={p} mode="public" onFavoriteChange={handleFavoriteChange} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== SECTION: TERFAVORIT ===== */}
                {favorited.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-4">❤️ Terfavorit Minggu Ini</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {favorited.map(p => (
                                <div key={p.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                                    <PropertyCard property={p} mode="public" onFavoriteChange={handleFavoriteChange} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== SECTION: SEMUA + FILTER ===== */}
                <h2 className="text-2xl font-bold mb-6">Semua Properti</h2>
                
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filter */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] p-5 sticky top-24">
                            <h2 className="text-lg font-bold text-[#2c2c2c] mb-4">🔍 Filter</h2>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari judul properti..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Tipe</label>
                                <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm">
                                    {PROPERTY_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kota</label>
                                <input type="text" placeholder="Bandung" value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Provinsi</label>
                                <input type="text" placeholder="Jawa Barat" value={filters.province}
                                    onChange={(e) => handleFilterChange('province', e.target.value)}
                                    className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Rentang Harga</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" value={filters.min_price}
                                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                        className="w-1/2 border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm" />
                                    <input type="number" placeholder="Max" value={filters.max_price}
                                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                        className="w-1/2 border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Min. Kamar Tidur</label>
                                <input type="number" placeholder="2" value={filters.bedrooms}
                                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                    className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm" />
                            </div>

                            <button onClick={() => setFilters({
                                search: '', type: '', city: '', province: '',
                                min_price: '', max_price: '', bedrooms: '',
                                sort_by: 'latest', page: 1,
                            })}
                                className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">
                                🔄 Reset Filter
                            </button>
                        </div>
                    </div>

                    {/* Konten */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm text-gray-500">
                                {pagination ? `${pagination.total} properti ditemukan` : 'Memuat...'}
                            </p>
                            <select value={filters.sort_by}
                                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                className="border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm">
                                {SORT_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="text-center py-16 text-gray-500">Memuat properti...</div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border">
                                <p className="text-gray-400 text-lg">😔 Tidak ada properti ditemukan</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {properties.map(p => (
                                        <PropertyCard key={p.id} property={p} mode="public" onFavoriteChange={handleFavoriteChange} />
                                    ))}
                                </div>

                                {pagination && pagination.lastPage > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(page => (
                                            <button key={page} onClick={() => handlePageChange(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                                                    page === pagination.currentPage
                                                        ? 'bg-[#C5A065] text-white'
                                                        : 'border hover:bg-gray-50'
                                                }`}>
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PropertyCatalog;
