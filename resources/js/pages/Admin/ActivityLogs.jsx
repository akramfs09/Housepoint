import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// 🆕 Mapping aksi ke label yang rapi
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
    const [selectedAction, setSelectedAction] = useState(''); // aksi spesifik dalam tab
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('verifikasi_seller');

    // Mapping tab ke array aksi
    const tabActions = {
        verifikasi_seller: ['approve_seller', 'reject_seller'],
        banding: ['approve_appeal', 'reject_appeal'],
        manajemen_user: ['ban_user', 'unban_user'],
        manajemen_admin: ['invite_admin', 'update_admin', 'deactivate_admin', 'reactivate_admin', 'delete_admin'],
    };

    // 🆕 Saat tab berubah, reset aksi
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedAction('');
        setPage(1);
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20 };
            if (actorId) params.actor_id = actorId;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            // 🆕 Kirim array aksi
            if (selectedAction) {
                // Satu aksi spesifik
                params.action = [selectedAction];
            } else {
                // Semua aksi di tab ini
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

    // Tabs
    const tabs = [
        { key: 'verifikasi_seller', label: 'Verifikasi Seller' },
        { key: 'banding', label: 'Banding' },
        { key: 'manajemen_user', label: 'Manajemen User' },
    ];
    if (user?.role === 'super_admin') {
        tabs.push({ key: 'manajemen_admin', label: 'Manajemen Admin' });
    }

    // 🆕 Fungsi untuk mendapatkan deskripsi target & detail
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
                target = targetName || metadata.seller_name || `Seller #${metadata.seller_id}`;
                if (metadata.seller_email) target += ` (${metadata.seller_email})`;
                detail = 'Disetujui';
                break;
            case 'reject_seller':
                target = targetName || metadata.seller_name || `Seller #${metadata.seller_id}`;
                if (metadata.seller_email) target += ` (${metadata.seller_email})`;
                detail = `Alasan: ${metadata.alasan || '-'}`;
                break;
            case 'approve_appeal':
                target = targetName || metadata.seller_name || `Seller #${metadata.seller_id}`;
                if (metadata.seller_email) target += ` (${metadata.seller_email})`;
                detail = `Banding disetujui. Alasan banding: ${metadata.alasan || '-'}`;
                break;
            case 'reject_appeal':
                target = targetName || metadata.seller_name || `Seller #${metadata.seller_id}`;
                if (metadata.seller_email) target += ` (${metadata.seller_email})`;
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
                detail = 'Dinonaktifkan';
                break;
            case 'reactivate_admin':
                if (target === '-') target = `Admin #${log.target_id}`;
                detail = 'Diaktifkan kembali';
                break;
            case 'delete_admin':
                if (target === '-') target = metadata.name || `Admin #${log.target_id}`;
                detail = `Email: ${metadata.email || '-'}`;
                break;
            default:
                detail = JSON.stringify(metadata);
        }

        return { target, detail };
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2c2c2c]">📋 Log Aktivitas</h2>
            <p className="text-sm text-[#8b8478]">
                {user?.role === 'super_admin'
                    ? 'Pantau semua aktivitas admin di sistem.'
                    : 'Lihat riwayat aktivitas Anda.'}
            </p>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#e5d8c0] pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                            activeTab === tab.key
                                ? 'bg-[#C5A065] text-white'
                                : 'bg-gray-100 text-[#5a554c] hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-3 items-end">
                {/* 🆕 Dropdown Aksi per Tab */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Aksi</label>
                    <select
                        value={selectedAction}
                        onChange={e => { setSelectedAction(e.target.value); setPage(1); }}
                        className="border border-[#e5dfd3] rounded-lg px-3 py-2 text-sm"
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
                    <div className="w-40">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Admin</label>
                        <input
                            type="text"
                            placeholder="Nama/Email"
                            value={actorId}
                            onChange={e => { setActorId(e.target.value); setPage(1); }}
                            className="w-full border border-[#e5dfd3] rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dari</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        className="border border-[#e5dfd3] rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sampai</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        className="border border-[#e5dfd3] rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cari</label>
                    <input
                        type="text"
                        placeholder="Nama/email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full border border-[#e5dfd3] rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#faf7f0] text-[#8b8478]">
                        <tr>
                            <th className="p-4 text-left">Waktu</th>
                            <th className="p-4 text-left">Admin</th>
                            <th className="p-4 text-left">Aksi</th>
                            <th className="p-4 text-left">Target</th>
                            <th className="p-4 text-left">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada aktivitas.</td></tr>
                        ) : logs.map(log => {
                            const { target, detail } = getTargetAndDetail(log);
                            return (
                                <tr key={log.id} className="border-t border-[#e5d8c0]">
                                    <td className="p-4 text-xs text-gray-500">
                                        {new Date(log.created_at).toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-4 text-xs font-medium">{log.actor?.name || '-'}</td>
                                    <td className="p-4 text-xs">
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                            {actionLabels[log.action] || log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-700">{target}</td>
                                    <td className="p-4 text-xs text-gray-500">{detail}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Paginasi */}
            {meta && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded-lg text-sm ${p === page ? 'bg-[#C5A065] text-white' : 'bg-white border text-[#5a554c]'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;