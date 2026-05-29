import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState({ open: false, admin: null, type: '' });
    const [alasan, setAlasan] = useState('');

    // 🆕 state untuk modal audit log
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20, search, role: filterRole, status: filterStatus };
            const res = await api.get('/admin/admins', { params });
            setAdmins(res.data.data);
            setMeta(res.data.meta);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAdmins(); }, [page, search, filterRole, filterStatus]);

    const handleAction = async () => {
        const { admin, type } = modal;
        try {
            if (type === 'deactivate') await api.patch(`/admin/admins/${admin.id}/deactivate`, { alasan });
            else if (type === 'reactivate') await api.patch(`/admin/admins/${admin.id}/reactivate`);
            else if (type === 'delete') await api.delete(`/admin/admins/${admin.id}`);
            setModal({ open: false, admin: null, type: '' });
            setAlasan('');
            fetchAdmins();
        } catch (err) { alert(err.response?.data?.message || 'Gagal'); }
    };

    // 🆕 fungsi untuk membuka dan memuat audit log
    const openAuditLog = async () => {
        setShowAuditLog(true);
        setAuditLoading(true);
        try {
            const res = await api.get('/admin/admins/audit-logs?per_page=50');
            setAuditLogs(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setAuditLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[#2c2c2c]">🧑‍💼 Kelola Admin Lain</h2>
                    <p className="text-sm text-[#8b8478]">Kelola semua admin HousePoint</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openAuditLog}
                        className="bg-white border border-[#C5A065] text-[#C5A065] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#faf7f0] transition"
                    >
                        📋 Audit Log
                    </button>
                    <Link
                        to="/admin/admins/invite"
                        className="bg-[#C5A065] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b08d55] transition"
                    >
                        + Undang Admin
                    </Link>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex gap-3 flex-wrap">
                <input
                    type="text" placeholder="Cari nama atau email..." value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px]"
                />
                <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}
                    className="border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm">
                    <option value="">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    className="border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm">
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
            </div>

            {/* Tabel Admin */}
            <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#faf7f0] text-[#8b8478]">
                        <tr>
                            <th className="p-4 text-left">Nama</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Role</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tidak ada admin.</td></tr>
                        ) : admins.map(admin => (
                            <tr key={admin.id} className="border-t border-[#e5d8c0]">
                                <td className="p-4 font-medium text-[#2c2c2c]">{admin.name}</td>
                                <td className="p-4 text-[#5a554c]">{admin.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${admin.role === 'super_admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${admin.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {admin.is_banned ? 'Nonaktif' : 'Aktif'}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Link to={`/admin/admins/${admin.id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                                    {admin.is_banned ? (
                                        <button onClick={() => setModal({ open: true, admin, type: 'reactivate' })} className="text-green-600 hover:underline text-xs">Aktifkan</button>
                                    ) : (
                                        <button onClick={() => setModal({ open: true, admin, type: 'deactivate' })} className="text-yellow-600 hover:underline text-xs">Nonaktifkan</button>
                                    )}
                                    <button onClick={() => setModal({ open: true, admin, type: 'delete' })} className="text-red-600 hover:underline text-xs">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginasi */}
            {meta && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded-lg text-sm ${p === page ? 'bg-[#C5A065] text-white' : 'bg-white border text-[#5a554c]'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal Konfirmasi */}
            <ConfirmModal
                isOpen={modal.open}
                title={modal.type === 'delete' ? 'Hapus Admin' : modal.type === 'deactivate' ? 'Nonaktifkan Admin' : 'Aktifkan Admin'}
                message={modal.type === 'delete' ? 'Admin akan dihapus permanen.' : modal.type === 'deactivate' ? 'Admin tidak akan bisa login. Isi alasan penonaktifan.' : 'Admin akan bisa login kembali.'}
                confirmLabel={modal.type === 'delete' ? 'Hapus' : modal.type === 'deactivate' ? 'Nonaktifkan' : 'Aktifkan'}
                confirmColor={modal.type === 'delete' ? 'bg-red-600' : modal.type === 'deactivate' ? 'bg-yellow-600' : 'bg-green-600'}
                onConfirm={handleAction}
                onCancel={() => { setModal({ open: false, admin: null, type: '' }); setAlasan(''); }}
            >
                {modal.type === 'deactivate' && (
                    <textarea
                        value={alasan}
                        onChange={e => setAlasan(e.target.value)}
                        placeholder="Alasan penonaktifan..."
                        className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm mt-2"
                        rows="2"
                        required
                    />
                )}
            </ConfirmModal>

            {/* 🆕 Modal Audit Log */}
            {showAuditLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#2c2c2c]">📋 Audit Log</h3>
                            <button onClick={() => setShowAuditLog(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        {auditLoading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">Belum ada aktivitas tercatat.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-[#faf7f0] text-[#8b8478]">
                                    <tr>
                                        <th className="p-3 text-left">Waktu</th>
                                        <th className="p-3 text-left">Aktor</th>
                                        <th className="p-3 text-left">Aksi</th>
                                        <th className="p-3 text-left">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="border-t border-[#e5d8c0]">
                                            <td className="p-3 text-xs text-gray-500">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-3 text-xs font-medium">{log.actor?.name || '-'}</td>
                                            <td className="p-3 text-xs">
                                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-gray-500">
                                                {log.metadata ? JSON.stringify(log.metadata).substring(0, 80) + (JSON.stringify(log.metadata).length > 80 ? '...' : '') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="flex justify-end mt-4">
                            <button onClick={() => setShowAuditLog(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;