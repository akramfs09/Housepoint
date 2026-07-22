import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { 
    User, Mail, Phone, MapPin, Camera, 
    Shield, Eye, EyeOff, Trash2, Key, Check, X,
    Lock
} from 'lucide-react';

const SettingsPage = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    
    const [form, setForm] = useState({
        nama_lengkap: '',
        email: '',
        no_hp: '',
        jenis_kelamin: '',
        alamat: '',
        kota: 'DIY', // mock value matching mockup
    });

    const [previewFoto, setPreviewFoto] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        if (name === 'current_password') {
            setPasswordError('');
        }
    };

    const handleVerifyCurrentPassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.current_password) {
            setPasswordError('Masukkan kata sandi saat ini terlebih dahulu.');
            return;
        }

        setVerifyingPassword(true);
        setPasswordError('');
        try {
            await api.post('/auth/verify-password', {
                password: passwordForm.current_password,
            });
            toast.success('Kata sandi saat ini benar!');
            setIsCurrentPasswordVerified(true);
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Kata sandi saat ini salah.');
        } finally {
            setVerifyingPassword(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordForm.new_password.length < 8) {
            toast.error('Kata sandi baru minimal harus 8 karakter.');
            return;
        }

        setPasswordSaving(true);
        try {
            await api.patch('/auth/password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password,
            });
            toast.success('Kata sandi berhasil diperbarui.');
            setPasswordForm({ current_password: '', new_password: '' });
            setIsCurrentPasswordVerified(false); // Reset back to verification step
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui kata sandi.');
        } finally {
            setPasswordSaving(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const endpoint = user?.role === 'seller' ? '/seller/profile' : '/customer/profile';
            const { data } = await api.get(endpoint);
            const d = data.data;
            setForm({
                nama_lengkap: d.nama_lengkap || '',
                email: d.email || '',
                no_hp: d.no_hp || '',
                jenis_kelamin: d.jenis_kelamin || '',
                alamat: d.alamat || '',
                kota: d.kota || 'DIY',
            });
            setPreviewFoto(d.foto_profil || null);
        } catch {
            toast.error('Gagal memuat pengaturan akun.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 10MB.');
                return;
            }
            setFotoFile(file);
            setPreviewFoto(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData();
        
        // Append form fields
        fd.append('nama_lengkap', form.nama_lengkap);
        fd.append('no_hp', form.no_hp || '');
        fd.append('alamat', form.alamat || '');
        fd.append('jenis_kelamin', form.jenis_kelamin || '');
        
        if (fotoFile) {
            fd.append('foto_profil', fotoFile);
        }

        try {
            const endpoint = user?.role === 'seller' ? '/seller/profile' : '/customer/profile';
            await api.post(endpoint, fd, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            toast.success('Informasi akun berhasil diperbarui.');
            setEditing(false);
            refreshUser();
            loadSettings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui informasi akun.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 font-medium">
                Memuat pengaturan...
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-bold text-[#2c2c2c]">Pengaturan Akun</h1>
                <p className="text-[#8b7e66] text-sm mt-1">Kelola preferensi dan keamanan akun Anda</p>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* KOLOM KIRI: Informasi Akun & Keamanan */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* CARD 1: Informasi Akun */}
                    <div className="bg-white rounded-[20px] border border-[#f0ebe1] shadow-sm overflow-hidden p-6 transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[16px] font-bold text-[#2c2c2c]">Informasi Akun</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    if (editing) {
                                        loadSettings(); // reset form
                                    }
                                    setEditing(!editing);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    editing 
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                        : 'border border-[#D4AD5D] text-[#D4AD5D] hover:bg-[#D4AD5D]/5'
                                }`}
                            >
                                {editing ? (
                                    <>
                                        <X size={13} />
                                        Batal
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                                        </svg>
                                        Edit Profil
                                    </>
                                )}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AD5D] to-[#e6bd65] p-[2px] shadow-sm">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        {previewFoto ? (
                                            <img src={previewFoto} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[#D4AD5D] font-bold text-3xl">
                                                {form.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {editing && (
                                    <label className="cursor-pointer px-4 py-2 border border-[#D4AD5D] text-[#D4AD5D] hover:bg-[#D4AD5D]/5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 mt-3">
                                        <Camera size={14} />
                                        Ubah Foto
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* Inputs Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        value={form.nama_lengkap}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        required
                                        placeholder="Masukkan nama lengkap"
                                        className="w-full border border-[#f0ebe1] rounded-xl px-4 py-2.5 text-sm bg-[#faf7f0]/40 text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        disabled
                                        placeholder="email@example.com"
                                        className="w-full border border-[#f0ebe1] rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">No. Telepon</label>
                                    <input
                                        type="text"
                                        name="no_hp"
                                        value={form.no_hp}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="Masukkan no telepon"
                                        className="w-full border border-[#f0ebe1] rounded-xl px-4 py-2.5 text-sm bg-[#faf7f0]/40 text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jenis Kelamin</label>
                                    <select
                                        name="jenis_kelamin"
                                        value={form.jenis_kelamin}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        className="w-full border border-[#f0ebe1] rounded-xl px-4 py-2.5 text-sm bg-[#faf7f0]/40 text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D] transition-all disabled:opacity-75 disabled:cursor-not-allowed appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat' }}
                                    >
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="L">Laki - Laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Alamat</label>
                                    <input
                                        type="text"
                                        name="alamat"
                                        value={form.alamat}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="Masukkan alamat lengkap"
                                        className="w-full border border-[#f0ebe1] rounded-xl px-4 py-2.5 text-sm bg-[#faf7f0]/40 text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kota</label>
                                    <input
                                        type="text"
                                        name="kota"
                                        value={form.kota}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="Kota / Daerah"
                                        className="w-full border border-[#f0ebe1] rounded-xl px-4 py-2.5 text-sm bg-[#faf7f0]/40 text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            {editing && (
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#D4AD5D] hover:bg-[#b08e54] text-white text-sm font-bold rounded-xl shadow-md shadow-[#D4AD5D]/10 transition-all flex items-center gap-2"
                                    >
                                        {saving ? (
                                            'Menyimpan...'
                                        ) : (
                                            <>
                                                <Check size={16} />
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* CARD 2: Keamanan & Kata Sandi */}
                    <div className="bg-white rounded-[20px] border border-[#f0ebe1] shadow-sm overflow-hidden p-6 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-6 border-b border-[#f0ebe1] pb-4">
                            <Shield className="text-[#D4AD5D]" size={18} />
                            <h2 className="text-[16px] font-bold text-[#2c2c2c]">Keamanan & Kata Sandi</h2>
                        </div>

                        <form onSubmit={isCurrentPasswordVerified ? handlePasswordSubmit : handleVerifyCurrentPassword} className="space-y-5">
                            {/* Kata Sandi Saat Ini */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kata Sandi Saat Ini</label>
                                    {isCurrentPasswordVerified && (
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 font-bold tracking-wide">
                                            <Check size={10} strokeWidth={3} />
                                            TERVERIFIKASI
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="current_password"
                                        value={passwordForm.current_password}
                                        onChange={handlePasswordChange}
                                        required
                                        disabled={isCurrentPasswordVerified}
                                        placeholder="••••••••"
                                        className={`w-full border rounded-xl pl-4 pr-12 py-2.5 text-sm transition-all focus:outline-none ${
                                            isCurrentPasswordVerified 
                                                ? 'border-emerald-100 bg-emerald-50/20 text-emerald-700 cursor-not-allowed' 
                                                : 'border-[#f0ebe1] bg-[#faf7f0]/40 text-[#2c2c2c] focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D]'
                                        }`}
                                    />
                                    {!isCurrentPasswordVerified && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                                {passwordError && (
                                    <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            {/* Kata Sandi Baru - HANYA MUNCUL JIKA SUDAH TERVERIFIKASI */}
                            {isCurrentPasswordVerified ? (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kata Sandi Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="new_password"
                                            value={passwordForm.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                            className="w-full border border-[#f0ebe1] rounded-xl pl-4 pr-12 py-2.5 text-sm bg-[#faf7f0]/40 text-[#2c2c2c] focus:outline-none focus:border-[#D4AD5D] focus:ring-1 focus:ring-[#D4AD5D] transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1.5">Minimal 8 karakter, kombinasi huruf dan angka.</p>
                                </div>
                            ) : null}

                            {/* Submit Button */}
                            <div className="pt-2">
                                {isCurrentPasswordVerified ? (
                                    <button
                                        type="submit"
                                        disabled={passwordSaving}
                                        className="px-6 py-2.5 bg-[#D4AD5D] hover:bg-[#b08e54] text-white text-sm font-bold rounded-xl shadow-md shadow-[#D4AD5D]/10 transition-all disabled:opacity-50"
                                    >
                                        {passwordSaving ? 'Mengubah...' : 'Ganti Kata Sandi'}
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={verifyingPassword}
                                        className="px-6 py-2.5 bg-[#D4AD5D] hover:bg-[#b08e54] text-white text-sm font-bold rounded-xl shadow-md shadow-[#D4AD5D]/10 transition-all disabled:opacity-50"
                                    >
                                        {verifyingPassword ? 'Memverifikasi...' : 'Verifikasi Kata Sandi'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* KOLOM KANAN: Privasi */}
                <div className="space-y-6">
                    
                    {/* CARD 3 PLACEHOLDER: Privasi */}
                    <div className="bg-white rounded-[20px] border border-[#f0ebe1] shadow-sm overflow-hidden p-6 opacity-60">
                        <h2 className="text-[16px] font-bold text-gray-400 mb-6">Privasi</h2>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-50 rounded-lg w-full animate-pulse" />
                            <div className="h-8 bg-gray-50 rounded-lg w-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
