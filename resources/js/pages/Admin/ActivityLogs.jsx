import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Search, RotateCcw } from 'lucide-react';

// Mapping aksi ke label yang rapi
const actionLabels = {
    approve_seller: 'Setujui Seller',
    reject_seller: 'Tolak Seller',
    approve_appeal: 'Setujui Banding',
    reject_appeal: 'Tolak Banding',
    ban_user: 'Nonaktifkan User',
    unban_user: 'Aktifkan User',
    invite_admin: 'Undang Admin',
    update_admin: 'Perbarui Admin',
    deactivate_admin: 'Nonaktifkan Admin',
    reactivate_admin: 'Aktifkan Admin',
    delete_admin: 'Hapus Admin',
    // FIX #1: 3 aksi yang belum ada di frontend
    edit_published_property: 'Edit Properti Published',
    update_property: 'Edit Properti',
    verify_superadmin_ktp_access: 'Akses KTP Super Admin',
};

const ActivityLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [actorId, setActorId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('verifikasi_seller');

    // Mapping tab ke array aksi — FIX #2: tambah tab Manajemen Properti & Keamanan
    const tabActions = {
        verifikasi_seller: ['approve_seller', 'reject_seller'],
        banding: ['approve_appeal', 'reject_appeal'],
        manajemen_user: ['ban_user', 'unban_user'],
        manajemen_admin: ['invite_admin', 'update_admin', 'deactivate_admin', 'reactivate_admin', 'delete_admin'],
        manajemen_properti: ['edit_published_property', 'update_property'],
        keamanan: ['verify_superadmin_ktp_access'],
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedAction('');
        setPage(1);
    };

    // FIX #3: Reset semua filter sekaligus
    const handleResetFilter = () => {
        setActorId('');
        setDateFrom('');
        setDateTo('');
        setSelectedAction('');
        setSearch('');
        setPage(1);
    };

    const hasActiveFilter = actorId || dateFrom || dateTo || selectedAction || search;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 10 };
            if (actorId) params.actor_id = actorId;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            if (selectedAction) {
                params.action = [selectedAction];
            } else {
                params.action = tabActions[activeTab] || [];
            }

            if (search) params.search = search;

            const res = await api.get('/admin/activity-logs', { params });
            setLogs(res.data.data);
            setMeta(res.data.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, actorId, dateFrom, dateTo, selectedAction, activeTab, search]);

    // Tabs — FIX #2: tambah tab baru
    const tabs = [
        { key: 'verifikasi_seller', label: 'Verifikasi Seller' },
        { key: 'banding', label: 'Banding' },
        { key: 'manajemen_user', label: 'Manajemen User' },
        { key: 'manajemen_properti', label: 'Manajemen Properti' },
    ];
    if (user?.role === 'super_admin') {
        tabs.push({ key: 'manajemen_admin', label: 'Manajemen Admin' });
        tabs.push({ key: 'keamanan', label: 'Keamanan' });
    }

    // FIX #4 (utama): Perbaiki posisi `return` — sebelumnya return berada di LUAR function
    const getTargetAndDetail = (log) => {
        const metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata || {};
        let target = '-';
        let detail = '-';

        const targetName = log.target?.name || metadata.name || metadata.email || null;
        const targetEmail = log.target?.email || metadata.email || null;

        if (targetName && targetEmail) {
            target = `${targetName} (${targetEmail})`;
        } else if (targetName) {
            target = targetName;
        } else if (targetEmail) {
            target = targetEmail;
        }

        if (target === '-' && metadata.seller_id) {
            target = `Seller #${metadata.seller_id}`;
        }

        switch (log.action) {
            case 'ban_user':
                detail = `Alasan: ${metadata.alasan || '-'}`;
                if (target === '-') target = `User #${metadata.user_id}`;
                break;
            case 'unban_user':
                detail = 'Diaktifkan kembali';
                if (target === '-') target = `User #${metadata.user_id}`;
                break;
            case 'approve_seller':
                detail = 'Pendaftaran seller disetujui';
                break;
            case 'reject_seller':
                detail = `Alasan: ${metadata.alasan || '-'}`;
                break;
            case 'approve_appeal':
                detail = `Banding disetujui. Alasan banding: ${metadata.alasan || '-'}`;
                break;
            case 'reject_appeal':
                detail = `Banding ditolak. Alasan banding: ${metadata.alasan || '-'}`;
                break;
            case 'invite_admin':
                if (target === '-') target = metadata.email || '-';
                detail = `Role: ${metadata.role || '-'}`;
                break;
            case 'update_admin':
                if (target === '-') target = metadata.email || `Admin #${log.target_id}`;
                detail = 'Data admin diperbarui';
                break;
            case 'deactivate_admin':
                if (target === '-') target = `Admin #${log.target_id}`;
                detail = `Alasan: ${metadata.alasan || 'Dinonaktifkan'}`;
                break;
            case 'reactivate_admin':
                if (target === '-') target = `Admin #${log.target_id}`;
                detail = 'Diaktifkan kembali';
                break;
            case 'delete_admin':
                if (target === '-') target = metadata.name || `Admin #${log.target_id}`;
                detail = `Email: ${metadata.email || '-'}`;
                break;
            // FIX #5: tambah case untuk 3 aksi yang belum ada
            case 'edit_published_property':
                if (target === '-') target = metadata.title || `Properti #${log.target_id}`;
                detail = 'Properti published diedit oleh admin';
                break;
            case 'update_property':
                if (target === '-') target = metadata.title || `Properti #${log.target_id}`;
                detail = 'Properti diperbarui oleh admin';
                break;
            case 'verify_superadmin_ktp_access':
                target = log.actor?.name || 'Super Admin';
                detail = 'Super Admin mengakses data KTP sensitif';
                break;
            default:
                detail = JSON.stringify(metadata);
        }

        // FIX #4: return ada DI DALAM function (sebelumnya di luar)
        return { target, detail };
    };

    return (
        <div className="space-y-6">
            {/* FIX #6: Header halaman */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#2c2c2c] tracking-tight">Log Aktivitas</h2>
                    <p className="text-sm text-[#8b8478] mt-1">
                        Riwayat lengkap semua tindakan yang dilakukan oleh admin di sistem.
                    </p>
                </div>
                {/* FIX #3: Info total + reset */}
                {meta && (
                    <div className="text-xs font-semibold text-[#8b8478] bg-[#faf7f0] px-3 py-1.5 rounded-lg border border-[#e5d8c0]">
                        Total <span className="text-[#2c2c2c]">{meta.total}</span> aktivitas tercatat
                    </div>
                )}
            </div>

            {/* Tabs — FIX styling: border-bottom indicator */}
            <div className="flex gap-1.5 border-b border-[#e5d8c0] overflow-x-auto pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
                            activeTab === tab.key
                                ? 'text-[#C5A065] border-[#C5A065] bg-[#fdf4db]/30'
                                : 'text-[#5a554c] border-transparent hover:text-[#C5A065] hover:border-[#e5d8c0]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filter — FIX #styling: konsisten dengan tema */}
            <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-2xl border border-[#f0ebe1]">
                <div>
                    <label className="block text-xs font-bold text-[#5a554c] mb-1.5">Jenis Aksi</label>
                    <select
                        value={selectedAction}
                        onChange={e => { setSelectedAction(e.target.value); setPage(1); }}
                        className="bg-[#faf7f0] border border-[#e5d8c0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C5A065] cursor-pointer"
                    >
                        <option value="">Semua Aksi</option>
                        {(tabActions[activeTab] || []).map(action => (
                            <option key={action} value={action}>
                                {actionLabels[action] || action}
                            </option>
                        ))}
                    </select>
                </div>

                {user?.role === 'super_admin' && (
                    <div>
                        <label className="block text-xs font-bold text-[#5a554c] mb-1.5">Filter Admin</label>
                        <input
                            type="text"
                            placeholder="Nama/Email admin..."
                            value={actorId}
                            onChange={e => { setActorId(e.target.value); setPage(1); }}
                            className="bg-[#faf7f0] border border-[#e5d8c0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C5A065] w-44"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-[#5a554c] mb-1.5">Dari Tanggal</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        className="bg-[#faf7f0] border border-[#e5d8c0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C5A065]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#5a554c] mb-1.5">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        className="bg-[#faf7f0] border border-[#e5d8c0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C5A065]"
                    />
                </div>

                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-bold text-[#5a554c] mb-1.5">Cari</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Kata kunci, nama, email..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full bg-[#faf7f0] border border-[#e5d8c0] rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#C5A065]"
                        />
                    </div>
                </div>

                {/* FIX #3: Tombol Reset Filter */}
                {hasActiveFilter && (
                    <button
                        onClick={handleResetFilter}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#5a554c] bg-[#faf7f0] border border-[#e5d8c0] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                        <RotateCcw size={14} />
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#f0ebe1] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FAF8F5] border-b border-[#f0ebe1] text-[#8b8478] text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Aksi</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0ebe1]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-[#9C9487]">
                                            <div className="w-8 h-8 border-4 border-[#FBF3E9] border-t-[#D4A44C] rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Memuat data log...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-sm text-[#9C9487] font-medium">
                                        Belum ada aktivitas tercatat untuk tab ini.
                                    </td>
                                </tr>
                            ) : logs.map(log => {
                                const { target, detail } = getTargetAndDetail(log);
                                const actionType = log.action?.toLowerCase();
                                const badgeColor =
                                    actionType?.includes('reject') || actionType?.includes('ban') || actionType?.includes('deactivate') || actionType?.includes('delete')
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : actionType?.includes('approve') || actionType?.includes('unban') || actionType?.includes('reactivate')
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : actionType?.includes('verify') || actionType?.includes('keamanan') || actionType?.includes('ktp')
                                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                                        : 'bg-blue-50 text-blue-600 border-blue-100';

                                return (
                                    <tr key={log.id} className="hover:bg-[#fdfaf5] transition-colors">
                                        <td className="px-6 py-4 text-xs font-semibold text-[#5a554c] whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#2c2c2c] text-[13px]">{log.actor?.name || '-'}</div>
                                            <div className="text-[11px] text-[#9C9487] mt-0.5">
                                                {log.actor?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border ${badgeColor}`}>
                                                {actionLabels[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-[#4A433A] max-w-[180px] truncate" title={target}>
                                            {target}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[#6B6255] max-w-[200px] truncate" title={detail}>
                                            {detail}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination + info total */}
                <div className="p-4 px-6 border-t border-[#f0ebe1] flex justify-between items-center bg-white">
                    <span className="text-xs font-semibold text-[#8b8478]">
                        {meta ? (
                            <>
                                Halaman <span className="text-[#2c2c2c]">{page}</span> dari <span className="text-[#2c2c2c]">{meta.last_page}</span>
                                {' · '}Total <span className="text-[#2c2c2c]">{meta.total}</span> aktivitas
                            </>
                        ) : '—'}
                    </span>
                    {meta && meta.last_page > 1 && (
                        <div className="flex gap-1.5">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 rounded-lg text-sm border border-[#e5d8c0] bg-white text-[#5a554c] disabled:opacity-40 hover:bg-[#faf7f0] transition-colors"
                            >
                                &laquo; Sebelumnya
                            </button>
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                        p === page
                                            ? 'bg-[#C5A065] text-white shadow-sm'
                                            : 'bg-white border border-[#e5d8c0] text-[#5a554c] hover:bg-[#faf7f0]'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                className="px-3 py-1.5 rounded-lg text-sm border border-[#e5d8c0] bg-white text-[#5a554c] disabled:opacity-40 hover:bg-[#faf7f0] transition-colors"
                            >
                                Selanjutnya &raquo;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;