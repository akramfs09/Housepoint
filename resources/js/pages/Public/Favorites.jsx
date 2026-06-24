import { useState, useEffect } from 'react';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';

const Favorites = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' atau 'list' untuk kontrol tampilan

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get('/favorites');
                // Response: { success, data: { data: [...], meta: ... } }
                const responseData = response.data?.data;        // { data: [...], meta: ... }
                const propertiesArray = responseData?.data || [];  // array properti
                setProperties(propertiesArray);
            } catch {
                toast.error('Gagal memuat favorit.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="bg-[#fdfbf7] rounded-xl p-6 border border-amber-100/40">
            {/* Header Konten & Toggle Tampilan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-gray-600 font-normal">
                    {loading ? (
                        'Mencari data properti...'
                    ) : (
                        <span>
                            <strong className="font-semibold">{properties.length}</strong> properti ditemukan dalam daftar favorit Anda
                        </span>
                    )}
                </p>
                
                {/* Grid / List Layout Toggle Icon */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded border transition-colors ${viewMode === 'grid' ? 'bg-amber-50 text-[#8c6c1d] border-amber-200' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                        title="Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded border transition-colors ${viewMode === 'list' ? 'bg-amber-50 text-[#8c6c1d] border-amber-200' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                        title="List View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* State Kondisional (Loading / Kosong / Grid Konten) */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                    <div className="w-9 h-9 border-4 border-[#8c6c1d] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm animate-pulse">Memuat item favorit Anda...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <span className="text-3xl text-gray-300">❤️</span>
                    <p className="mt-3 text-sm text-gray-500 font-medium">Belum ada properti favorit yang disimpan.</p>
                </div>
            ) : (
                <>
                    {/* Grid Properti */}
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                        : "flex flex-col gap-4"
                    }>
                        {properties.map(p => (
                            <PropertyCard key={p.id} property={p} mode="public" />
                        ))}
                    </div>

                    {/* Pagination Sesuai Desain image_d23fe4.png */}
                    <div className="flex justify-center items-center gap-1.5 mt-12">
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                            &lt;
                        </button>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded bg-[#8c6c1d] text-white font-medium shadow-sm">
                            1
                        </button>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                            2
                        </button>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                            3
                        </button>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                            4
                        </button>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                            5
                        </button>
                        <span className="px-1 text-xs text-gray-400">...</span>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                            10
                        </button>
                        <button className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                            &gt;
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Favorites;