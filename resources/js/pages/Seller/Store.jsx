import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SellerStore = () => {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ nama_toko: '', deskripsi: '' });
    const [previewFoto, setPreviewFoto] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => { loadStore(); }, []);

    const loadStore = async () => {
        try {
            const { data } = await api.get('/seller/store');
            const d = data.data;
            setForm({ nama_toko: d.nama_toko || '', deskripsi: d.deskripsi || '' });
            setPreviewFoto(d.foto_toko || null);
        } catch { toast.error('Gagal memuat toko.'); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.keys(form).forEach(k => { if (form[k] !== null && form[k] !== '') fd.append(k, form[k]); });
        if (fotoFile) fd.append('foto_toko', fotoFile);

        try {
            await api.post('/seller/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Toko diperbarui.');
            setEditing(false);
            loadStore();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui.');
        }
    };

    if (loading) return <div className="py-20 text-center">Memuat...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Profil Toko</h2>
                <button onClick={() => setEditing(!editing)}
                    className="px-4 py-2 bg-[#C5A065] text-white rounded-lg text-sm">
                    {editing ? 'Batal' : 'Edit Toko'}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden mb-2">
                            {previewFoto ? (
                                <img src={previewFoto} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                                    🏪
                                </div>
                            )}
                        </div>
                        {editing && (
                            <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                                Ubah Foto
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Nama Toko</label>
                            <input name="nama_toko" value={form.nama_toko} onChange={handleChange}
                                disabled={!editing}
                                className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Deskripsi</label>
                            <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange}
                                disabled={!editing} rows={3}
                                className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
                        </div>
                    </div>
                    {editing && (
                        <div className="mt-6 text-right">
                            <button type="submit" className="px-6 py-2 bg-[#C5A065] text-white rounded-lg">
                                Simpan
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SellerStore;