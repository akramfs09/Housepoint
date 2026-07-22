import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, EyeOff, MessageSquareText, Search, Send, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    fetchAdminReports,
    fetchAdminWebsiteReviews,
    sendAdminReportMessage,
    updateAdminReport,
    updateAdminWebsiteReview,
} from '../../services/api';

const REPORT_CATEGORY_LABEL = {
    property: 'Properti',
    seller: 'Agen/Seller',
    chat: 'Pesan/Chat',
    payment: 'Pembayaran',
    bug: 'Bug Website',
    other: 'Lainnya',
};

const REPORT_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Ditinjau' },
    { value: 'resolved', label: 'Selesai' },
    { value: 'rejected', label: 'Ditolak' },
];

const REVIEW_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'hidden', label: 'Disembunyikan' },
];

const STATUS_CLASS = {
    pending: 'bg-amber-50 text-amber-700',
    reviewed: 'bg-blue-50 text-blue-600',
    resolved: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-red-50 text-red-600',
    approved: 'bg-emerald-50 text-emerald-600',
    hidden: 'bg-gray-100 text-gray-500',
};

const Reports = () => {
    const [activeTab, setActiveTab] = useState('reports');
    const [reports, setReports] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [noteDrafts, setNoteDrafts] = useState({});
    const [messageDrafts, setMessageDrafts] = useState({});
    const [internalDrafts, setInternalDrafts] = useState({});

    const load = async () => {
        setLoading(true);
        try {
            if (activeTab === 'reports') {
                const { data } = await fetchAdminReports({ status, page, per_page: 10 });
                setReports(data.data?.data || data.data || []);
                setPagination({ currentPage: data.meta?.current_page || data.data?.current_page, lastPage: data.meta?.last_page || data.data?.last_page, total: data.meta?.total || data.data?.total });
            } else {
                const { data } = await fetchAdminWebsiteReviews({ status, page, per_page: 10 });
                setReviews(data.data?.data || data.data || []);
                setPagination({ currentPage: data.meta?.current_page || data.data?.current_page, lastPage: data.meta?.last_page || data.data?.last_page, total: data.meta?.total || data.data?.total });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [activeTab, status, page]);

    const setNote = (id, value) => {
        setNoteDrafts((current) => ({ ...current, [id]: value }));
    };

    const handleUpdateReport = async (item, nextStatus) => {
        try {
            await updateAdminReport(item.id, {
                status: nextStatus,
                admin_note: noteDrafts[item.id] ?? item.admin_note ?? '',
            });
            toast.success('Status laporan diperbarui.');
            load();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui laporan.');
        }
    };

    const handleUpdateReview = async (item, nextStatus) => {
        try {
            await updateAdminWebsiteReview(item.id, {
                status: nextStatus,
                admin_note: noteDrafts[item.id] ?? item.admin_note ?? '',
            });
            toast.success('Status ulasan diperbarui.');
            load();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui ulasan.');
        }
    };

    const handleSendReportMessage = async (item) => {
        const message = messageDrafts[item.id]?.trim();
        if (!message) return;

        try {
            await sendAdminReportMessage(item.id, {
                message,
                is_internal: !!internalDrafts[item.id],
            });
            setMessageDrafts((current) => ({ ...current, [item.id]: '' }));
            setInternalDrafts((current) => ({ ...current, [item.id]: false }));
            toast.success('Balasan laporan dikirim.');
            load();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim balasan laporan.');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex rounded-xl border border-[#eadcc4] bg-white p-1">
                    <button
                        onClick={() => {
                            setActiveTab('reports');
                            setStatus('');
                            setPage(1);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${activeTab === 'reports' ? 'bg-[#c49a4a] text-white' : 'text-[#6f665a] hover:bg-[#f7f0e4]'}`}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Laporan Pengguna
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('reviews');
                            setStatus('');
                            setPage(1);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${activeTab === 'reviews' ? 'bg-[#c49a4a] text-white' : 'text-[#6f665a] hover:bg-[#f7f0e4]'}`}
                    >
                        <MessageSquareText className="h-4 w-4" />
                        Ulasan Website
                    </button>
                </div>

                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
                        setPage(1);
                    }}
                    className="h-10 rounded-lg border border-[#eadcc4] bg-white px-3 text-[12px] font-medium text-[#4b4338] outline-none focus:border-[#c49a4a]"
                >
                    <option value="">Semua Status</option>
                    {(activeTab === 'reports' ? REPORT_STATUS_OPTIONS : REVIEW_STATUS_OPTIONS).map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
            </div>

            <div className="rounded-xl border border-[#eadcc4] bg-white p-4 shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-sm font-medium text-[#8b8478]">Memuat data...</div>
                ) : activeTab === 'reports' ? (
                    <div className="space-y-3">
                        {reports.length === 0 ? (
                            <EmptyState text="Belum ada laporan pengguna." />
                        ) : reports.map((item) => (
                            <ReportCard
                                key={item.id}
                                item={item}
                                note={noteDrafts[item.id] ?? item.admin_note ?? ''}
                                messageDraft={messageDrafts[item.id] ?? ''}
                                isInternal={!!internalDrafts[item.id]}
                                onNoteChange={(value) => setNote(item.id, value)}
                                onMessageChange={(value) => setMessageDrafts((current) => ({ ...current, [item.id]: value }))}
                                onInternalChange={(value) => setInternalDrafts((current) => ({ ...current, [item.id]: value }))}
                                onSendMessage={() => handleSendReportMessage(item)}
                                onUpdate={(nextStatus) => handleUpdateReport(item, nextStatus)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.length === 0 ? (
                            <EmptyState text="Belum ada ulasan website." />
                        ) : reviews.map((item) => (
                            <ReviewCard
                                key={item.id}
                                item={item}
                                note={noteDrafts[item.id] ?? item.admin_note ?? ''}
                                onNoteChange={(value) => setNote(item.id, value)}
                                onUpdate={(nextStatus) => handleUpdateReview(item, nextStatus)}
                            />
                        ))}
                    </div>
                )}

                {pagination && pagination.total > 0 && (
                    <div className="text-center text-sm text-[#8b8478] mt-6">
                        Menampilkan {activeTab === 'reports' ? reports.length : reviews.length} dari {pagination.total} data
                    </div>
                )}
                {pagination && pagination.lastPage > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-sm border border-[#eadcc4] bg-white text-[#6f665a] disabled:opacity-40 hover:bg-[#f7f0e4]"
                        >
                            &laquo; Sebelumnya
                        </button>
                        {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                    p === page
                                        ? 'bg-[#c49a4a] text-white'
                                        : 'border border-[#eadcc4] bg-white text-[#6f665a] hover:bg-[#f7f0e4]'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(pagination.lastPage, p + 1))}
                            disabled={page === pagination.lastPage}
                            className="px-3 py-1.5 rounded-lg text-sm border border-[#eadcc4] bg-white text-[#6f665a] disabled:opacity-40 hover:bg-[#f7f0e4]"
                        >
                            Selanjutnya &raquo;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center text-sm font-medium text-[#8b8478]">
        <Search className="mb-3 h-8 w-8 text-[#d4c3a6]" />
        {text}
    </div>
);

const StatusBadge = ({ status }) => (
    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${STATUS_CLASS[status] || 'bg-gray-100 text-gray-500'}`}>
        {status}
    </span>
);

const UserAvatar = ({ user, label = 'User', size = 'h-9 w-9' }) => {
    const name = user?.name || label;
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff4d9] text-xs font-black text-[#9b720f]`}>
            {user?.avatar_url ? (
                <img src={user.avatar_url} alt={name} className="h-full w-full object-cover" />
            ) : (
                initial
            )}
        </div>
    );
};

const ReportCard = ({ item, note, messageDraft, isInternal, onNoteChange, onMessageChange, onInternalChange, onSendMessage, onUpdate }) => (
    <article className="rounded-xl border border-[#f0e6d8] bg-[#fffdfa] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="rounded-full bg-[#f2e8d6] px-3 py-1 text-[10px] font-bold text-[#8a6400]">
                        {REPORT_CATEGORY_LABEL[item.category] || item.category}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <UserAvatar user={item.user} />
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-[#2c241b]">{item.subject}</h3>
                        <p className="mt-1 truncate text-xs font-medium text-[#8b8478]">
                            {item.user?.name || 'User'} - {item.user?.email || '-'}
                        </p>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f574c]">{item.description}</p>
                <ReportThread messages={item.messages || []} />
            </div>
            <ActionPanel
                options={REPORT_STATUS_OPTIONS}
                note={note}
                messageDraft={messageDraft}
                isInternal={isInternal}
                onNoteChange={onNoteChange}
                onMessageChange={onMessageChange}
                onInternalChange={onInternalChange}
                onSendMessage={onSendMessage}
                onUpdate={onUpdate}
                showMessage
            />
        </div>
    </article>
);

const ReviewCard = ({ item, note, onNoteChange, onUpdate }) => (
    <article className="rounded-xl border border-[#f0e6d8] bg-[#fffdfa] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4d9] px-3 py-1 text-[10px] font-bold text-[#c49a4a]">
                        <Star className="h-3 w-3" fill="currentColor" />
                        {item.rating}/5
                    </span>
                    {!item.show_name && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500">
                            <EyeOff className="h-3 w-3" />
                            Nama disembunyikan
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <UserAvatar user={item.user} />
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-[#2c241b]">{item.user?.name || 'Pengguna HousePoint'}</h3>
                        <p className="mt-1 truncate text-xs font-medium text-[#8b8478]">{item.user?.email || '-'}</p>
                    </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f574c]">{item.review}</p>
            </div>
            <ActionPanel
                options={REVIEW_STATUS_OPTIONS}
                note={note}
                onNoteChange={onNoteChange}
                onUpdate={onUpdate}
            />
        </div>
    </article>
);

const ReportThread = ({ messages }) => {
    if (!messages.length) {
        return (
            <div className="mt-4 rounded-lg border border-dashed border-[#eadcc4] bg-white/70 px-3 py-3 text-xs font-medium text-[#8b8478]">
                Belum ada tindak lanjut di thread laporan.
            </div>
        );
    }

    return (
        <div className="mt-4 max-h-[220px] space-y-2 overflow-y-auto rounded-lg border border-[#eadcc4] bg-white p-3">
            {messages.map((message) => {
                const roleName = message.sender?.role?.nama_role || message.sender?.role;
                const fromAdmin = ['admin', 'super_admin'].includes(roleName);
                return (
                    <div key={message.id} className={`rounded-xl px-3 py-2 text-xs ${fromAdmin ? 'bg-[#fff4d9] text-[#4b4338]' : 'bg-[#f7f0e4] text-[#4b4338]'}`}>
                        <div className="mb-1 flex items-center gap-2">
                            <UserAvatar user={message.sender} label={fromAdmin ? 'Admin' : 'User'} size="h-6 w-6" />
                            <span className="font-black">{fromAdmin ? 'Admin HousePoint' : message.sender?.name || 'User'}</span>
                            {message.is_internal && (
                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[9px] font-black uppercase text-gray-600">Internal</span>
                            )}
                        </div>
                        <p className="leading-5">{message.message}</p>
                    </div>
                );
            })}
        </div>
    );
};

const ActionPanel = ({ options, note, messageDraft, isInternal, onNoteChange, onMessageChange, onInternalChange, onSendMessage, onUpdate, showMessage = false }) => (
    <div className="w-full shrink-0 space-y-2 lg:w-[260px]">
        <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            placeholder="Catatan admin"
            className="w-full resize-none rounded-lg border border-[#eadcc4] bg-white px-3 py-2 text-xs outline-none focus:border-[#c49a4a]"
        />
        <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onUpdate(option.value)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#eadcc4] bg-white px-2 py-2 text-[11px] font-bold text-[#6f665a] transition hover:border-[#c49a4a] hover:text-[#9b720f]"
                >
                    {option.value === 'approved' || option.value === 'resolved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    {option.label}
                </button>
            ))}
        </div>
        {showMessage && (
            <div className="space-y-2 border-t border-[#eadcc4] pt-2">
                <textarea
                    value={messageDraft}
                    onChange={(event) => onMessageChange(event.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Balasan tindak lanjut"
                    className="w-full resize-none rounded-lg border border-[#eadcc4] bg-white px-3 py-2 text-xs outline-none focus:border-[#c49a4a]"
                />
                <label className="flex items-center gap-2 text-[11px] font-bold text-[#6f665a]">
                    <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(event) => onInternalChange(event.target.checked)}
                        className="h-3.5 w-3.5 rounded border-[#c49a4a] text-[#c49a4a]"
                    />
                    Catatan internal admin
                </label>
                <button
                    onClick={onSendMessage}
                    disabled={!messageDraft?.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c49a4a] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#9b720f] disabled:opacity-50"
                >
                    <Send className="h-3.5 w-3.5" />
                    Kirim Balasan
                </button>
            </div>
        )}
    </div>
);

export default Reports;
