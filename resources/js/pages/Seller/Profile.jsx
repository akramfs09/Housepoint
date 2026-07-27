import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ➕ Diimpor untuk navigasi state
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Mail, Bell, CheckCircle2 } from 'lucide-react';

const SellerProfile = () => {
    const navigate = useNavigate(); // ➕ Inisialisasi hook navigate
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    
    // 🌟 Ditambahkan field 'jenis_kelamin' sesuai dengan mockup gambar
    const [form, setForm] = useState({
        name: '', 
        email: '', 
        nama_lengkap: '', 
        no_hp: '', 
        jenis_kelamin: 'Laki - Laki',
        alamat: '', 
        kota: 'DIY'
    });
    const [previewFoto, setPreviewFoto] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);
    const [showSizeModal, setShowSizeModal] = useState(false);

    const [activities, setActivities] = useState([]);

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
                jenis_kelamin: d.jenis_kelamin || 'Laki - Laki',
                alamat: d.alamat || '', 
                kota: d.kota || 'DIY'
            });
            setPreviewFoto(d.foto_profil || null);
            setActivities(d.activities || []);
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
            if (file.size > 10 * 1024 * 1024) {
                setShowSizeModal(true);
                e.target.value = '';
                return;
            }
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

    // ➕ Fungsi handler untuk mengirim state ke halaman properti seller
    const handleJualPropertiClick = () => {
        navigate('/seller/properties', { state: { activeTab: 'upload' } });
    };

    if (loading) return <div className="py-20 text-center text-gray-500">Memuat...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto text-left font-sans px-4 py-6 bg-[#FCF9F4] min-h-screen">
            {/* MODAL POP-UP UKURAN FILE TERLALU BESAR */}
            {showSizeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] transition-all duration-300 animate-fade-in">
                    <div className="w-[90%] max-w-[400px] bg-white rounded-3xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-red-100 flex flex-col items-center justify-center relative transform scale-100 animate-pop-up">
                        <button 
                            onClick={() => setShowSizeModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-sm">
                            ✕
                        </button>
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Ukuran File Terlalu Besar</h2>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] leading-relaxed mb-6">
                            Ukuran foto yang Anda pilih melebihi batas maksimal <strong>10 MB</strong>. Silakan pilih foto lain yang berukuran lebih kecil.
                        </p>
                        <button
                            onClick={() => setShowSizeModal(false)}
                            className="w-full py-3 bg-[#C5A065] hover:bg-[#b08a4e] text-white rounded-xl text-sm font-bold shadow-md transition"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}

            {/* Grid Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-8">
                
                {/* CARD KIRI-TENGAH: INFORMASI PROFIL */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-md font-bold text-[#1A1A1A]">Informasi Profil</h2>
                        <button
                            type="button"
                            onClick={() => { if (editing) loadProfile(); setEditing(!editing); }}
                            className="px-4 py-1.5 border border-[#C5A065] text-[#C5A065] text-xs font-semibold rounded-lg hover:bg-[#FAF6EE] transition"
                        >
                            {editing ? 'Batal' : 'Edit Profil'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
                        {/* Sisi Kiri: Avatar & Status Agen */}
                        <div className="flex flex-col items-center shrink-0 w-full md:w-44 text-center">
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mb-4">
                                {previewFoto ? (
                                    <img src={previewFoto} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#EAE4DB] text-2xl font-bold text-[#C5A065]">
                                        {form.nama_lengkap?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Status Terverifikasi Agen (Sesuai Gambar) */}
                            <div className="flex items-center gap-1.5 px-4 py-1 bg-[#E8F7F0] text-[#10B981] rounded-full border border-[#D1FAE5] mb-4 text-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                                Verifikasi Agen
                            </div>

                            <label className="cursor-pointer border border-[#C5A065] rounded-xl px-4 py-1.5 text-xs font-semibold text-[#C5A065] hover:bg-[#FAF6EE] transition flex items-center gap-1">
                                Ubah Foto
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                            <p className="text-[11px] text-gray-400 mt-1.5">Maks. 10 MB (JPG, PNG, WEBP)</p>
                        </div>

                        {/* Sisi Kanan: Form Input Fields Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    name="nama_lengkap" 
                                    disabled={!editing} 
                                    value={form.nama_lengkap} 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FCFBF9] border border-[#F1ECE4] rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-[#C5A065] disabled:opacity-90" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Email</label>
                                <input 
                                    type="type" 
                                    name="email" 
                                    disabled={!editing} 
                                    value={form.email} 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FCFBF9] border border-[#F1ECE4] rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-[#C5A065] disabled:opacity-90" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">No. Telepon</label>
                                <input 
                                    type="text" 
                                    name="no_hp" 
                                    disabled={!editing} 
                                    value={form.no_hp} 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FCFBF9] border border-[#F1ECE4] rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-[#C5A065] disabled:opacity-90" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Jenis Kelamin</label>
                                <select 
                                    name="jenis_kelamin" 
                                    disabled={!editing} 
                                    value={form.jenis_kelamin} 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FCFBF9] border border-[#F1ECE4] rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-[#C5A065] disabled:opacity-90 appearance-none"
                                >
                                    <option value="Laki - Laki">Laki - Laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Alamat</label>
                                <input 
                                    type="text" 
                                    name="alamat" 
                                    disabled={!editing} 
                                    value={form.alamat} 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FCFBF9] border border-[#F1ECE4] rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-[#C5A065] disabled:opacity-90" 
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Kota</label>
                                <input 
                                    type="text" 
                                    name="kota" 
                                    disabled={!editing} 
                                    value={form.kota} 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FCFBF9] border border-[#F1ECE4] rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-[#C5A065] disabled:opacity-90 w-1/2" 
                                />
                            </div>

                            {editing && (
                                <div className="md:col-span-2 text-right pt-2">
                                    <button type="submit" className="px-5 py-2 bg-[#C5A065] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#b08d55] transition">
                                        Simpan Perubahan
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* CARD KANAN: BANNER JUAL PROPERTI (SUDAH JADI AGEN) */}
                <div className="lg:col-span-1 h-full">
                    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white p-4 h-full flex flex-col justify-between min-h-[340px]">
                        {/* Background Mockup Image Effect */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-10 filter grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80')` }}></div>
                        
                        <div className="relative z-10 p-2">
                            <h3 className="font-bold text-xl text-gray-800 leading-snug mb-2">Jual Properti Lebih Mudah</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Mulai jual properti dan kelola listing Anda sendiri dengan tools profesional kami.</p>
                        </div>
                        
                        <div className="relative z-10 p-2">
                            {/* 🛠️ PERBAIKAN LOGIK: Diubah dari <a> menjadi <button> dengan handler onClick */}
                            <button 
                                onClick={handleJualPropertiClick} 
                                className="block w-full bg-[#C5A065] text-white py-3 rounded-xl text-xs font-bold shadow-md hover:bg-[#b08d55] text-center transition"
                            >
                                Jual Properti
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* SEKSYEN BAWAH: AKTIVITAS TERBARU */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-800">Aktivitas Terbaru</h3>
                    
                </div>
                
                <div className="space-y-2">
                    {activities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FCFBF9] border border-[#F1ECE4] text-[#C5A065] shrink-0">
                                    {act.type === 'view' && <span>👁️</span>}
                                    {act.type === 'favorite' && <span>❤️</span>}
                                    {act.type === 'contact' && <span>📞</span>}
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-gray-800">
                                        {act.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{act.desc}</p>
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