import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        email: '',
        password: '',
        password_confirmation: '',
        no_hp: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setErrors({});

        const newErrors = {};
        if (formData.password.length < 8) newErrors.password = 'Password wajib minimal 8 karakter.';
        if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password tidak cocok.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setIsSubmitting(true);
        try {
            await register(formData);
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            const statusCode = err.response?.status;
            const responseData = err.response?.data;
            if (statusCode === 422 && responseData?.errors) {
                const serverErrors = {};
                Object.keys(responseData.errors).forEach((key) => { serverErrors[key] = responseData.errors[key][0]; });
                setErrors(serverErrors);
            } else {
                setServerError(responseData?.message || 'Registrasi gagal. Coba lagi.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF6E2] flex flex-col justify-between font-sans antialiased select-none selection:bg-[#D4A44C]/30 relative overflow-x-hidden">
            
            {/* 1. BACKGROUND HERO (Sama Persis dengan Login) */}
            <div className="absolute left-0 top-0 bottom-0 w-full lg:w-[42%] h-[45vh] lg:h-full z-0 overflow-hidden rounded-br-[120px] lg:rounded-br-none lg:rounded-tr-[380px] shadow-[12px_0_30px_rgba(0,0,0,0.04)]">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=formatformat&fit=crop"
                    alt="Property Background"
                    className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/35 mix-blend-multiply" />
            </div>

            {/* 2. LOGO UTAMA (Sama Persis dengan Login) */}
            <div className="w-full h-[95px] px-6 lg:px-[100px] flex items-center z-30 relative">
                <img
                    src="/logo.png"
                    alt="HousePoint"
                    className="h-10 lg:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105 cursor-pointer"
                />
            </div>

            {/* 3. AREA UTAMA KONTEN GRID (Menggunakan skema col-span-12 yang sama) */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-[100px] pt-4 lg:pt-0 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
                
                {/* Bagian Kiri: Tempat Susunan Teks (col-span-4) */}
                <div className="col-span-1 lg:col-span-4 flex flex-col justify-center min-h-[200px] lg:min-h-0 lg:pr-4 z-20">
                    <div className="z-10 text-white animate-fade-in-left space-y-4 lg:pl-4 max-w-sm">
                        <h1 className="text-4xl lg:text-[42px] font-bold leading-tight tracking-wide text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                            Temukan Rumah <br />
                            Impian Anda
                        </h1>
                        <p className="text-sm lg:text-base text-gray-200 font-medium leading-relaxed opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                            Daftar sekarang untuk mulai mencari properti impian anda dan menikmati layanan penuh kami.
                        </p>
                    </div>
                </div>

                {/* Bagian Tengah: Formulir Utama Registrasi (col-span-5, p-8 lg:p-9, min-h-[580px]) */}
                <div className="col-span-1 lg:col-span-5 flex justify-center z-20 lg:pl-6">
                    <div className="w-full max-w-[450px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(139,115,85,0.15)] border border-amber-100/40 p-8 lg:p-9 transform hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between min-h-[580px]">
                        
                        <div>
                            {/* Tab Switcher */}
                            <div className="flex items-center justify-center gap-3 text-xl lg:text-2xl font-bold tracking-tight mb-3">
                                <Link to="/login" className="text-gray-400 hover:text-[#D4A44C] transition-colors duration-200 pb-0.5">
                                    Masuk Ke Akun
                                </Link>
                                <span className="text-gray-300 font-light">/</span>
                                <span className="text-[#D4A44C] border-b-2 border-[#D4A44C] pb-0.5 cursor-default">
                                    Daftar Akun
                                </span>
                            </div>

                            <p className="text-center text-gray-500 text-xs sm:text-sm max-w-[320px] mx-auto leading-relaxed mb-5">
                                Buat akun atau Masuk ke Akun untuk mulai mencari properti impian anda
                            </p>

                            {serverError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl p-3 text-center font-medium">
                                    {serverError}
                                </div>
                            )}

                            {/* Form Input (Menggunakan h-11 dan text-sm agar sama presisi) */}
                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-800">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        name="nama_lengkap" 
                                        value={formData.nama_lengkap} 
                                        onChange={handleChange}
                                        placeholder="Masukkan Nama Lengkap"
                                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none transition-all duration-200 focus:border-[#D4A44C] focus:ring-2 focus:ring-[#D4A44C]/20" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-800">Email</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange}
                                        placeholder="Masukkan Email anda"
                                        className={`w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#D4A44C]/20 ${
                                            errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#D4A44C]'
                                        }`} 
                                        required 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs font-medium pl-1">{errors.email}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-800">No HP (Opsional)</label>
                                    <input 
                                        type="text" 
                                        name="no_hp" 
                                        value={formData.no_hp} 
                                        onChange={handleChange}
                                        placeholder="Masukkan Nomor Handphone"
                                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none transition-all duration-200 focus:border-[#D4A44C] focus:ring-2 focus:ring-[#D4A44C]/20" 
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-800">Password</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange}
                                        placeholder="Masukkan Password anda"
                                        className={`w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#D4A44C]/20 ${
                                            errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#D4A44C]'
                                        }`} 
                                        required 
                                    />
                                    {errors.password && <p className="text-red-500 text-xs font-medium pl-1">{errors.password}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-800">Konfirmasi Password</label>
                                    <input 
                                        type="password" 
                                        name="password_confirmation" 
                                        value={formData.password_confirmation} 
                                        onChange={handleChange}
                                        placeholder="Ulangi Password anda"
                                        className={`w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#D4A44C]/20 ${
                                            errors.password_confirmation ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#D4A44C]'
                                        }`} 
                                        required 
                                    />
                                    {errors.password_confirmation && <p className="text-red-500 text-xs font-medium pl-1">{errors.password_confirmation}</p>}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full h-11 mt-2 bg-[#D4A44C] hover:bg-[#c1923d] active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg shadow-amber-700/10 transition-all duration-150 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Memproses Daftar...' : 'Daftar'}
                                </button>
                            </form>
                        </div>

                        {/* Bagian Bawah Tautan Navigasi */}
                        <div className="space-y-4 mt-5">
                            <div className="text-center text-xs sm:text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <Link to="/login" className="text-[#D4A44C] font-bold hover:underline">
                                    Masuk Sekarang
                                </Link>
                            </div>

                            <div className="text-center">
                                <Link to="/" className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors gap-1 hover:underline">
                                    <span>←</span> Kembali ke Beranda
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bagian Kanan: Panel Daftar Statistik (col-span-3, h-24) */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 w-full max-w-[280px] mx-auto lg:ml-auto lg:mr-0 animate-fade-in-right">
                    {[
                        { val: '1,200+', lbl: 'Properti Eksklusif', icon: <svg className="w-6 h-6 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
                        { val: '4,500+', lbl: 'Pengguna Aktif', icon: <svg className="w-6 h-6 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                        { val: '150+', lbl: 'Agen Berlisensi', icon: <svg className="w-6 h-6 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
                    ].map((item, idx) => (
                        <div key={idx} className="w-full h-24 bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-100 px-6 flex items-center gap-4 shadow-[0_8px_20px_rgba(197,160,101,0.06)] hover:shadow-md hover:border-amber-200 transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="w-12 h-12 rounded-full bg-[#D4A44C]/10 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-gray-800 leading-none">{item.val}</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1 truncate">{item.lbl}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. FOOTER (Sama Persis dengan Login) */}
            <footer className="w-full h-[60px] bg-[#3B362A] flex items-center justify-center z-20">
                <p className="text-gray-400 text-xs tracking-wide">
                    © 2026 HousePoint. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default RegisterPage;