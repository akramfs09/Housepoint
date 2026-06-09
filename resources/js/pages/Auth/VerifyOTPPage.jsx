import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthStatsBar from '../../components/common/AuthStatsBar';

const VerifyOTPPage = () => {
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const purpose = location.state?.purpose || 'register';
    const otp = otpDigits.join('');

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
            setError('Kode otp tidak valid, silahkan coba lagi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pageDescription = purpose === 'reset_password'
        ? 'Masukkan kode OTP untuk melanjutkan reset password'
        : 'Masukkan kode OTP yang telah dikirim ke email Anda';

    return (
        <div className="min-h-screen w-full bg-[#FDF8E4] flex items-center justify-center font-sans overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[45%] h-full overflow-hidden z-0">
                <div
                    className="absolute top-0 left-[-10%] w-[160%] h-full bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop")',
                        clipPath: 'ellipse(140% 100% at 0% 50%)',
                    }}
                />
                <div
                    className="absolute top-0 left-[-10%] w-[160%] h-full bg-black/50"
                    style={{ clipPath: 'ellipse(140% 100% at 0% 50%)' }}
                />
            </div>

            <div className="relative z-10 w-full max-w-[1250px] px-6 flex items-center justify-between h-screen py-10">
                <div className="w-[38%] flex flex-col justify-center items-start pl-8 text-white relative h-full">
                    <div className="absolute top-12 left-8 flex items-center gap-2">
                        <div className="w-8 h-8 border-2 border-[#C5A065] rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#C5A065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="#C5A065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="#C5A065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold tracking-widest text-white text-sm">HOUSE POINT</span>
                            <span className="text-[10px] tracking-[0.2em] text-white/80">CATALOG</span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-[34px] font-bold leading-tight mb-5">
                            Temukan Rumah<br />Impian Anda
                        </h1>
                        <p className="text-white/90 text-[14px] leading-relaxed max-w-sm">
                            Masuk untuk menyimpan properti favorit dan menghubungi penjual dengan mudah
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="bg-white rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-[35px] w-[430px]">
                        <div className="text-center mb-7">
                            <h2 className="text-[28px] font-bold text-gray-800">Verifikasi Email</h2>
                            <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{pageDescription}</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                                Email: <strong>{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-center gap-3">
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
                                        className={`w-12 h-12 border rounded-lg text-center text-xl font-semibold text-gray-800 outline-none transition focus:ring-2 ${
                                            error
                                                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                                                : 'border-gray-300 focus:border-[#C5A065] focus:ring-[#C5A065]/30'
                                        }`}
                                        aria-label={`Digit OTP ${index + 1}`}
                                        required
                                    />
                                ))}
                            </div>

                            {error && (
                                <p className="mt-3 text-center text-[12px] font-medium text-red-600">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || otp.length !== 6}
                                className="w-full mt-8 bg-[#C5A065] text-white font-semibold text-[14px] py-[11px] rounded-[6px] shadow-sm hover:bg-[#b08d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <span className="text-gray-400 text-[12px]">Kirim ulang:</span>

                            <div className="mt-2 flex justify-center items-center gap-2">
                                <div className="h-1 w-24 bg-[#C5A065] rounded-full"></div>
                                <span className="text-[12px] text-gray-600">00:30</span>
                            </div>

                            <p className="text-center mt-4 text-[12px] text-gray-500">Tidak menerima kode?</p>

                            <button className="mt-2 text-[#C5A065] text-[13px] font-semibold hover:underline">
                                Kirim Ulang Sekarang
                            </button>
                        </div>
                    </div>
                </div>

                <AuthStatsBar />
            </div>
        </div>
    );
};

export default VerifyOTPPage;
