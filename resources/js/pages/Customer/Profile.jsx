import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const CustomerProfile = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', nama_lengkap: '', no_hp: '',
        alamat: '', tanggal_lahir: '', jenis_kelamin: '', pekerjaan: '',
    });
    const [previewFoto, setPreviewFoto] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const { data } = await api.get('/customer/profile');
            const d = data.data;
            setForm({
                name: d.name || '', email: d.email || '',
                nama_lengkap: d.nama_lengkap || '', no_hp: d.no_hp || '',
                alamat: d.alamat || '', tanggal_lahir: d.tanggal_lahir || '',
                jenis_kelamin: d.jenis_kelamin || '', pekerjaan: d.pekerjaan || '',
            });
            setPreviewFoto(d.foto_profil || null);
        } catch { toast.error('Gagal memuat profil.'); }
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
        if (fotoFile) fd.append('foto_profil', fotoFile);

        try {
            await api.post('/customer/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Profil diperbarui.');
            setEditing(false);
            refreshUser();
            loadProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui.');
        }
    };

    if (loading) return <div className="py-20 text-center">Memuat...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#2c2c2c]">Profil Saya</h1>
                <p className="text-sm text-gray-500">Kelola informasi akun dan aktivitas Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Informasi Profil */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Informasi Profil</h2>
                            <button
                                onClick={() => setEditing(!editing)}
                                className="px-4 py-2 bg-[#C5A065] text-white rounded-lg text-sm"
                            >
                                {editing ? 'Batal' : 'Edit Profil'}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Foto */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-2 border-2 border-[#e5d8c0]">
                                    {previewFoto ? (
                                        <img src={previewFoto} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                                            {form.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                {editing && (
                                    <label className="cursor-pointer text-sm text-[#C5A065] hover:underline flex items-center gap-1">
                                        📷 Ubah Foto
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
                                    <input name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange}
                                        disabled={!editing}
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <input value={form.email} disabled
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">No. Telepon</label>
                                    <input name="no_hp" value={form.no_hp} onChange={handleChange}
                                        disabled={!editing}
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Jenis Kelamin</label>
                                    <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange}
                                        disabled={!editing}
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100">
                                        <option value="">Pilih</option>
                                        <option value="L">Laki - Laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600">Alamat</label>
                                    <textarea name="alamat" value={form.alamat} onChange={handleChange}
                                        disabled={!editing} rows={2}
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Tanggal Lahir</label>
                                    <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange}
                                        disabled={!editing}
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Pekerjaan</label>
                                    <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange}
                                        disabled={!editing}
                                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
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

                {/* Kolom Kanan: Banner Promosi */}
                <div className="lg:col-span-1">
                    <div className="bg-cover bg-center rounded-2xl overflow-hidden relative h-64"
                         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4db42?w=600')" }}>
                        <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-center">
                            <h3 className="text-white text-xl font-bold mb-2">Upgrade Menjadi Agen</h3>
                            <p className="text-white/80 text-sm mb-4">Mulai jual properti dan kelola listing Anda sendiri dengan tools profesional kami.</p>
                            <a href="/customer/become-seller" className="bg-[#C5A065] text-white px-4 py-2 rounded-lg text-sm self-start">
                                Upgrade ke Agen
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;