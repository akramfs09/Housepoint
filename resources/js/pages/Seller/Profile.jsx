import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Eye, Heart, MessageSquare } from 'lucide-react';

const SellerProfile = () => {
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    
    const [form, setForm] = useState({
        name: '', email: '', nama_lengkap: '', no_hp: '', alamat: '', jenis_kelamin: '', kota: ''
    });
    const [previewFoto, setPreviewFoto] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);

    // Data Aktivitas Terbaru sesuai dengan yang tertera di image_962241.png
    const [activities] = useState([
        { id: 1, type: 'view', title: 'Melihat Menteng Royal Villa', desc: 'Terakhir dilihat 2 jam yang lalu • Jakarta Pusat' },
        { id: 2, type: 'favorite', title: 'Menyimpan Favorit: Kemang Residence', desc: 'Kemarin • Jakarta Selatan' },
        { id: 3, type: 'contact', title: 'Menghubungi Agen Budi Santoso', desc: '2 hari yang lalu • Terkait: Pondok Indah Suites' }
    ]);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const { data } = await api.get('/seller/profile');
            const d = data.data;
            setForm({
                name: d.name || '', 
                email: d.email || '',
                nama_lengkap: d.nama_lengkap || '', 
                no_hp: d.no_hp || '',
                alamat: d.alamat || '', 
                jenis_kelamin: d.jenis_kelamin || '',
                kota: d.kota || 'DIY'
            });
            setPreviewFoto(d.foto_profil || null);
        } catch { 
            toast.error('Gagal memuat profil.'); 
        } finally { 
            setLoading(false); 
        }
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
            await api.post('/seller/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Profil diperbarui.');
            setEditing(false);
            refreshUser();
            loadProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui.');
        }
    };

    if (loading) return <div className="py-20 text-center text-gray-500">Memuat...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 bg-[#FAF6EE] min-h-screen text-left text-[#2c2c2c]">
            
            {/* Header Judul Halaman */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
                    <p className="text-xs text-gray-400 mt-1">Kelola informasi akun dan aktivitas Anda.</p>
                </div>
                {/* Icon shortcut Mail & Bell di sudut kanan atas */}
                <div className="flex items-center gap-2">
                    <button className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:bg-gray-50">
                        <MessageSquare size={16} />
                    </button>
                    <button className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:bg-gray-50">
                        <Eye size={16} />
                    </button>
                </div>
            </div>

            {/* Grid Informasi Utama (2 Kolom: Form Profil & Banner Iklan) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-8">
                
                {/* BOX KIRI & TENGAH: FORM INFORMASI PROFIL */}
                <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-gray-800">Informasi Profil</h2>
                        <button
                            type="button"
                            onClick={() => { if (editing) loadProfile(); setEditing(!editing); }}
                            className="px-3 py-1.5 border border-[#e5d8c0] text-amber-600 text-xs font-semibold rounded-xl hover:bg-amber-50/50 transition"
                        >
                            ✏️ {editing ? 'Batal' : 'Edit Profil'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Area Foto Avatar & Status Verifikasi */}
                        <div className="flex flex-col items-center justify-center pb-2">
                            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-100 mb-3 shadow-inner">
                                <img src={previewFoto || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Profile" />
                            </div>
                            
                            <div className="mb-3">
                                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-medium bg-[#E8F7F0] text-[#10B981] border border-[#A7F3D0]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                                    Verifikasi Agen
                                </div>
                            </div>

                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 border border-[#D3A25D] rounded-xl text-xs font-medium text-[#D3A25D] hover:bg-[#FAF6EE] transition">
                                📷 Ubah Foto
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Nama Lengkap</label>
                                <input type="text" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} disabled={!editing} className="w-full bg-[#FAF6EE]/40 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#D3A25D] disabled:bg-[#FAF6EE]/20" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Email</label>
                                <input type="email" value={form.email} disabled className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-[#FAF6EE]/20 text-gray-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">No. Telepon</label>
                                <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} disabled={!editing} className="w-full bg-[#FAF6EE]/40 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#D3A25D] disabled:bg-[#FAF6EE]/20" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Jenis Kelamin</label>
                                <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} disabled={!editing} className="w-full bg-[#FAF6EE]/40 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#D3A25D] disabled:bg-[#FAF6EE]/20">
                                    <option value="L">Laki - Laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Alamat</label>
                                <textarea name="alamat" value={form.alamat} onChange={handleChange} disabled={!editing} rows={2} className="w-full bg-[#FAF6EE]/40 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none resize-none focus:border-[#D3A25D] disabled:bg-[#FAF6EE]/20" />
                            </div>
                            <div className="sm:col-span-1">
                                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Kota</label>
                                <input type="text" name="kota" value={form.kota} onChange={handleChange} disabled={!editing} className="w-full bg-[#FAF6EE]/40 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#D3A25D] disabled:bg-[#FAF6EE]/20" />
                            </div>
                        </div>

                        {editing && (
                            <div className="text-right pt-2">
                                <button type="submit" className="px-5 py-2 bg-[#D3A25D] text-white text-xs font-bold rounded-xl shadow-sm transition">
                                    Simpan Perubahan
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* BOX KANAN: BANNER IKLAN PROMOSI VERTIKAL */}
                <div className="md:col-span-1 h-full">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between h-full min-h-[410px] relative overflow-hidden shadow-sm"
                         style={{ backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.75)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div className="space-y-2 z-10 pt-4">
                            <h3 className="font-black text-xl text-gray-800 leading-tight">Jual Properti Lebih Mudah</h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed">Mulai jual properti dan kelola listing Anda sendiri dengan tools profesional kami.</p>
                        </div>
                        <div className="z-10">
                            <button className="w-full bg-[#D3A25D] text-white py-3 rounded-xl text-xs font-bold shadow-sm hover:bg-[#b88948] transition">
                                Jual Properti
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* SEKSYEN BAWAH: AKTIVITAS TERBARU */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-sm text-gray-800">Aktivitas Terbaru</h3>
                    <button className="text-[#D3A25D] text-xs font-medium hover:underline">Lihat Semua</button>
                </div>
                
                <div className="space-y-3">
                    {activities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-gray-50 transition border border-gray-100 shadow-sm cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FAF6EE]">
                                    {act.type === 'view' && <Eye size={16} className="text-[#D3A25D]" />}
                                    {act.type === 'favorite' && <Heart size={16} className="text-[#D3A25D]" />}
                                    {act.type === 'contact' && <MessageSquare size={16} className="text-[#D3A25D]" />}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800">
                                        {act.title.includes("Menteng") ? <>Melihat <span className="text-[#B38A4B]">Menteng Royal Villa</span></> : 
                                         act.title.includes("Kemang") ? <>Menyimpan Favorit: <span className="text-[#B38A4B]">Kemang Residence</span></> : 
                                         <>Menghubungi Agen <span className="text-[#B38A4B]">Budi Santoso</span></>}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{act.desc}</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default SellerProfile;