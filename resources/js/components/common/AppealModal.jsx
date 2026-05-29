import { useState, useEffect } from 'react';
import api from '../../services/api';

const AppealModal = ({ user, isOpen, onClose, onRefresh }) => {
    const [appeal, setAppeal] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false); // 🆕 state untuk loading data

    useEffect(() => {
        if (user && isOpen) {
            // 🆕 reset dulu sebelum fetch
            setAppeal(null);
            setFetching(true);
            api.get(`/admin/seller/appeals`, { params: { user_id: user.id, status: 'pending', per_page: 1 } })
                .then(res => {
                    const pending = res.data?.data?.[0] || null;
                    setAppeal(pending);
                })
                .catch(() => setAppeal(null))
                .finally(() => setFetching(false));
        }
    }, [user, isOpen]);

    // 🆕 tetap render modal meskipun appeal null, tapi jangan return null saat isOpen true
    if (!isOpen) return null;

    const handleAction = async (action) => {
        setLoading(true);
        try {
            if (action === 'approve') {
                await api.patch(`/admin/seller/appeals/${appeal.id}/approve`);
            } else {
                await api.patch(`/admin/seller/appeals/${appeal.id}/reject`, { catatan_internal: catatan });
            }
            onClose();
            onRefresh();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#2c2c2c]">Review Banding Seller</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {fetching ? (
                    <div className="text-center py-8 text-gray-400">Mencari data banding...</div>
                ) : !appeal ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>❌ Tidak ada banding pending untuk pengguna ini.</p>
                        <p className="text-xs mt-2">Banding mungkin sudah ditinjau atau belum diajukan.</p>
                    </div>
                ) : (
                    <div className="space-y-3 text-sm">
                        <p><strong>Nama:</strong> {user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Apply Count:</strong> {user?.apply_count ?? '-'}</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-semibold">Alasan Banding:</p>
                            <p className="text-gray-600">{appeal.alasan}</p>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Catatan Internal (opsional):</label>
                            <textarea
                                value={catatan}
                                onChange={e => setCatatan(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                rows="2"
                                placeholder="Catatan untuk admin lain..."
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg">Tutup</button>
                            <button onClick={() => handleAction('reject')} disabled={loading} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Tolak Banding</button>
                            <button onClick={() => handleAction('approve')} disabled={loading} className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">Setujui Banding</button>
                        </div>
                    </div>
                )}

                {/* Tombol Tutup selalu ada */}
                {!appeal && (
                    <div className="flex justify-end mt-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg">Tutup</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppealModal;