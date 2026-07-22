import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Building2, Edit2, Camera, User, FileText, CheckCircle2, X } from 'lucide-react';

const SellerAgen = () => {
    const [form, setForm] = useState({ nama_agen: '', deskripsi: '' });
    const [fotoFile, setFotoFile] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAgen();
    }, []);

    const loadAgen = async () => {
        try {
            const { data } = await api.get('/seller/agen');
            const d = data.data || data;
            setForm({ nama_agen: d.nama_agen || '', deskripsi: d.deskripsi || '' });
            setPreviewFoto(d.foto_agen || null);
        } catch {
            toast.error('Gagal memuat profil agen.');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData();
        fd.append('nama_agen', form.nama_agen);
        fd.append('deskripsi', form.deskripsi);
        if (fotoFile) fd.append('foto_agen', fotoFile);

        try {
            await api.post('/seller/agen', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Profil agen berhasil diperbarui.');
            setEditing(false);
            loadAgen();
        } catch {
            toast.error('Gagal memperbarui profil agen.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2A2621] tracking-tight"></h2>
                    <p className="text-sm text-[#9C9487] mt-1"></p>
                </div>
                
                <button
                    onClick={() => {
                        if (editing) loadAgen(); // Reset perubahan jika batal
                        setEditing(!editing);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                        editing 
                            ? 'bg-[#FBF3E9] text-[#2A2621] border border-[#EBE3D5] hover:bg-[#F0E6D8]'
                            : 'bg-[#D4A44C] text-white hover:bg-[#C2933B] shadow-sm shadow-[#D4A44C]/20'
                    }`}
                >
                    {editing ? (
                        <><X className="w-4 h-4" /> Batal Edit</>
                    ) : (
                        <><Edit2 className="w-4 h-4" /> Edit Profil</>
                    )}
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#F0E6D8] shadow-[0_8px_30px_rgba(139,115,85,0.04)]">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">
                    
                    {/* BAGIAN FOTO KIRI */}
                    <div className="flex flex-col items-center space-y-4 md:w-1/3 shrink-0">
                        <div className="relative group w-48 h-48">
                            <div className={`w-full h-full rounded-[2rem] overflow-hidden bg-[#FBF3E9] flex items-center justify-center transition-all ${editing ? 'border-2 border-[#D4A44C] border-dashed' : 'border border-transparent shadow-sm'}`}>
                                {previewFoto ? (
                                    <img src={previewFoto} alt="Foto Agen" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-16 h-16 text-[#D4A44C] opacity-40" />
                                )}
                            </div>

                            {/* Tombol Upload Overlay (hanya muncul saat editing) */}
                            {editing && (
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-[2rem] cursor-pointer transition-opacity backdrop-blur-sm">
                                    <Camera className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-semibold">Ubah Foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        
                        {editing && (
                            <p className="text-[11px] text-[#9C9487] text-center px-4">
                                Format: JPG, PNG. Ukuran maksimal 2MB. Rasio 1:1 disarankan.
                            </p>
                        )}
                        {!editing && previewFoto && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F8F5] text-[#2E7D32] rounded-full text-xs font-semibold border border-[#EAF6EB]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Foto Aktif
                            </div>
                        )}
                    </div>

                    {/* BAGIAN FORM KANAN */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-[#4A433A] mb-2">
                                <User className="w-4 h-4 text-[#D4A44C]" />
                                Nama Agen / Perusahaan
                            </label>
                            <input
                                name="nama_agen"
                                value={form.nama_agen}
                                onChange={handleChange}
                                disabled={!editing}
                                placeholder="Masukkan nama agen properti Anda..."
                                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A44C]/20 ${
                                    editing 
                                        ? 'bg-white border-[#EBE3D5] text-[#2A2621] focus:border-[#D4A44C]' 
                                        : 'bg-[#FAF8F5] border-transparent text-[#6B6255] cursor-not-allowed'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-[#4A433A] mb-2">
                                <FileText className="w-4 h-4 text-[#D4A44C]" />
                                Deskripsi Tentang Agen
                            </label>
                            <textarea
                                name="deskripsi"
                                value={form.deskripsi}
                                onChange={handleChange}
                                disabled={!editing}
                                rows="5"
                                placeholder="Ceritakan pengalaman, fokus area, dan keunggulan agen Anda..."
                                className={`w-full border rounded-xl px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A44C]/20 resize-none ${
                                    editing 
                                        ? 'bg-white border-[#EBE3D5] text-[#2A2621] focus:border-[#D4A44C]' 
                                        : 'bg-[#FAF8F5] border-transparent text-[#6B6255] cursor-not-allowed'
                                }`}
                            />
                        </div>

                        {editing && (
                            <div className="pt-4 border-t border-[#F0E6D8] flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-[#D4A44C] text-white font-bold text-sm hover:bg-[#C2933B] transition-colors shadow-sm shadow-[#D4A44C]/20 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellerAgen;
