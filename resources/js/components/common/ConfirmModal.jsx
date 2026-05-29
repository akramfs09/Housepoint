const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Konfirmasi', confirmColor = 'bg-red-600', onConfirm, onCancel, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-2">{title}</h3>
                <p className="text-sm text-[#8b8478] mb-4">{message}</p>
                {children}
                <div className="flex gap-3 justify-end mt-4">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-[#5a554c] hover:bg-gray-50 transition">Batal</button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition ${confirmColor}`}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;