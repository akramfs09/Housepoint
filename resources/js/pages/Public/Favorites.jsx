import { useState, useEffect } from 'react';
import api from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';

const Favorites = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const response = await api.get('/favorites', { params: { page: currentPage } });
                const responseData = response.data?.data;
                const propertiesArray = responseData?.data || [];

                setProperties(propertiesArray);
                setPagination({
                    currentPage: responseData?.meta?.current_page || currentPage,
                    lastPage: responseData?.meta?.last_page || 1,
                    total: responseData?.meta?.total || propertiesArray.length,
                });
            } catch {
                toast.error('Gagal memuat favorit.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [currentPage]);

    return (
        <div className="bg-[#fdfbf7] rounded-xl p-6 border border-amber-100/40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-gray-600 font-normal">
                    {loading ? (
                        'Mencari data properti...'
                    ) : (
                        <span>
                            <strong className="font-semibold">{pagination?.total || properties.length}</strong> properti ditemukan dalam daftar favorit Anda
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded border transition-colors ${viewMode === 'grid' ? 'bg-amber-50 text-[#8c6c1d] border-amber-200' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                        title="Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2v2a2 2 0 01-2-2h-2a2 2 0 01-2-2v-2z" />
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

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                    <div className="w-9 h-9 border-4 border-[#8c6c1d] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm animate-pulse">Memuat item favorit Anda...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <span className="text-3xl text-gray-300"></span>
                    <p className="mt-3 text-sm text-gray-500 font-medium">Belum ada properti favorit yang disimpan.</p>
                </div>
            ) : (
                <>
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'flex flex-col gap-4'
                    }>
                        {properties.map((p) => (
                            <PropertyCard key={p.id} property={p} mode="public" />
                        ))}
                    </div>

                    {pagination && pagination.lastPage > 1 && (
                        <div className="flex justify-center items-center gap-1.5 mt-12">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={pagination.currentPage === 1}
                                className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                &lt;
                            </button>

                            {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 text-xs flex items-center justify-center rounded font-medium shadow-sm transition-colors ${
                                        page === pagination.currentPage
                                            ? 'bg-[#8c6c1d] text-white'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))}
                                disabled={pagination.currentPage === pagination.lastPage}
                                className="w-8 h-8 text-xs flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Favorites;
