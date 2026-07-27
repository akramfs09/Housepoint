import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🌟 State Baru untuk Mengontrol Modal Notifikasi Pop-up
    const [showNotification, setShowNotification] = useState({
        visible: false,
        type: 'success', // 'success' atau 'failed'
    });

    const { login } = useAuth();
    const { content } = useWebsiteContent();
    const navigate = useNavigate();
    const authLogo = content.branding?.auth_logo_url || content.branding?.header_logo_url || '/logo.png';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const user = await login(email, password);
            
            // 🌟 1. Jika Login Berhasil: Tampilkan Pop-up Berhasil
            setShowNotification({ visible: true, type: 'success' });

            // Berikan jeda waktu 2 detik agar user bisa melihat notifikasi sebelum berpindah halaman
            setTimeout(() => {
                setShowNotification({ visible: false, type: 'success' });
                if (user.role === 'super_admin' || user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                } else {
                    navigate('/customer/dashboard');
                }
            }, 2000);

        } catch (err) {
            const isThrottled = err.response?.status === 429;

            setShowNotification({
                visible: true,
                type: 'failed',
                isThrottled: isThrottled,
                message: isThrottled
                    ? (err.response?.data?.message || 'Terlalu banyak percobaan login. Silakan tunggu 1 menit.')
                    : null
            });

            if (isThrottled) {
                setError('Terlalu banyak percobaan login. Silakan tunggu 1 menit.');
            } else if (err.response?.status === 403) {
                setError(err.response?.data?.message || 'Akun Anda tidak dapat digunakan.');
            } else {
                setFieldErrors({
                    email: 'Masukkan email yang terdaftar',
                    password: 'Masukkan password yang benar',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF6E2] flex flex-col justify-between font-sans antialiased select-none selection:bg-[#D4A44C]/30 relative overflow-x-hidden">

            {/* 🌟 OVERLAY MODAL NOTIFIKASI POP-UP (MUNCUL DI TENGAH LAYAR) 🌟 */}
            {showNotification.visible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] transition-all duration-300 animate-fade-in">

                    {/* KONDISI 1: POP-UP LOGIN GAGAL */}
                    {showNotification.type === 'failed' && (
                        <div className="w-[90%] max-w-[400px] bg-white rounded-3xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-red-100 flex flex-col items-center justify-center relative transform scale-100 animate-pop-up">
                            {/* Tombol Close silang kecil di pojok kanan atas untuk menutup manual jika gagal */}
                            <button 
                                onClick={() => setShowNotification({ visible: false, type: 'failed' })}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-sm">
                                ✕
                            </button>
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {showNotification.isThrottled ? 'Batas Percobaan Terlampaui' : 'Login Gagal'}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] leading-relaxed">
                                {showNotification.message || 'Pastikan Username dan Password benar.'}
                            </p>
                        </div>
                    )}

                    {/* KONDISI 2: POP-UP LOGIN BERHASIL */}
                    {showNotification.type === 'success' && (
                        <div className="w-[90%] max-w-[400px] bg-white rounded-3xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-amber-100 flex flex-col items-center justify-center transform scale-100 animate-pop-up">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-[#D4A44C] mb-5">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Login Berhasil</h2>
                            <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] leading-relaxed">
                                Anda berhasil masuk ke Akun Housepoint.
                            </p>
                        </div>
                    )}

                </div>
            )}

            {/* 1. BACKGROUND HERO */}
            <div className="absolute left-0 top-0 bottom-0 w-full lg:w-[42%] h-[45vh] lg:h-full z-0 overflow-hidden rounded-br-[120px] lg:rounded-br-none lg:rounded-tr-[380px] shadow-[12px_0_30px_rgba(0,0,0,0.04)]">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                    alt="Property Background"
                    className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/35 mix-blend-multiply" />
            </div>

            {/* 2. LOGO UTAMA */}
            <div className="w-full h-[95px] px-6 lg:px-[100px] flex items-center z-30 relative">
                <img
                    src={authLogo}
                    alt="HousePoint"
                    className="h-10 lg:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105 cursor-pointer"
                />
            </div>

            {/* 3. AREA UTAMA KONTEN GRID */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-[100px] pt-4 lg:pt-0 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
                
                {/* Bagian Kiri: Teks */}
                <div className="col-span-1 lg:col-span-4 flex flex-col justify-center min-h-[200px] lg:min-h-0 lg:pr-4 z-20">
                    <div className="z-10 text-white animate-fade-in-left space-y-4 lg:pl-4 max-w-sm">
                        <h1 className="text-4xl lg:text-[42px] font-bold leading-tight tracking-wide text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                            Temukan Rumah <br />
                            Impian Anda
                        </h1>
                        <p className="text-sm lg:text-base text-gray-200 font-medium leading-relaxed opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                            Masuk untuk menyimpan properti favorit dan menghubungi penjual dengan mudah.
                        </p>
                    </div>
                </div>

                {/* Bagian Tengah: Formulir Utama Login */}
                <div className="col-span-1 lg:col-span-5 flex justify-center z-20 lg:pl-6">
                    <div className="w-full max-w-[450px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(139,115,85,0.15)] border border-amber-100/40 p-8 lg:p-9 transform hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between min-h-[580px]">
                        
                        <div>
                            {/* Tab Switcher */}
                            <div className="flex items-center justify-center gap-3 text-xl lg:text-2xl font-bold tracking-tight mb-3">
                                <span className="text-[#D4A44C] border-b-2 border-[#D4A44C] pb-0.5 cursor-default">
                                    Masuk Ke Akun
                                </span>
                                <span className="text-gray-300 font-light">/</span>
                                <Link
                                    to="/register"
                                    className="text-gray-400 hover:text-[#D4A44C] transition-colors duration-200 pb-0.5"
                                >
                                    Daftar Akun
                                </Link>
                            </div>

                            <p className="text-center text-gray-500 text-xs sm:text-sm max-w-[320px] mx-auto leading-relaxed mb-6">
                                Buat akun atau Masuk ke Akun untuk mulai mencari properti impian anda
                            </p>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl p-3 text-center font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Form Input Container */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Field: Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-800">
                                        Email / No Handphone
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                                        }}
                                        placeholder="Masukkan Email anda"
                                        className={`w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#D4A44C]/20 ${
                                            fieldErrors.email
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-gray-200 focus:border-[#D4A44C]'
                                        }`}
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-red-500 text-xs font-medium pl-1">{fieldErrors.email}</p>
                                    )}
                                </div>

                                {/* Field: Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-800">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                                            }}
                                            placeholder="Masukkan Password anda"
                                            className={`w-full h-11 pl-4 pr-11 rounded-xl border bg-white text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#D4A44C]/20 ${
                                                fieldErrors.password
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-gray-200 focus:border-[#D4A44C]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4A44C] transition-colors p-1"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="text-red-500 text-xs font-medium pl-1">{fieldErrors.password}</p>
                                    )}
                                </div>

                                {/* Opsi Simpan Sesi */}
                                <div className="flex items-center justify-between pt-1 pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                            className="w-4 h-4 rounded text-[#D4A44C] border-gray-300 focus:ring-[#D4A44C] accent-[#D4A44C]"
                                        />
                                        <span className="text-xs text-gray-600 group-hover:text-[#D4A44C] transition-colors">
                                            Ingat saya
                                        </span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-semibold text-gray-500 hover:text-[#D4A44C] hover:underline transition-all"
                                    >
                                        Lupa Password?
                                    </Link>
                                </div>

                                {/* Tombol Eksekusi Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 bg-[#D4A44C] hover:bg-[#c1923d] active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg shadow-amber-700/10 transition-all duration-150 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Memproses Masuk...' : 'Masuk'}
                                </button>
                            </form>
                        </div>

                        {/* Garis Pembatas Alternatif */}
                        <div className="my-4 flex items-center justify-center gap-3">
                            <div className="flex-1 border-t border-gray-200" />
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">atau</span>
                            <div className="flex-1 border-t border-gray-200" />
                        </div>

                        {/* Opsi Login Pihak Ketiga & Navigasi Luar */}
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => {
                                    const redirectUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                                        ? 'http://localhost:8000/api/auth/google/redirect'
                                        : `${window.location.origin}/api/auth/google/redirect`;
                                    window.location.href = redirectUrl;
                                }}
                                className="w-full h-11 border border-gray-200 hover:border-[#D4A44C] bg-white rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold text-gray-700 hover:bg-amber-50/20 active:scale-[0.98] transition-all duration-200"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.69 1.42 15.02 1 12 1 7.21 1 3.12 3.74 1.16 7.73l3.86 3c.92-2.76 3.51-4.69 6.98-4.69z"/>
                                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.76 2.92c2.2-2.03 3.69-5.03 3.69-8.64z"/>
                                    <path fill="#FBBC05" d="M5.02 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27L1.16 6.73C.42 8.24 0 10.07 0 12s.42 3.76 1.16 5.27l3.86-3z"/>
                                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.92c-1.04.7-2.38 1.12-4.2 1.12-3.47 0-6.06-1.93-6.98-4.69l-3.86 3C3.12 20.26 7.21 23 12 23z"/>
                                </svg>
                                <span>Masuk Dengan Google</span>
                            </button>

                            <div className="text-center text-xs sm:text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <Link to="/register" className="text-[#D4A44C] font-bold hover:underline">
                                    Daftar Sekarang
                                </Link>
                            </div>

                            <div className="text-center">
                                <Link
                                    to="/"
                                    className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors gap-1 hover:underline"
                                >
                                    <span>←</span> Kembali ke Beranda
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bagian Kanan: Panel Daftar Statistik */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 w-full max-w-[280px] mx-auto lg:ml-auto lg:mr-0 animate-fade-in-right">
                    {[
                        { 
                            val: '1,200+', 
                            lbl: 'Properti Eksklusif',
                            icon: <svg className="w-6 h-6 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> 
                        },
                        { 
                            val: '4,500+', 
                            lbl: 'Pengguna Aktif',
                            icon: <svg className="w-6 h-6 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> 
                        },
                        { 
                            val: '150+', 
                            lbl: 'Agen Berlisensi',
                            icon: <svg className="w-6 h-6 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> 
                        },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="w-full h-24 bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-100 px-6 flex items-center gap-4 shadow-[0_8px_20px_rgba(197,160,101,0.06)] hover:shadow-md hover:border-amber-200 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#D4A44C]/10 flex items-center justify-center flex-shrink-0">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-gray-800 leading-none">
                                    {item.val}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mt-1 truncate">
                                    {item.lbl}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. FOOTER */}
            <footer className="w-full h-[60px] bg-[#3B362A] flex items-center justify-center z-20">
                <p className="text-gray-400 text-xs tracking-wide">
                    © 2026 HousePoint. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default LoginPage;
