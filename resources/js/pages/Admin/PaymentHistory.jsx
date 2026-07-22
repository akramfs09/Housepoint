import { useEffect, useState } from 'react';
import { Banknote, CalendarClock, ChevronLeft, ChevronRight, Eye, FileClock, Home, Search, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchPaymentHistories, fetchPaymentHistoryDetail } from '../../services/api';

const TYPE_LABEL = {
    property_upload: 'Upload Properti',
    featured_listing: 'Unggulan',
};

const STATUS_CLASS = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-red-50 text-red-600',
    denied: 'bg-gray-100 text-gray-500',
    expired: 'bg-orange-50 text-orange-600',
};

const STATUS_LABEL = {
    pending: 'PENDING',
    paid: 'PAID',
    cancelled: 'CANCELLED',
    denied: 'DENIED',
    expired: 'EXPIRED',
};

const PaymentHistory = () => {
    const [histories, setHistories] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [status, setStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await fetchPaymentHistories({
                page,
                per_page: 10,
                search,
                payment_type: paymentType,
                status,
                date_from: dateFrom,
                date_to: dateTo,
            });

            setHistories(data.data || []);
            setMeta(data.meta || null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memuat histori pembayaran.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(load, 250);
        return () => clearTimeout(timer);
    }, [page, search, paymentType, status, dateFrom, dateTo]);

    const openDetail = async (id) => {
        setShowDetail(true);
        setSelectedHistory(null);
        setDetailLoading(true);
        try {
            const { data } = await fetchPaymentHistoryDetail(id);
            setSelectedHistory(data.data || null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memuat detail pembayaran.');
            setShowDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatDateTime = (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-[#eadcc4] bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                    <div className="relative lg:col-span-2">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b6ad9d]" />
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari order ID, properti, atau user"
                            className="h-10 w-full rounded-lg border border-[#eadcc4] bg-white pl-10 pr-3 text-[12px] text-[#4b4338] outline-none focus:border-[#c49a4a]"
                        />
                    </div>
                    <select
                        value={paymentType}
                        onChange={(event) => {
                            setPaymentType(event.target.value);
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-[#eadcc4] bg-white px-3 text-[12px] font-medium text-[#4b4338] outline-none focus:border-[#c49a4a]"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="property_upload">Upload Properti</option>
                        <option value="featured_listing">Unggulan</option>
                    </select>
                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-[#eadcc4] bg-white px-3 text-[12px] font-medium text-[#4b4338] outline-none focus:border-[#c49a4a]"
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="denied">Denied</option>
                        <option value="expired">Expired</option>
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => {
                            setDateFrom(event.target.value);
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-[#eadcc4] bg-white px-3 text-[12px] font-medium text-[#4b4338] outline-none focus:border-[#c49a4a]"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => {
                            setDateTo(event.target.value);
                            setPage(1);
                        }}
                        className="h-10 rounded-lg border border-[#eadcc4] bg-white px-3 text-[12px] font-medium text-[#4b4338] outline-none focus:border-[#c49a4a]"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#eadcc4] bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left">
                        <thead>
                            <tr className="border-b border-[#efe5d5] bg-[#fffdfa] text-[11px] font-bold text-[#8b8478]">
                                <th className="px-6 py-5">Tanggal</th>
                                <th className="px-6 py-5">Tipe</th>
                                <th className="px-6 py-5">User</th>
                                <th className="px-6 py-5">Properti</th>
                                <th className="px-6 py-5">Order ID</th>
                                <th className="px-6 py-5">Nominal</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-sm font-medium text-[#8b8478]">
                                        Memuat histori pembayaran...
                                    </td>
                                </tr>
                            ) : histories.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-sm font-medium text-[#8b8478]">
                                        Tidak ada histori pembayaran.
                                    </td>
                                </tr>
                            ) : histories.map((item) => (
                                <tr key={item.id} className="border-b border-[#f1eadf] text-[12px] last:border-b-0">
                                    <td className="px-6 py-5 text-[#6c6254]">
                                        <div className="flex items-center gap-2">
                                            <CalendarClock className="h-4 w-4 text-[#c49a4a]" />
                                            <span>{formatDateTime(item.created_at)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <FileClock className="h-4 w-4 text-[#c49a4a]" />
                                            <span className="rounded-full bg-[#f3f1ec] px-3 py-1.5 text-[10px] font-bold text-[#8b8478]">
                                                {TYPE_LABEL[item.payment_type] || item.payment_type || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eee7da] text-[10px] font-bold text-[#8a6400]">
                                                {(item.user?.name || item.customer_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="max-w-[150px] truncate font-bold text-[#4b4338]">
                                                    {item.user?.name || item.customer_name || '-'}
                                                </p>
                                                <p className="max-w-[150px] truncate text-[10px] text-[#8b8478]">
                                                    {item.user?.email || item.customer_email || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2.5">
                                            {item.property?.image_main ? (
                                                <img
                                                    src={item.property.image_main}
                                                    alt={item.property_title}
                                                    className="h-10 w-14 rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-[#f3f1ec] text-[#c49a4a]">
                                                    <Home className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="max-w-[180px] truncate font-bold text-[#23211d]">
                                                    {item.property?.title || item.property_title || '-'}
                                                </p>
                                                <p className="text-[10px] font-semibold text-[#8b8478]">
                                                    {item.property?.city || '-'} {item.property?.province ? `, ${item.property.province}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-mono text-[11px] text-[#5f574c]">
                                        {item.order_id}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="block text-[10px] font-bold leading-none text-[#d6a84b]">Rp</span>
                                        <span className="mt-1 block text-[12px] font-bold text-[#d6a84b]">
                                            {formatCurrency(item.amount).replace('Rp ', '')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black tracking-wide ${STATUS_CLASS[item.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {STATUS_LABEL[item.status] || item.status || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            type="button"
                                            onClick={() => openDetail(item.id)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#777066] transition hover:bg-[#f7f0e4] hover:text-[#8a6400]"
                                            title="Lihat detail"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 px-6 py-5">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={page === 1}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] transition hover:border-[#c49a4a] disabled:opacity-35"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[12px] text-[#8b8478]">
                            Halaman {meta.current_page || page} dari {meta.last_page}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={page === meta.last_page}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] transition hover:border-[#c49a4a] disabled:opacity-35"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {showDetail && (
                <PaymentHistoryModal
                    history={selectedHistory}
                    loading={detailLoading}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedHistory(null);
                    }}
                />
            )}
        </div>
    );
};

const PaymentHistoryModal = ({ history, loading, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-[#2c2c2c]">Detail Histori Pembayaran</h3>
                        <p className="text-xs text-[#8b8478]">Informasi transaksi yang tercatat dari sistem pembayaran HousePoint.</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="py-14 text-center text-sm text-[#8b8478]">Memuat detail...</div>
                ) : !history ? (
                    <div className="py-14 text-center text-sm text-[#8b8478]">Data detail tidak ditemukan.</div>
                ) : (
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoCard label="Order ID" value={history.order_id} mono />
                            <InfoCard label="Status" value={STATUS_LABEL[history.status] || history.status} />
                            <InfoCard label="Tipe Pembayaran" value={TYPE_LABEL[history.payment_type] || history.payment_type} />
                            <InfoCard label="Nominal" value={formatCurrency(history.amount)} />
                            <InfoCard label="Metode" value={history.payment_method || '-'} />
                            <InfoCard label="Gateway Status" value={history.gateway_status || '-'} />
                            <InfoCard label="Gateway Reference" value={history.gateway_reference || '-'} />
                            <InfoCard label="Paid At" value={history.paid_at ? new Date(history.paid_at).toLocaleString('id-ID') : '-'} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <PersonCard title="Pembayar" name={history.user?.name || history.customer_name || '-'} email={history.user?.email || history.customer_email || '-'} />
                            <InfoCard label="Referensi Properti" value={history.property?.slug || history.property_slug || '-'} mono />
                        </div>

                        <div className="rounded-xl border border-[#f0e6d8] bg-[#fffdfa] p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#8b8478]">Properti Terkait</p>
                            <div className="mt-3 flex items-center gap-3">
                                {history.property?.image_main ? (
                                    <img src={history.property.image_main} alt={history.property?.title} className="h-16 w-24 rounded-md object-cover" />
                                ) : (
                                    <div className="flex h-16 w-24 items-center justify-center rounded-md bg-[#f3f1ec] text-[#c49a4a]">
                                        <Home className="h-6 w-6" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-[#2c241b]">{history.property?.title || history.property_title || '-'}</p>
                                    <p className="text-xs text-[#8b8478]">
                                        {history.property?.city || '-'} {history.property?.province ? `, ${history.property.province}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {history.raw_payload && (
                            <div className="rounded-xl border border-[#f0e6d8] bg-[#111827] p-4 text-xs text-white">
                                <p className="mb-2 font-bold uppercase tracking-wider text-white/70">Raw Payload</p>
                                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-white/90">
                                    {JSON.stringify(history.raw_payload, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoCard = ({ label, value, mono = false }) => (
    <div className="rounded-xl border border-[#f0e6d8] bg-[#fffdfa] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8478]">{label}</p>
        <p className={`mt-2 text-sm font-semibold text-[#2c241b] ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</p>
    </div>
);

const PersonCard = ({ title, name, email }) => (
    <div className="rounded-xl border border-[#f0e6d8] bg-[#fffdfa] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b8478]">{title}</p>
        <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee7da] text-[#8a6400]">
                <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#2c241b]">{name}</p>
                <p className="truncate text-xs text-[#8b8478]">{email}</p>
            </div>
        </div>
    </div>
);

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default PaymentHistory;
