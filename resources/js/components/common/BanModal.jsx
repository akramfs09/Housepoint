import { useState } from 'react';
import api from '../../services/api';

const BanModal = ({ user, isOpen, onClose, onRefresh }) => {
    const [alasan, setAlasan] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleAction = async () => {
        setLoading(true);
        try {
            if (user.is_banned) {
                await api.patch(`/admin/users/${user.id}/unban`);
            } else {
                if (!alasan.trim()) { alert('Alasan wajib diisi.'); setLoading(false); return; }
                await api.patch(`/admin/users/${user.id}/ban`, { alasan });
            }
            onClose();
            onRefresh();
        } catch (err) { alert(err.response?.data?.message || 'Gagal'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">{user.is_banned ? 'Aktifkan User' : 'Nonaktifkan User'}</h3>
                <p className="text-sm text-[#8b8478] mb-4">User: {user.name} ({user.email})</p>
                {!user.is_banned && (
                    <textarea value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Alasan penonaktifan..." className="w-full border rounded-lg px-3 py-2 text-sm mb-4" rows="3" required />
                )}
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg">Batal</button>
                    <button onClick={handleAction} disabled={loading} className={`px-4 py-2 text-sm text-white rounded-lg ${user.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        {loading ? 'Memproses...' : user.is_banned ? 'Aktifkan' : 'Nonaktifkan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BanModal;