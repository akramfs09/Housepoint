import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Eye, Heart, MessageCircle, Clock, User, Phone, MapPin, Building } from 'lucide-react';

const CustomerProfile = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', nama_lengkap: '', no_hp: '',
        alamat: '', tanggal_lahir: '', jenis_kelamin: '', pekerjaan: '',
        kota: '',
    });
    const [previewFoto, setPreviewFoto] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);
    const [activities, setActivities] = useState([]);

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
                kota: d.kota || 'DIY',
            });
            setPreviewFoto(d.foto_profil || null);
            setActivities(d.activities || []);
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

    const getActivityIcon = (type) => {
        switch(type) {
            case 'view': return <Eye size={16} className="text-blue-500" />;
            case 'favorite': return <Heart size={16} className="text-red-500" />;
            case 'chat': return <MessageCircle size={16} className="text-green-500" />;
            default: return <Clock size={16} className="text-gray-500" />;
        }
    };

    if (loading) return <div className="py-20 text-center">Memuat...</div>;

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Informasi Profil */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#e5d8c0] p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Informasi Profil</h2>
                            <button
                                onClick={() => setEditing(!editing)}
                                className="px-4 py-2 bg-[#C5A065] text-white rounded-lg text-sm hover:bg-[#b08a4e] transition"
                            >
                                {editing ? 'Batal' : 'Edit Profil'}
                            </button>
                        </div>

                        {!editing ? (
                            // Tampilan informasi (sesuai gambar)
                            <div className="flex flex-col items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-[#e5d8c0] flex-shrink-0">
                                        {previewFoto ? (
                                            <img src={previewFoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                                                {form.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Ubah Foto</div>
                                    </div>
                                </div>
                                <div className="w-full space-y-3">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Nama Lengkap</div>
                                        <div className="text-base font-semibold text-[#2c2c2c]">{form.nama_lengkap || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">No. Telepon</div>
                                        <div className="text-base text-[#2c2c2c]">{form.no_hp || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Alamat</div>
                                        <div className="text-base text-[#2c2c2c]">{form.alamat || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Kota</div>
                                        <div className="text-base text-[#2c2c2c]">{form.kota || 'DIY'}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Mode edit: form
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-2 border-2 border-[#e5d8c0]">
                                        {previewFoto ? (
                                            <img src={previewFoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                                                {form.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer text-sm text-[#C5A065] hover:underline flex items-center gap-1">
                                        📷 Ubah Foto
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
                                        <input name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange}
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Email</label>
                                        <input value={form.email} disabled
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1 bg-gray-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">No. Telepon</label>
                                        <input name="no_hp" value={form.no_hp} onChange={handleChange}
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Jenis Kelamin</label>
                                        <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange}
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1">
                                            <option value="">Pilih</option>
                                            <option value="L">Laki - Laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-600">Alamat</label>
                                        <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={2}
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Tanggal Lahir</label>
                                        <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange}
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Pekerjaan</label>
                                        <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange}
                                            className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                </div>
                                <div className="mt-6 text-right">
                                    <button type="submit" className="px-6 py-2 bg-[#C5A065] text-white rounded-lg hover:bg-[#b08a4e] transition">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Upgrade ke Agen */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-[#f5efe6] to-[#e5d8c0] rounded-2xl p-6 border border-[#e5d8c0] shadow-sm h-full flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">Upgrade Menjadi Agen</h3>
                        <p className="text-sm text-gray-600 mb-4">Mulai jual properti dan kelola listing Anda sendiri dengan tools profesional kami.</p>
                        <a href="/customer/become-seller" className="bg-[#C5A065] text-white px-4 py-2 rounded-lg text-sm self-start hover:bg-[#b08a4e] transition">
                            Upgrade ke Agen
                        </a>
                    </div>
                </div>
            </div>

            {/* Aktivitas Terbaru */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e5d8c0] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Aktivitas Terbaru</h2>
                    <a href="#" className="text-sm text-[#C5A065] hover:underline">Lihat Semua</a>
                </div>
                <div className="divide-y divide-gray-100">
                    {activities.map((act) => (
                        <div key={act.id} className="flex items-start gap-3 py-3">
                            <div className="mt-1">
                                {getActivityIcon(act.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[#2c2c2c]">{act.title}</p>
                                <p className="text-xs text-gray-500">{act.time} • {act.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;