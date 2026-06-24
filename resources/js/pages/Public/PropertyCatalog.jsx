import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; // Menggunakan instance api sesuai struktur folder Anda
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';

const PROPERTY_TYPES = [
    { value: 'rumah', label: 'Rumah' },
    { value: 'apartemen', label: 'Apartemen' },
    { value: 'villa', label: 'Villa' },
    { value: 'tanah', label: 'Tanah' },
];

const SORT_OPTIONS = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'price_asc', label: 'Harga: Rendah → Tinggi' },
    { value: 'price_desc', label: 'Harga: Tinggi → Rendah' },
    { value: 'popular', label: 'Paling Populer' },
];

// Helper untuk menampilkan ringkasan harga di bawah slider (ex: Rp 100Jt, Rp 20M)
const formatRupiahSingkat = (angka) => {
    if (angka >= 1000000000) return `Rp ${(angka / 1000000000).toFixed(0)}M`;
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(0)}Jt`;
    return `Rp ${angka}`;
};

const PropertyCatalog = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);

    // State filter terintegrasi dengan range harga standar mockup (100Jt - 20M)
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        city: '',
        min_price: 100000000,   // Rp 100 Juta
        max_price: 20000000000, // Rp 20 Miliar
        sort_by: 'latest',
        page: 1,
    });

    // Fungsi fetch data dari API backend
    const loadProperties = useCallback(async (pageNumber, currentFilters) => {
        setLoading(true);
        try {
            // Setel limit 12 agar pas membentuk susunan 3 kolom x 4 baris ke bawah
            const params = { 
                ...currentFilters, 
                page: pageNumber, 
                per_page: 12 
            };
            
            // Bersihkan parameter jika nilainya kosong sebelum dikirim
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });

            const { data } = await api.get('/properties', { params });
            const allData = data.data?.data || data.data || [];
            
            setProperties(Array.isArray(allData) ? allData : []);
            setPagination({
                currentPage: data.data?.meta?.current_page || pageNumber,
                lastPage: data.data?.meta?.last_page || 1,
                total: data.data?.meta?.total || allData.length,
            });
        } catch (error) {
            toast.error('Gagal memuat katalog properti.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Pemicu otomatis saat halaman atau pengurutan (sort) diganti oleh user
    useEffect(() => {
        loadProperties(filters.page, filters);
    }, [filters.page, filters.sort_by, loadProperties]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 200, behavior: 'smooth' }); // Efek scroll up halus setelah ganti halaman
    };

    const applyActiveFilters = () => {
        loadProperties(1, filters);
    };

    return (
        <div className="min-h-screen bg-[#FAF6EE] text-[#2c2c2c] font-sans antialiased text-left selection:bg-amber-200">
            <Navbar />

            <div className="max-w-[1240px] mx-auto py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* ================= 1. SIDEBAR FILTER PERFECT PIXEL ================= */}
                    <div className="w-full lg:w-[260px] flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sticky top-28 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base font-bold text-gray-800 tracking-wide">Filter</h2>
                                <button 
                                    onClick={() => setFilters({
                                        search: '', type: '', city: '',
                                        min_price: 100000000, max_price: 20000000000,
                                        sort_by: 'latest', page: 1
                                    })}
                                    className="text-[11px] font-bold text-amber-700 hover:underline"
                                >
                                    Reset Semua
                                </button>
                            </div>

                            {/* Dropdown Lokasi */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Lokasi</label>
                                <div className="relative">
                                    <select 
                                        value={filters.city} 
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        className="w-full bg-[#FAF6EE]/60 border border-transparent rounded-xl px-3 py-3 text-xs text-gray-600 outline-none appearance-none cursor-pointer focus:bg-white focus:border-[#D3A25D] transition-all"
                                    >
                                        <option value="">📍 Lokasi Properti</option>
                                        <option value="Sleman">Sleman, DIY</option>
                                        <option value="Bantul">Bantul, DIY</option>
                                        <option value="Yogyakarta">Yogyakarta Kota</option>
                                        <option value="Jakarta">Jakarta Pusat</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-[10px]">▼</div>
                                </div>
                            </div>

                            {/* Checkbox Tipe Properti */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Tipe Properti</label>
                                <div className="space-y-3">
                                    {PROPERTY_TYPES.map(t => (
                                        <label key={t.value} className="flex items-center gap-3 text-xs font-medium text-gray-600 cursor-pointer select-none group">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.type === t.value}
                                                onChange={() => handleFilterChange('type', filters.type === t.value ? '' : t.value)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#D3A25D] focus:ring-transparent checked:bg-[#D3A25D] cursor-pointer"
                                            />
                                            <span className="group-hover:text-gray-900 transition-colors">{t.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Dual Range Slider Rentang Harga (Fix Anti Macet) */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">Rentang Harga</label>
                                
                                <div className="relative w-full h-7 flex items-center">
                                    <div className="absolute w-full h-1 bg-amber-100 rounded-full"></div>
                                    
                                    {/* Indikator Bar Cokelat Aktif */}
                                    <div 
                                        className="absolute h-1 bg-[#D3A25D] rounded-full"
                                        style={{
                                            left: `${(filters.min_price / 30000000000) * 100}%`,
                                            right: `${100 - (filters.max_price / 30000000000) * 100}%`
                                        }}
                                    ></div>

                                    <input 
                                        type="range"
                                        min="0"
                                        max="30000000000"
                                        step="100000000"
                                        value={filters.min_price}
                                        onChange={(e) => {
                                            const val = Math.min(Number(e.target.value), filters.max_price - 500000000);
                                            handleFilterChange('min_price', val);
                                        }}
                                        className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 outline-none
                                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D3A25D] [&::-webkit-slider-thumb]:border-2 
                                                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer"
                                    />

                                    <input 
                                        type="range"
                                        min="0"
                                        max="30000000000"
                                        step="100000000"
                                        value={filters.max_price}
                                        onChange={(e) => {
                                            const val = Math.max(Number(e.target.value), filters.min_price + 500000000);
                                            handleFilterChange('max_price', val);
                                        }}
                                        className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 outline-none
                                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D3A25D] [&::-webkit-slider-thumb]:border-2 
                                                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer"
                                    />
                                </div>

                                <div className="flex gap-2 items-center mt-2">
                                    <div className="w-1/2 bg-[#FAF6EE]/80 border border-gray-100 rounded-xl py-2 text-center text-[10px] font-bold text-gray-700 shadow-inner">
                                        {formatRupiahSingkat(filters.min_price)}
                                    </div>
                                    <span className="text-gray-400 text-xs font-semibold">ke</span>
                                    <div className="w-1/2 bg-[#FAF6EE]/80 border border-gray-100 rounded-xl py-2 text-center text-[10px] font-bold text-gray-700 shadow-inner">
                                        {formatRupiahSingkat(filters.max_price)}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={applyActiveFilters}
                                className="w-full bg-[#D3A25D] hover:bg-[#bfa057] active:scale-[0.99] text-white py-3.5 rounded-xl text-xs font-bold transition shadow-sm tracking-wider"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </div>

                    {/* ================= 2. GRID LIST KONTEN PRODUK BANYAK ================= */}
                    <div className="flex-1 w-full">
                        
                        {/* Atasan Grid Info */}
                        <div className="flex justify-between items-end gap-4 mb-8 px-1">
                            <div>
                                <h1 className="text-xl font-black text-gray-800 tracking-tight">Properti Pilihan</h1>
                                <p className="text-xs text-gray-400 font-medium mt-1">
                                    Menampilkan {properties.length} dari {pagination?.total || 456} pilihan properti premium
                                </p>
                            </div>
                            
                            {/* Sort Dropdown */}
                            <div className="relative min-w-[130px]">
                                <select 
                                    value={filters.sort_by}
                                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                    className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 outline-none appearance-none cursor-pointer shadow-sm focus:border-[#D3A25D]"
                                >
                                    {SORT_OPTIONS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-[9px]">▼</div>
                            </div>
                        </div>

                        {/* Rendering Kondisional List */}
                        {loading ? (
                            <div className="text-center py-32 text-xs font-medium text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                Memuat katalog properti...
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-gray-400 text-sm font-medium">😔 Tidak ada properti yang cocok dengan filter Anda</p>
                            </div>
                        ) : (
                            <>
                                {/* GRID UTAMA: 3 Kolom Sempurna Sejajar Ke Bawah Sesuai Gambar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
                                    {properties.map(p => (
                                        <PropertyCard 
                                            key={p.id} 
                                            property={p} 
                                            mode="public" 
                                        />
                                    ))}
                                </div>

                                {/* ================= 3. LOGIKA NAVIGATION BOX (1 2 3 4...) ================= */}
                                {pagination && pagination.lastPage > 1 && (
                                    <div className="flex justify-center items-center gap-1.5 mt-14">
                                        <button 
                                            onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                                            disabled={filters.page === 1}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-400 bg-white border border-transparent hover:border-gray-200 shadow-sm disabled:opacity-30"
                                        >
                                            ‹
                                        </button>

                                        {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                                            <button 
                                                key={page} 
                                                onClick={() => handlePageChange(page)}
                                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                                    page === pagination.currentPage
                                                        ? 'bg-[#93702d] text-white' // Cokelat emas aktif persis mockup
                                                        : 'text-gray-500 bg-white border border-transparent hover:border-gray-200'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button 
                                            onClick={() => handlePageChange(Math.min(pagination.lastPage, filters.page + 1))}
                                            disabled={filters.page === pagination.lastPage}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-400 bg-white border border-transparent hover:border-gray-200 shadow-sm disabled:opacity-30"
                                        >
                                            ›
                                        </button>
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