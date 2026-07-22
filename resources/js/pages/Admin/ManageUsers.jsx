import { useState, useEffect } from 'react';
import api from '../../services/api';
import UserDetailModal from '../../components/common/UserDetailModal';
import BanModal from '../../components/common/BanModal';
import AppealModal from '../../components/common/AppealModal';

const ManageUsers = () => {
    // ==========================================
    // STATE UNTUK TABEL USER
    // ==========================================
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Modal states
    const [showDetail, setShowDetail] = useState(false);
    const [showBan, setShowBan] = useState(false);
    const [showAppeal, setShowAppeal] = useState(false);
    const [selectedAppealUser, setSelectedAppealUser] = useState(null);

    // ==========================================
    // STATE UNTUK STATISTIK REAL-TIME (DATABASE)
    // ==========================================
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        userSuspended: 0,
    });

    // Fungsi untuk mengambil data statistik asli dari backend
    const fetchStats = async () => {
        try {
            // Catatan: Sesuaikan endpoint ini dengan route yang ada di backend Laravel Anda
            const res = await api.get('/admin/users/stats'); 
            
            // Asumsi response backend mengembalikan struktur data seperti ini
            const statsData = res.data?.data || res.data || {};
            setStats({
                totalUsers: statsData.total_users || 0,
                totalBuyers: statsData.total_buyers || 0,
                totalSellers: statsData.total_sellers || 0,
                userSuspended: statsData.total_suspended || 0,
            });
        } catch (err) {
            console.error("Gagal mengambil data statistik:", err);
        }
    };

    // Efek Polling: Ambil data stat saat pertama kali load, lalu ulangi setiap 5 detik
    useEffect(() => {
        fetchStats(); // Panggil langsung saat komponen mount

        const interval = setInterval(() => {
            fetchStats(); // Panggil lagi secara berkala (polling)
        }, 5000); // 5000ms = 5 detik

        return () => clearInterval(interval); // Bersihkan interval saat pindah halaman
    }, []);

    // Konfigurasi array untuk mapping kartu
    const statCards = [
        { id: 1, title: 'Total User', value: stats.totalUsers, trend: '+12%', isPositive: true, icon: '👥', iconColor: 'text-yellow-600', bgColor: 'bg-[#fdf4db]' },
        { id: 2, title: 'Total Buyer', value: stats.totalBuyers, trend: '+5%', isPositive: true, icon: '🛍️', iconColor: 'text-yellow-600', bgColor: 'bg-[#fdf4db]' },
        { id: 3, title: 'Total Seller', value: stats.totalSellers, trend: '+18%', isPositive: true, icon: '🏪', iconColor: 'text-yellow-600', bgColor: 'bg-[#fdf4db]' },
        { id: 4, title: 'User Suspended', value: stats.userSuspended, trend: '2.4%', isPositive: false, icon: '🚫', iconColor: 'text-red-500', bgColor: 'bg-red-50' },
    ];

    // ==========================================
    // FUNGSI API & RENDER TABEL
    // ==========================================
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 10, search };

            if (activeTab !== 'all' && activeTab !== 'appeal') {
                params.role = activeTab;
            }
            if (activeTab === 'appeal') {
                params.has_pending_appeal = 'true';
            }

            const res = await api.get('/admin/users', { params });
            setUsers(res.data.data);
            setMeta(res.data.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, activeTab, search]);

    // Fungsi helper untuk dipanggil setelah melakukan aksi di Modal (Ban/Banding)
    // Agar tabel dan statistik langsung update secara bersamaan tanpa menunggu 5 detik
    const handleRefreshData = () => {
        fetchUsers();
        fetchStats();
    };

    const handleAppealAction = async (user, action) => {
        const appealId = user?.pending_appeal?.id;
        if (!appealId) {
            alert('Data banding tidak ditemukan.');
            return;
        }

        try {
            if (action === 'approve') {
                await api.patch(`/admin/seller/appeals/${appealId}/approve`);
            } else {
                const catatan = window.prompt('Catatan penolakan banding (opsional):') || '';
                await api.patch(`/admin/seller/appeals/${appealId}/reject`, { catatan_internal: catatan });
            }
            handleRefreshData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memproses banding.');
        }
    };

    // Format Tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const tabs = [
        { key: 'all', label: 'Semua' },
        { key: 'customer', label: 'Customer' },
        { key: 'seller', label: 'Seller' },
        { key: 'appeal', label: 'Banding' },
    ];

    return (
        <div className="space-y-6 bg-[#fdfaf5] min-h-screen p-6 rounded-3xl">
            
            
            {/* Top Stats Cards (Real-time Database) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-2xl p-5 border border-[#f0ebe1] shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${stat.bgColor} ${stat.iconColor}`}>
                                {stat.icon}
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-[#8b8478] font-semibold mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-extrabold text-[#2c2c2c] transition-all duration-300">
                                {stat.value.toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar: Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center mt-8">
                <div className="flex bg-white border border-[#e5d8c0] rounded-xl p-1 shadow-sm w-full md:w-auto overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setPage(1); }}
                            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-[#D4AD5D] text-white shadow-md'
                                    : 'text-[#8b8478] hover:bg-[#faf7f0] hover:text-[#2c2c2c]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Cari user (nama/email)..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full md:w-72 border border-[#e5d8c0] bg-white rounded-xl px-4 py-2 text-sm text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] shadow-sm"
                />
            </div>

            {/* Main Table Card */}
            <div className="bg-[#faf7f0] rounded-3xl border border-[#e5d8c0] overflow-hidden pt-4 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[#8b8478] border-b border-[#e5d8c0]">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wide">User Info</th>
                                <th className="px-6 py-4 font-semibold tracking-wide text-center">Role Akun</th>
                                <th className="px-6 py-4 font-semibold tracking-wide">Tgl Registrasi</th>
                                <th className="px-6 py-4 font-semibold tracking-wide">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wide text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Loading data...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Tidak ada data ditemukan.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="border-b border-[#f0ebe1] last:border-none hover:bg-[#faf7f0] transition-colors">
                                        
                                        {/* Kolom Info User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-[#e5d8c0]">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#fdf4db] text-[#D4AD5D] font-bold text-lg">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-[#2c2c2c]">{user.name}</div>
                                                    <div className="text-[12px] text-[#8b8478]">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom Role */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block bg-[#fdf4db] text-[#d99f2a] px-3 py-1 rounded-full text-[11px] font-bold tracking-wider capitalize border border-[#f5e6c6]">
                                                {user.role}
                                            </span>
                                        </td>

                                        {/* Kolom Tanggal */}
                                        <td className="px-6 py-4 text-[#5a554c] font-medium">
                                            {formatDate(user.created_at)}
                                        </td>

                                        {/* Kolom Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${user.is_banned ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                <span className={`font-semibold text-sm ${user.is_banned ? 'text-red-600' : 'text-green-600'}`}>
                                                    {user.is_banned ? 'Suspended' : 'Active'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Kolom Aksi */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                                {activeTab === 'appeal' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAppealAction(user, 'approve')}
                                                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-green-700"
                                                        >
                                                            Setuju
                                                        </button>
                                                        <button
                                                            onClick={() => handleAppealAction(user, 'reject')}
                                                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedUser(user); setShowDetail(true); }}
                                                            className="rounded-lg border border-[#e5d8c0] bg-white px-3 py-1.5 text-xs font-bold text-[#8b6b2d] transition-colors hover:border-[#D4AD5D] hover:bg-[#fff7e8]"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedUser(user); setShowBan(true); }}
                                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors ${
                                                                user.is_banned
                                                                    ? 'bg-green-600 hover:bg-green-700'
                                                                    : 'bg-red-600 hover:bg-red-700'
                                                            }`}
                                                        >
                                                            {user.is_banned ? 'Unban' : 'Ban'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 bg-white hover:bg-[#faf7f0] disabled:opacity-50 transition-colors"
                    >
                        &lt;
                    </button>
                    
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                p === page 
                                    ? 'bg-[#8c6b29] text-white border-transparent shadow-md' 
                                    : 'bg-white border border-[#e5d8c0] text-[#8b8478] hover:bg-[#faf7f0]'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    
                    <button 
                        disabled={page === meta.last_page}
                        onClick={() => setPage(p => p + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e5d8c0] text-gray-500 bg-white hover:bg-[#faf7f0] disabled:opacity-50 transition-colors"
                    >
                        &gt;
                    </button>
                </div>
            )}

            {/* Modals */}
            <UserDetailModal user={selectedUser} isOpen={showDetail} onClose={() => setShowDetail(false)} />
            
            {/* onRefresh memanggil handleRefreshData agar Data & Tabel update bareng */}
            <BanModal user={selectedUser} isOpen={showBan} onClose={() => setShowBan(false)} onRefresh={handleRefreshData} />
            <AppealModal user={selectedAppealUser} isOpen={showAppeal} onClose={() => setShowAppeal(false)} onRefresh={handleRefreshData} />
        </div>
    );
};

export default ManageUsers;
