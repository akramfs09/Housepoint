import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';
import api from '../../services/api';

const OTP_COOLDOWN_SECONDS = 60;

const VerifyOTPPage = () => {
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(OTP_COOLDOWN_SECONDS);
    const [showNotification, setShowNotification] = useState({ visible: false, title: '', message: '' });
    const inputRefs = useRef([]);
    const { verifyOtp } = useAuth();
    const { content } = useWebsiteContent();
    const authLogo = content.branding?.auth_logo_url || content.branding?.header_logo_url || '/logo.png';
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const purpose = location.state?.purpose || 'register';
    const otp = otpDigits.join('');
    const canResend = cooldown <= 0 && !isResending && Boolean(email);
    const cooldownProgress = Math.max(0, Math.min(100, ((OTP_COOLDOWN_SECONDS - cooldown) / OTP_COOLDOWN_SECONDS) * 100));

    useEffect(() => {
        if (cooldown <= 0) return undefined;

        const timer = setInterval(() => {
            setCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    useEffect(() => {
        if (!email) {
            navigate(purpose === 'reset_password' ? '/forgot-password' : '/register', { replace: true });
        }
    }, [email, navigate, purpose]);

    const formatCooldown = (seconds) => {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    const handleOtpChange = (index, value) => {
        const sanitizedValue = value.replace(/\D/g, '');
        const nextDigits = [...otpDigits];

        if (sanitizedValue.length > 1) {
            sanitizedValue.slice(0, 6).split('').forEach((digit, digitIndex) => {
                nextDigits[digitIndex] = digit;
            });
            setOtpDigits(nextDigits);
            setError('');
            inputRefs.current[Math.min(sanitizedValue.length, 6) - 1]?.focus();
            return;
        }

        nextDigits[index] = sanitizedValue;
        setOtpDigits(nextDigits);
        setError('');

        if (sanitizedValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        handleOtpChange(0, e.clipboardData.getData('text'));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (purpose === 'reset_password') {
                await api.post('/auth/check-otp', { email, otp, purpose });
                navigate('/reset-password', {
                    state: { email: email, otp: otp }
                });
            } else {
                const user = await verifyOtp(email, otp);

                if (user.role === 'super_admin' || user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'seller') {
                    navigate('/seller/dashboard');
                } else {
                    navigate('/customer/dashboard');
                }
            }
        } catch (err) {
            const msg = err.response?.status === 429
                ? (err.response?.data?.message || 'Terlalu banyak percobaan verifikasi. Silakan tunggu 10 menit.')
                : (err.response?.data?.message || 'Kode OTP tidak valid, silakan coba lagi.');
            setError(msg);
            if (err.response?.status === 429) {
                setShowNotification({
                    visible: true,
                    title: 'Batas Percobaan Terlampaui',
                    message: msg
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setError('');
        setIsResending(true);
        try {
            await api.post('/auth/resend-otp', { email, purpose });
            setOtpDigits(Array(6).fill(''));
            setCooldown(OTP_COOLDOWN_SECONDS);
            inputRefs.current[0]?.focus();
        } catch (err) {
            const msg = err.response?.status === 429
                ? (err.response?.data?.message || 'Terlalu banyak permintaan kirim ulang OTP. Silakan tunggu 10 menit.')
                : (err.response?.data?.message || 'Gagal mengirim ulang OTP.');
            setError(msg);
            if (err.response?.status === 429) {
                setShowNotification({
                    visible: true,
                    title: 'Batas Percobaan Terlampaui',
                    message: msg
                });
            } else if (msg.toLowerCase().includes('60 detik')) {
                setCooldown(OTP_COOLDOWN_SECONDS);
            }
        } finally {
            setIsResending(false);
        }
    };

    const pageDescription = purpose === 'reset_password'
        ? 'Masukkan kode OTP untuk melanjutkan reset password'
        : 'Masukkan kode OTP yang telah dikirim ke email Anda';

    return (
        <div className="min-h-screen bg-[#FDF6E2] flex flex-col justify-between font-sans antialiased select-none selection:bg-[#D4A44C]/30 relative overflow-x-hidden">

            {/* OVERLAY MODAL NOTIFIKASI POP-UP */}
            {showNotification.visible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] transition-all duration-300 animate-fade-in">
                    <div className="w-[90%] max-w-[400px] bg-white rounded-3xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-red-100 flex flex-col items-center justify-center relative transform scale-100 animate-pop-up">
                        <button 
                            onClick={() => setShowNotification({ visible: false, title: '', message: '' })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-sm">
                            ✕
                        </button>
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{showNotification.title}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] leading-relaxed">
                            {showNotification.message}
                        </p>
                    </div>
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
                    onClick={() => navigate('/')}
                />
            </div>

            {/* 3. AREA UTAMA KONTEN GRID (Menggunakan skema col-span-12 persis seperti Register) */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-[100px] pt-4 lg:pt-0 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">

                {/* Sisi Kiri: Tempat Susunan Teks Hero (col-span-4) */}
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

                {/* Sisi Tengah: Formulir Utama (col-span-5, p-8 lg:p-9, min-h-[580px]) */}
                <div className="col-span-1 lg:col-span-5 flex justify-center z-20 lg:pl-6">
                    <div className="w-full max-w-[450px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(139,115,85,0.15)] border border-amber-100/40 p-8 lg:p-9 transform hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between min-h-[580px]">

                        <div>
                            {/* Header Form / Judul Halaman */}
                            <div className="text-center mb-5">
                                <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-800">
                                    Verifikasi Email
                                </h2>
                                <p className="text-gray-500 text-xs sm:text-sm max-w-[320px] mx-auto leading-relaxed mt-2">
                                    {pageDescription}
                                </p>
                                <div className="mt-3 inline-block px-3 py-1 bg-amber-50/70 rounded-full border border-amber-100/50">
                                    <p className="text-[11px] text-[#4F4537] font-medium">
                                        Email: <span className="font-bold text-gray-700">{email}</span>
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl p-3 text-center font-medium">
                                    {error}
                                </div>
                            )}

                            {/* OTP Box Inputs Form */}
                            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                                <div className="flex justify-center gap-2">
                                    {otpDigits.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(element) => { inputRefs.current[index] = element; }}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            maxLength={1}
                                            className={`w-11 h-12 border rounded-xl text-center text-xl font-bold outline-none transition-all duration-200 focus:ring-2 ${
                                                error
                                                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-200'
                                                    : 'border-gray-200 text-gray-800 focus:border-[#D4A44C] focus:ring-[#D4A44C]/20'
                                            }`}
                                            aria-label={`Digit OTP ${index + 1}`}
                                            required
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || otp.length !== 6}
                                    className="w-full h-11 bg-[#D4A44C] hover:bg-[#c1923d] active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg shadow-amber-700/10 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                                </button>
                            </form>
                        </div>

                        {/* Informasi Kirim Ulang */}
                        <div className="mt-6 text-center border-t border-gray-100 pt-4">
                            <span className="text-gray-400 text-xs font-medium">
                                {cooldown > 0 ? 'Kirim ulang dalam:' : 'Kode belum diterima?'}
                            </span>

                            <div className="mt-1.5 flex justify-center items-center gap-2">
                                <div className="h-1.5 w-20 bg-amber-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#D4A44C] rounded-full transition-all duration-500"
                                        style={{ width: `${cooldownProgress}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-600 font-bold tracking-wider">{formatCooldown(cooldown)}</span>
                            </div>

                            <p className="mt-3.5 text-xs text-gray-400 font-medium">Tidak menerima kode?</p>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!canResend}
                                className="mt-0.5 text-[#D4A44C] hover:text-[#c1923d] text-sm font-bold transition-colors hover:underline focus:outline-none disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {isResending ? 'Mengirim ulang...' : 'Kirim Ulang Sekarang'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Sisi Kanan: Panel Daftar Statistik (col-span-3, h-24) */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 w-full max-w-[280px] mx-auto lg:ml-auto lg:mr-0 animate-fade-in-right">
                    {[
                        { val: '1,200+', lbl: 'Properti Eksklusif', icon: <svg className="w-5 h-5 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
                        { val: '4,500+', lbl: 'Pengguna Aktif', icon: <svg className="w-5 h-5 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                        { val: '150+', lbl: 'Agen Berlisensi', icon: <svg className="w-5 h-5 text-[#D4A44C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
                    ].map((item, idx) => (
                        <div key={idx} className="w-full h-24 bg-white rounded-2xl border border-amber-100/70 px-5 flex items-center gap-4 shadow-[0_10px_25px_rgba(139,115,85,0.05)] hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="w-10 h-10 rounded-full bg-[#D4A44C]/10 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-800 leading-none">{item.val}</h3>
                                <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">{item.lbl}</p>
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

export default VerifyOTPPage;
