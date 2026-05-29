import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthStatsBar from '../../components/common/AuthStatsBar';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = await login(email, password);
            if (user.role === 'super_admin' || user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'seller') navigate('/seller/dashboard');
            else navigate('/customer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#FDF8E4] flex items-center justify-center font-sans overflow-hidden relative">
            {/* Background kiri */}
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
                {/* Kolom kiri - Teks */}
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

                    <div className="mt-0">
                        <h1 className="text-[34px] font-bold leading-tight mb-5">
                            Temukan Rumah<br />Impian Anda
                        </h1>
                        <p className="text-white/90 text-[14px] leading-relaxed max-w-sm">
                            Masuk untuk menyimpan properti favorit dan menghubungi penjual dengan mudah
                        </p>
                    </div>
                </div>

                {/* Kolom tengah - Form */}
                <div className="flex-1 flex justify-center">
                    <div className="bg-white rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-[35px] w-[430px]">
                        <div className="mb-5">
                            <h2 className="text-[#C5A065] font-bold text-[22px] mb-1">
                                Masuk Ke Akun <span className="text-black font-semibold">/ Daftar akun</span>
                            </h2>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Masuk untuk mulai mencari properti impian anda
                            </p>
                        </div>

                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3.5">
                                <label className="block text-[12px] font-bold text-black mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Masukkan email anda"
                                    className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-black mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan Password anda"
                                        className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-5">
                                <Link to="/forgot-password" className="text-[11px] font-bold text-taupe-500 hover:underline">
                                    Lupa Password?
                                </Link>
                            </div>

                            <button type="submit" disabled={isSubmitting}
                                className="w-full bg-[#C5A065] text-white font-semibold text-[14px] py-[10px] rounded-[6px] shadow-sm hover:bg-[#b08d55] transition-colors">
                                {isSubmitting ? 'Masuk...' : 'Masuk'}
                            </button>

                            <div className="mt-5 text-center text-[12px]">
                                <span className="text-black font-medium">Belum punya akun?</span>
                                <Link to="/register" className="text-[#C5A065] font-bold ml-1 hover:underline">Daftar Sekarang</Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Kolom kanan - Statistik */}
                <AuthStatsBar />
            </div>
        </div>
    );
};

export default LoginPage;