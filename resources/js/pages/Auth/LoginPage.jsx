import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const user = await login(email, password);

            if (user.role === 'super_admin' || user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'seller') {
                navigate('/seller/dashboard');
            } else {
                navigate('/customer/dashboard');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError(
                    err.response?.data?.message ||
                        'Akun Anda tidak dapat digunakan.'
                );
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
        <div className="min-h-screen bg-[#FDF5E2] overflow-hidden flex flex-col">
            {/* Main */}
            <div className="flex-1 relative">
                {/* Hero Image */}
                <div className="absolute left-0 top-0 w-[550px] h-full hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                        alt="Property"
                        className="w-full h-full object-cover rounded-tr-[500px]"
                    />

                    <div className="absolute inset-0 bg-black/50 rounded-tr-[500px]" />
                </div>

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 h-[93px] px-[80px] flex items-center">
                    <img
                        src="/logo.png"
                        alt="HousePoint"
                        className="h-[53px] object-contain"
                    />
                </div>

                {/* Content */}
                <div className="pt-[140px] px-[80px] flex items-center justify-between gap-9">
                    {/* Left Text */}
                    <div className="w-[390px] hidden lg:flex flex-col text-white z-10">
                        <h1 className="text-[40px] font-bold leading-[60px] drop-shadow-lg">
                            Temukan Rumah
                            <br />
                            Impian Anda
                        </h1>

                        <p className="mt-8 text-[20px] font-medium leading-[30px]">
                            Masuk untuk menyimpan properti
                            <br />
                            favorit dan menghubungi penjual
                            <br />
                            dengan mudah
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="flex-1 flex justify-center">
                        <div className="w-[518px] h-[572px] bg-[#FFFCFC] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative p-0">
                            {/* Tabs */}
                            <div className="absolute top-[17px] left-[60px]">
                                <span className="text-[#D4A44C] text-2xl font-bold">
                                    Masuk Ke Akun
                                </span>
                            </div>

                            <div className="absolute top-[17px] left-[250px] text-2xl font-bold">
                                /
                            </div>

                            <div className="absolute top-[17px] left-[272px]">
                                <Link
                                    to="/register"
                                    className="text-black text-2xl font-bold"
                                >
                                    Daftar Akun
                                </Link>
                            </div>

                            <div className="absolute top-[68px] left-[32px] w-[454px]">
                                <p className="text-center text-[#5C5C5C] text-sm">
                                    Buat akun atau Masuk ke Akun untuk mulai
                                    mencari properti impian anda
                                </p>
                            </div>

                            {error && (
                                <div className="absolute top-[95px] left-[96px] w-[325px] bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className="absolute left-[96px] top-[126px]">
                                    <label className="block text-base font-semibold mb-2">
                                        Email / No Handphone
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (fieldErrors.email) {
                                                setFieldErrors({
                                                    ...fieldErrors,
                                                    email: '',
                                                });
                                            }
                                        }}
                                        placeholder="Masukkan Email anda"
                                        className={`w-[325px] h-[42px] px-3 rounded-lg border bg-white text-sm outline-none ${
                                            fieldErrors.email
                                                ? 'border-red-500'
                                                : 'border-[#D4A44C]'
                                        }`}
                                    />

                                    {fieldErrors.email && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {fieldErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="absolute left-[96px] top-[208px]">
                                    <label className="block text-base font-semibold mb-2">
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (
                                                    fieldErrors.password
                                                ) {
                                                    setFieldErrors({
                                                        ...fieldErrors,
                                                        password: '',
                                                    });
                                                }
                                            }}
                                            placeholder="Masukkan Password anda"
                                            className={`w-[325px] h-[42px] px-3 rounded-lg border bg-white text-sm outline-none ${
                                                fieldErrors.password
                                                    ? 'border-red-500'
                                                    : 'border-[#D4A44C]'
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>

                                    {fieldErrors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {fieldErrors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember */}
                                <div className="absolute left-[97px] top-[290px] flex items-center justify-between w-[324px]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={() =>
                                                setRememberMe(!rememberMe)
                                            }
                                            className="w-5 h-5 accent-[#D4A44C]"
                                        />
                                        <span className="text-[13px]">
                                            Ingat saya
                                        </span>
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-[13px] hover:underline"
                                    >
                                        Lupa Password?
                                    </Link>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="absolute left-[97px] top-[326px] w-[324px] h-[44px] bg-[#D4A44C] rounded-lg text-white hover:bg-[#c1923d] transition"
                                >
                                    {isSubmitting
                                        ? 'Masuk...'
                                        : 'Masuk'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="absolute left-[153px] top-[390px] flex items-center gap-2">
                                <div className="w-[84px] border-t border-[#57534E]" />
                                <span className="text-sm">atau</span>
                                <div className="w-[84px] border-t border-[#57534E]" />
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                className="absolute left-[97px] top-[425px] w-[324px] h-[42px] border border-[#D4A44C] rounded-lg bg-white flex items-center justify-center gap-3"
                            >
                                <span className="text-lg">G</span>

                                <span className="text-[#D4A44C]">
                                    Masuk Dengan Google
                                </span>
                            </button>

                            {/* Register */}
                            <div className="absolute left-[99px] top-[485px] flex items-center gap-2">
                                <span>Belum punya akun?</span>

                                <Link
                                    to="/register"
                                    className="text-[#D4A44C] hover:underline"
                                >
                                    Daftar Sekarang
                                </Link>
                            </div>

                            {/* Home */}
                            <div className="absolute left-[172px] top-[530px]">
                                <Link
                                    to="/"
                                    className="text-[#817565] text-sm underline"
                                >
                                    ← Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden xl:flex flex-col gap-[30px]">
                        {[
                            ['1,200+', 'Properti Eksklusif'],
                            ['4,500+', 'Pengguna Aktif'],
                            ['150+', 'Agen Berlisensi'],
                        ].map((item) => (
                            <div
                                key={item[0]}
                                className="w-[247px] h-[100px] bg-white rounded-xl border border-[#D3C4B24D] px-8 flex items-center gap-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#D4A44C1A]" />

                                <div>
                                    <h3 className="text-[32px] font-semibold text-[#1F1B15] leading-none">
                                        {item[0]}
                                    </h3>

                                    <p className="text-sm text-[#4F4537] mt-2">
                                        {item[1]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="h-[61px] bg-[#403B2D] flex items-center justify-center">
                <p className="text-[#838383] text-[15px]">
                    © 2026 HousePoint. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default LoginPage;