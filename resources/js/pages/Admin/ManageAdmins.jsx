import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import { 
    Users, ShieldCheck, Shield, UserX, 
    Search, FileText, Plus, CheckCircle, Clock 
} from 'lucide-react';

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

    // State untuk modal audit log
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    // Dummy Stats (Bisa diganti dengan data dari API jika ada endpoint stats)
    const [stats, setStats] = useState({
        totalAdmin: 24,
        adminAktif: 20,
        superAdmin: 4,
        nonaktif: 2,
    });

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20, search, role: filterRole, status: filterStatus };
            const res = await api.get('/admin/admins', { params });
            setAdmins(res.data.data);
            setMeta(res.data.meta);
            
            // Opsional: update stat total dari meta jika backend mendukung
            if(res.data.meta) {
                setStats(prev => ({ ...prev, totalAdmin: res.data.meta.total }));
            }
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

    // Card data config
    const statCards = [
        { title: 'TOTAL ADMIN', value: stats.totalAdmin, icon: <Users size={24} className="text-[#C5A065]" />, bgColor: 'bg-[#fdf4db]' },
        { title: 'ADMIN AKTIF', value: stats.adminAktif, icon: <CheckCircle size={24} className="text-green-500" />, bgColor: 'bg-green-50' },
        { title: 'SUPER ADMIN', value: stats.superAdmin, icon: <Shield size={24} className="text-blue-500" />, bgColor: 'bg-blue-50' },
        { title: 'NONAKTIF', value: stats.nonaktif, icon: <Clock size={24} className="text-yellow-500" />, bgColor: 'bg-yellow-50' },
    ];

    return (
        <div className="space-y-8 bg-[#fdfaf5] min-h-screen p-6 rounded-3xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#2c2c2c] tracking-tight">Manajemen Data Admin</h2>
                    <p className="text-sm text-[#8b8478] mt-1">Pantau, verifikasi, dan kelola semua AdminHousePoint.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={openAuditLog}
                        className="flex items-center gap-2 bg-white border-2 border-[#e5d8c0] text-[#5a554c] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#faf7f0] hover:border-[#C5A065] transition-all shadow-sm"
                    >
                        <FileText size={18} /> Audit Log
                    </button>
                    <Link
                        to="/admin/admins/invite"
                        className="flex items-center gap-2 bg-[#C5A065] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#b08d55] transition-all shadow-md"
                    >
                        <Plus size={18} /> Undang Admin
                    </Link>
                </div>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-[#f0ebe1] shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-[#8b8478] tracking-wider mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-extrabold text-[#2c2c2c] leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#f0ebe1] overflow-hidden">
                {/* Toolbar (Title & Filters) */}
                <div className="p-6 border-b border-[#f0ebe1] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <h3 className="font-bold text-lg text-[#2c2c2c]">Daftar Admin</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Cari nama/email..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-[#faf7f0] border border-[#e5d8c0] rounded-xl text-sm focus:outline-none focus:border-[#C5A065] transition-colors"
                            />
                        </div>
                        <select 
                            value={filterRole} 
                            onChange={e => { setFilterRole(e.target.value); setPage(1); }}
                            className="bg-[#faf7f0] border border-[#e5d8c0] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#C5A065] cursor-pointer"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                        <select 
                            value={filterStatus} 
                            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                            className="bg-[#faf7f0] border border-[#e5d8c0] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#C5A065] cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white border-b border-[#f0ebe1] text-[#8b8478] text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">ADMIN</th>
                                <th className="px-6 py-4 text-center">ROLE</th>
                                <th className="px-6 py-4 text-center">STATUS</th>
                                <th className="px-6 py-4 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0ebe1]">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium">Memuat data...</td></tr>
                            ) : admins.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium">Tidak ada data admin ditemukan.</td></tr>
                            ) : admins.map(admin => (
                                <tr key={admin.id} className="hover:bg-[#fdfaf5] transition-colors">
                                    {/* Kolom Info Admin (Avatar, Nama, Email) */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#fdf4db] border border-[#e5d8c0] flex justify-center items-center overflow-hidden shrink-0">
                                                {admin.avatar_url ? (
                                                    <img src={admin.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[#C5A065] font-extrabold text-lg">
                                                        {admin.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-[#2c2c2c]">{admin.name}</div>
                                                <div className="text-[12px] text-[#8b8478]">{admin.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Kolom Role (Style Pill Badge) */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider border ${
                                            admin.role === 'super_admin' 
                                                ? 'bg-[#fdf4db] text-[#b38e4b] border-[#f5e6c6]' 
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                        </span>
                                    </td>

                                    {/* Kolom Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center">
                                            {admin.is_banned ? (
                                                <span className="flex items-center gap-1.5 font-bold text-[13px] text-yellow-600">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending / Nonaktif
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 font-bold text-[13px] text-green-600">
                                                    <CheckCircle size={14} className="text-green-500" /> Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Kolom Aksi */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-4">
                                            <Link 
                                                to={`/admin/admins/${admin.id}/edit`} 
                                                className="text-[#C5A065] font-extrabold hover:text-[#a68450] transition-colors text-[13px]"
                                            >
                                                Manage
                                            </Link>
                                            
                                            {/* Action Options Stand-in */}
                                            <div className="border-l border-gray-200 pl-4 flex gap-3">
                                                {admin.is_banned ? (
                                                    <button onClick={() => setModal({ open: true, admin, type: 'reactivate' })} className="text-green-600 hover:text-green-700 font-semibold text-xs" title="Aktifkan">
                                                        Aktifkan
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setModal({ open: true, admin, type: 'deactivate' })} className="text-yellow-600 hover:text-yellow-700 font-semibold text-xs" title="Nonaktifkan">
                                                        Nonaktif
                                                    </button>
                                                )}
                                                <button onClick={() => setModal({ open: true, admin, type: 'delete' })} className="text-red-500 hover:text-red-700 font-semibold text-xs" title="Hapus">
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="p-4 border-t border-[#f0ebe1] flex justify-between items-center bg-white">
                        <span className="text-sm text-gray-500">
                            Menampilkan {admins.length} dari {meta.total} admin
                        </span>
                        <div className="flex gap-1">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 hover:bg-[#faf7f0] disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                        p === page ? 'bg-[#987635] text-white' : 'bg-white border border-[#e5d8c0] text-[#5a554c] hover:bg-[#faf7f0]'
                                    }`}>
                                    {p}
                                </button>
                            ))}
                            <button 
                                disabled={page === meta.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 hover:bg-[#faf7f0] disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                        className="w-full border border-[#e5dfd3] rounded-xl px-4 py-3 text-sm mt-4 focus:outline-none focus:border-[#C5A065]"
                        rows="3"
                        required
                    />
                )}
            </ConfirmModal>

            {/* Modal Audit Log */}
            {showAuditLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col overflow-hidden border border-[#e5d8c0]">
                        <div className="flex items-center justify-between p-6 border-b border-[#e5d8c0] bg-[#faf7f0]">
                            <div>
                                <h3 className="text-xl font-extrabold text-[#2c2c2c]">📋 Audit Log Sistem</h3>
                                <p className="text-sm text-[#8b8478] mt-1">Riwayat aktivitas para admin di sistem</p>
                            </div>
                            <button onClick={() => setShowAuditLog(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors shadow-sm border border-[#e5d8c0]">
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {auditLoading ? (
                                <div className="text-center py-12 text-[#8b8478] font-semibold animate-pulse">Memuat riwayat log...</div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-12 text-[#8b8478]">Belum ada aktivitas tercatat.</div>
                            ) : (
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-[#fdfaf5] text-[#8b8478] text-xs font-bold uppercase border-b border-[#e5d8c0]">
                                        <tr>
                                            <th className="p-4">Waktu</th>
                                            <th className="p-4">Aktor</th>
                                            <th className="p-4">Aksi</th>
                                            <th className="p-4">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0ebe1]">
                                        {auditLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-[#faf7f0] transition-colors">
                                                <td className="p-4 text-xs font-medium text-[#5a554c]">
                                                    {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="p-4 font-bold text-[#2c2c2c]">{log.actor?.name || '-'}</td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold border border-gray-200">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-[#8b8478] max-w-xs truncate">
                                                    {log.metadata ? JSON.stringify(log.metadata).substring(0, 80) + (JSON.stringify(log.metadata).length > 80 ? '...' : '') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;