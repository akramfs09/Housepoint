const RejectionHistoryModal = ({ isOpen, onClose, history }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">📋 Riwayat Penolakan</h3>

                {history.length === 0 ? (
                    <p className="text-sm text-[#8b8478]">Belum ada riwayat penolakan.</p>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {history.map((item, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{item.alasan}</p>
                                <p className="text-red-400 text-xs mt-1">
                                    Ditolak oleh: {item.rejected_by || 'Admin'}
                                </p>
                                <p className="text-red-400 text-xs mt-1">
                                    {new Date(item.rejected_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-[#5a554c] hover:bg-gray-50 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionHistoryModal;