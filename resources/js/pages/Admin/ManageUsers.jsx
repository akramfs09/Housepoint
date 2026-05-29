import { useState, useEffect } from 'react';
import api from '../../services/api';
import UserDetailModal from '../../components/common/UserDetailModal';
import BanModal from '../../components/common/BanModal';
import AppealModal from '../../components/common/AppealModal';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showBan, setShowBan] = useState(false);
    const [showAppeal, setShowAppeal] = useState(false);
    const [selectedAppealUser, setSelectedAppealUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20, search };

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

    const tabs = [
        { key: 'all', label: 'Semua' },
        { key: 'customer', label: 'Customer' },
        { key: 'seller', label: 'Seller' },
        { key: 'appeal', label: '🔔 Banding' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2c2c2c]">👥 Kelola User</h2>
            <p className="text-sm text-[#8b8478]">Kelola semua pengguna HousePoint</p>

            <div className="flex gap-2 border-b border-[#e5d8c0] pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setPage(1); }}
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

            <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm"
            />

            <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#faf7f0] text-[#8b8478]">
                        <tr>
                            <th className="p-4 text-left">Nama</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Role</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Apply Count</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada data.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="border-t border-[#e5d8c0]">
                                    <td
                                        className="p-4 font-medium text-[#2c2c2c] cursor-pointer hover:text-[#C5A065]"
                                        onClick={() => { setSelectedUser(user); setShowDetail(true); }}
                                    >
                                        {user.name}
                                    </td>
                                    <td className="p-4 text-[#5a554c]">{user.email}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{user.role}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {user.is_banned ? '🔴 Banned' : '🟢 Aktif'}
                                        </span>
                                    </td>
                                    <td className="p-4">{user.apply_count ?? '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        {user.is_banned ? (
                                            <button onClick={() => { setSelectedUser(user); setShowBan(true); }} className="text-green-600 hover:underline text-xs">Unban</button>
                                        ) : (
                                            <button onClick={() => { setSelectedUser(user); setShowBan(true); }} className="text-red-600 hover:underline text-xs">Ban</button>
                                        )}
                                        {activeTab === 'appeal' && (
                                            <button onClick={() => { setSelectedAppealUser(user); setShowAppeal(true); }} className="text-yellow-600 hover:underline text-xs">Review Banding</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {meta && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-lg text-sm ${p === page ? 'bg-[#C5A065] text-white' : 'bg-white border text-[#5a554c]'}`}>{p}</button>
                    ))}
                </div>
            )}

            <UserDetailModal user={selectedUser} isOpen={showDetail} onClose={() => setShowDetail(false)} />
            <BanModal user={selectedUser} isOpen={showBan} onClose={() => setShowBan(false)} onRefresh={fetchUsers} />
            <AppealModal user={selectedAppealUser} isOpen={showAppeal} onClose={() => setShowAppeal(false)} onRefresh={fetchUsers} />
        </div>
    );
};

export default ManageUsers;