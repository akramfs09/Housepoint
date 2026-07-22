import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchAdminProperties } from '../../services/api';

const TYPE_LABEL = {
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    villa: 'Villa',
    ruko: 'Ruko',
    tanah: 'Tanah',
    gedung: 'Gedung',
};

const STATUS_LABEL = {
    draft: 'DRAFT',
    pending: 'MENUNGGU',
    approved: 'MENUNGGU BAYAR',
    published: 'AKTIF',
    rejected: 'DITOLAK',
};

const STATUS_CLASS = {
    draft: 'bg-gray-100 text-gray-500',
    pending: 'bg-blue-50 text-blue-600',
    approved: 'bg-amber-50 text-amber-700',
    published: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-red-50 text-red-600',
    sold: 'bg-red-50 text-red-600',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154526-990dced4db42?q=80&w=300&auto=format&fit=crop';

const formatPrice = (price) => {
    const value = Number(price);
    if (Number.isNaN(value)) return price || '-';

    return `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
};

const getStatusKey = (property) => {
    if (property.status === 'published' && property.status_jual === 'terjual') return 'sold';
    return property.status || 'draft';
};

const getStatusLabel = (property) => {
    if (property.status === 'published' && property.status_jual === 'terjual') return 'TERJUAL';
    return STATUS_LABEL[property.status] || property.status || 'DRAFT';
};

const getSellerInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    if (!parts.length || !parts[0]) return 'HP';
    return parts.map((part) => part[0]).join('').toUpperCase();
};

const AllProperties = () => {
    const [properties, setProperties] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);

    const pageNumbers = useMemo(() => {
        if (!pagination?.lastPage) return [];

        const visible = [];
        const lastPage = pagination.lastPage;
        for (let i = 1; i <= Math.min(lastPage, 5); i += 1) {
            visible.push(i);
        }

        if (lastPage > 6) {
            visible.push('dots');
            visible.push(lastPage);
        } else if (lastPage === 6) {
            visible.push(6);
        }

        return visible;
    }, [pagination]);

    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                const { data } = await fetchAdminProperties({
                    page,
                    per_page: 5,
                    search,
                    status,
                });

                setProperties(data.data || []);
                setPagination({
                    currentPage: data.meta?.current_page || page,
                    lastPage: data.meta?.last_page || 1,
                    total: data.meta?.total || 0,
                });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal memuat data properti.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(loadProperties, 250);
        return () => clearTimeout(timer);
    }, [page, search, status]);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(1);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-[320px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b6ad9d]" />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari properti atau agen"
                        className="h-10 w-full rounded-lg border border-[#eadcc4] bg-white pl-10 pr-3 text-[12px] text-[#4b4338] outline-none transition placeholder:text-[#b6ad9d] focus:border-[#c49a4a]"
                    />
                </div>

                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="h-10 rounded-lg border border-[#eadcc4] bg-white px-3 text-[12px] font-medium text-[#4b4338] outline-none transition focus:border-[#c49a4a]"
                >
                    <option value="">Semua Status</option>
                    <option value="published">Aktif</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Menunggu Bayar</option>
                    <option value="rejected">Ditolak</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#efe5d5] bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left">
                        <thead>
                            <tr className="border-b border-[#efe5d5] bg-[#fffdfa] text-[11px] font-bold text-[#8b8478]">
                                <th className="px-9 py-5">Properti</th>
                                <th className="px-6 py-5">Tipe</th>
                                <th className="px-6 py-5">Harga</th>
                                <th className="px-6 py-5">Agen</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm font-medium text-[#8b8478]">
                                        Memuat data properti...
                                    </td>
                                </tr>
                            ) : properties.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm font-medium text-[#8b8478]">
                                        Tidak ada data properti.
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property) => {
                                    const sellerName = property.seller?.name || 'Tidak diketahui';
                                    const statusKey = getStatusKey(property);
                                    const imageUrl = property.image_main || property.images?.[0]?.url || FALLBACK_IMAGE;

                                    return (
                                        <tr key={property.id} className="border-b border-[#f1eadf] text-[12px] last:border-b-0">
                                            <td className="px-9 py-5">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={imageUrl}
                                                        alt={property.title}
                                                        className="h-[52px] w-[70px] rounded-md object-cover"
                                                        loading="lazy"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="max-w-[170px] truncate text-[13px] font-bold text-[#23211d]">
                                                            {property.title}
                                                        </p>
                                                        <p className="mt-1 text-[10px] font-semibold text-[#8b8478]">
                                                            ID: HP-{String(property.id).padStart(4, '0')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex rounded-full bg-[#f3f1ec] px-3 py-1.5 text-[10px] font-bold text-[#8b8478]">
                                                    {TYPE_LABEL[property.type] || property.type || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="block text-[10px] font-bold leading-none text-[#d6a84b]">Rp</span>
                                                <span className="mt-1 block text-[12px] font-bold text-[#d6a84b]">
                                                    {formatPrice(property.price).replace('Rp ', '')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eee7da] text-[10px] font-bold text-[#8a6400]">
                                                        {getSellerInitials(sellerName)}
                                                    </div>
                                                    <span className="max-w-[120px] truncate text-[12px] font-bold text-[#4b4338]">
                                                        {sellerName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black tracking-wide ${STATUS_CLASS[statusKey] || STATUS_CLASS.draft}`}>
                                                    {getStatusLabel(property)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProperty(property)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#777066] transition hover:bg-[#f7f0e4] hover:text-[#8a6400]"
                                                    title="Lihat detail"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.lastPage > 1 && (
                    <div className="flex items-center justify-center gap-2 px-6 py-5">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={page === 1}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] transition hover:border-[#c49a4a] disabled:opacity-35"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>

                        {pageNumbers.map((pageNumber) => pageNumber === 'dots' ? (
                            <span key="dots" className="px-1 text-[12px] text-[#8b8478]">...</span>
                        ) : (
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
                )}
            </div>

            {selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-[520px] rounded-xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#2c2c2c]">{selectedProperty.title}</h2>
                                <p className="mt-1 text-xs font-medium text-[#8b8478]">
                                    HP-{String(selectedProperty.id).padStart(4, '0')} · {selectedProperty.city || '-'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProperty(null)}
                                className="rounded-md px-2 py-1 text-sm font-bold text-[#8b8478] hover:bg-[#f7f0e4]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-[#f8f4ec] p-3">
                                <p className="text-[10px] font-bold uppercase text-[#8b8478]">Tipe</p>
                                <p className="mt-1 font-semibold text-[#2c2c2c]">{TYPE_LABEL[selectedProperty.type] || selectedProperty.type || '-'}</p>
                            </div>
                            <div className="rounded-lg bg-[#f8f4ec] p-3">
                                <p className="text-[10px] font-bold uppercase text-[#8b8478]">Harga</p>
                                <p className="mt-1 font-semibold text-[#c08a2c]">{formatPrice(selectedProperty.price)}</p>
                            </div>
                            <div className="rounded-lg bg-[#f8f4ec] p-3">
                                <p className="text-[10px] font-bold uppercase text-[#8b8478]">Agen</p>
                                <p className="mt-1 font-semibold text-[#2c2c2c]">{selectedProperty.seller?.name || '-'}</p>
                            </div>
                            <div className="rounded-lg bg-[#f8f4ec] p-3">
                                <p className="text-[10px] font-bold uppercase text-[#8b8478]">Status</p>
                                <p className="mt-1 font-semibold text-[#2c2c2c]">{getStatusLabel(selectedProperty)}</p>
                            </div>
                        </div>

                        {selectedProperty.slug && selectedProperty.status === 'published' && (
                            <a
                                href={`/property/${selectedProperty.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#c49a4a] text-sm font-bold text-white transition hover:bg-[#ad812f]"
                            >
                                <Eye className="h-4 w-4" />
                                Lihat Halaman Properti
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllProperties;
