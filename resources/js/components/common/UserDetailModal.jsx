const UserDetailModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#2c2c2c]">Detail Pengguna</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div className="space-y-2 text-sm">
                    <p><strong>Nama:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Status:</strong> {user.is_banned ? '🔴 Banned' : '🟢 Aktif'}</p>
                    <p><strong>Tanggal Daftar:</strong> {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                    {user.role === 'seller' && (
                        <>
                            <p><strong>Apply Count:</strong> {user.apply_count ?? '-'}</p>
                            {user.ban_history?.length > 0 && (
                                <div>
                                    <p className="font-semibold mt-2">Riwayat Ban:</p>
                                    {user.ban_history.map((log, i) => (
                                        <p key={i} className="text-xs text-gray-500">- {log.alasan} ({new Date(log.banned_at).toLocaleDateString('id-ID')})</p>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;