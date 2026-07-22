import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, MapPin, Search, Trash2, WalletCards } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteSearchHistory, fetchSearchHistory } from '../../services/api';

const TYPE_LABEL = {
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    villa: 'Villa',
    tanah: 'Tanah',
    ruko: 'Ruko',
    gedung: 'Gedung',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154526-990dced4db42?q=80&w=1200&auto=format&fit=crop';

const formatPriceRange = (filters = {}) => {
    const min = Number(filters.min_price || 0);
    const max = Number(filters.max_price || 0);

    const format = (value) => {
        if (!value) return null;
        if (value >= 1000000000) return `${Math.round(value / 1000000000)}M`;
        if (value >= 1000000) return `${Math.round(value / 1000000)}Jt`;
        return value.toLocaleString('id-ID');
    };

    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `Mulai ${format(min)}`;
    if (max) return `Sampai ${format(max)}`;

    return 'Semua harga';
};

const formatRelativeTime = (value) => {
    if (!value) return 'Baru saja';

    const date = new Date(value);
    const diffInSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const buildTitle = (history) => {
    const filters = history.filters || {};
    const type = TYPE_LABEL[filters.type] || filters.type || 'Properti';
    const city = filters.city || history.preview_property?.city;

    if (history.search_text) return history.search_text;
    if (city) return `${type} di ${city}`;

    return 'Pencarian Properti';
};

const SearchHistory = () => {
    const navigate = useNavigate();
    const [histories, setHistories] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const hasHistory = useMemo(() => histories.length > 0, [histories]);

    useEffect(() => {
        const loadHistories = async () => {
            setLoading(true);
            try {
                const response = await fetchSearchHistory({ page, per_page: 3 });
                const responseData = response.data?.data;

                setHistories(responseData?.data || []);
                setPagination({
                    currentPage: responseData?.meta?.current_page || page,
                    lastPage: responseData?.meta?.last_page || 1,
                    total: responseData?.meta?.total || 0,
                });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal memuat riwayat pencarian.');
            } finally {
                setLoading(false);
            }
        };

        loadHistories();
    }, [page]);

    const handleSearchAgain = (history) => {
        const params = new URLSearchParams();
        const filters = history.filters || {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                params.set(key, value);
            }
        });

        if (history.search_text) {
            params.set('search', history.search_text);
        }

        navigate(`/properties?${params.toString()}`);
    };

    const handleDelete = async (id) => {
        try {
            await deleteSearchHistory(id);
            setHistories((current) => current.filter((history) => history.id !== id));
            toast.success('Riwayat pencarian dihapus.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus riwayat.');
        }
    };

    const renderPagination = () => {
        if (!pagination || pagination.lastPage <= 1) return null;

        const pages = Array.from({ length: pagination.lastPage }, (_, index) => index + 1);

        return (
            <div className="mt-8 flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] transition hover:border-[#c49a4a] disabled:opacity-35"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {pages.map((pageNumber) => (
                    <button
                        type="button"
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`h-8 w-8 rounded-md text-[10px] font-semibold transition ${
                            pageNumber === pagination.currentPage
                                ? 'bg-[#80601f] text-white'
                                : 'border border-[#eadcc4] bg-white text-[#8b8478] hover:border-[#c49a4a]'
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
                    disabled={page === pagination.lastPage}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] transition hover:border-[#c49a4a] disabled:opacity-35"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="rounded-lg border border-[#f0e4cf] bg-white py-24 text-center text-sm font-medium text-[#8b8478] shadow-sm">
                Memuat riwayat pencarian...
            </div>
        );
    }

    if (!hasHistory) {
        return (
            <div className="flex min-h-[470px] items-center justify-center rounded-lg border border-[#f0e4cf] bg-white px-6 py-16 shadow-sm">
                <div className="max-w-[570px] text-center">
                    <h2 className="text-[28px] font-black leading-tight text-[#111111] sm:text-[34px]">
                        Belum Ada Riwayat Pencarian
                    </h2>
                    <p className="mx-auto mt-7 max-w-[470px] text-[14px] font-medium leading-6 text-[#4e4a43]">
                        Anda belum mencari properti impian Anda, silahkan kembali ke Homepage untuk mencari dan melihat properti impian Anda.
                    </p>

                    <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="h-9 min-w-[170px] rounded-md border border-[#d9b777] bg-white px-6 text-[12px] font-semibold text-[#d1a04c] shadow-sm transition hover:bg-[#fff8ec]"
                        >
                            Kembali Ke Homepage
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/properties')}
                            className="h-9 min-w-[170px] rounded-md bg-[#8a6400] px-6 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#775700]"
                        >
                            Jelajahi Properti
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#f0e4cf] bg-white px-6 py-6 shadow-sm">
            <div className="space-y-5">
                {histories.map((history) => {
                    const filters = history.filters || {};
                    const property = history.preview_property;
                    const imageUrl = property?.image_main || property?.images?.[0]?.url || FALLBACK_IMAGE;
                    const city = filters.city || property?.city || 'Semua lokasi';
                    const type = TYPE_LABEL[filters.type] || filters.type || 'Semua tipe';

                    return (
                        <article
                            key={history.id}
                            className="flex flex-col gap-4 rounded-lg border border-[#f3eadb] bg-white p-4 shadow-[0_8px_24px_rgba(53,36,8,0.08)] sm:flex-row sm:items-center"
                        >
                            <img
                                src={imageUrl}
                                alt={buildTitle(history)}
                                className="h-[86px] w-full rounded-md object-cover sm:w-[128px]"
                                loading="lazy"
                            />

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <h3 className="truncate text-[18px] font-semibold text-[#27231d]">
                                        {buildTitle(history)}
                                    </h3>
                                    <span className="shrink-0 text-[11px] font-medium text-[#8b8478]">
                                        {formatRelativeTime(history.last_searched_at)}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-[11px] font-medium text-[#6b6256]">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-[#8b8478]" />
                                        {city}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <WalletCards className="h-3.5 w-3.5 text-[#8b8478]" />
                                        {formatPriceRange(filters)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Home className="h-3.5 w-3.5 text-[#8b8478]" />
                                        Tipe: {type}
                                    </span>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center justify-end gap-3 sm:w-[120px] sm:flex-col sm:items-end">
                                <button
                                    type="button"
                                    onClick={() => handleSearchAgain(history)}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#c7963e] px-5 text-[12px] font-semibold text-white shadow-md shadow-[#c7963e]/20 transition hover:bg-[#ad812f]"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    Cari lagi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(history.id)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#8b8478] transition hover:bg-red-50 hover:text-red-600"
                                    title="Hapus riwayat"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {renderPagination()}
        </div>
    );
};

export default SearchHistory;
