import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await api.post('/auth/forgot-password', { email });

            navigate('/verify-otp', {
                state: {
                    email,
                    purpose: 'reset_password',
                },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim OTP.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF5E2] flex flex-col">
            {/* MAIN */}
            <div className="flex flex-1">
                {/* LEFT HERO */}
                <div className="relative w-[550px] hidden lg:block overflow-hidden">
                    <img
                        src="/images/property-login.jpg"
                        alt="House"
                        className="w-full h-full object-cover rounded-tr-[300px]"
                    />

                    <div className="absolute inset-0 bg-black/50 rounded-tr-[300px]" />

                    {/* Logo */}
                    <div className="absolute top-12 left-16 z-10">
                        <img
                            src="/logo.png"
                            alt="HousePoint"
                            className="h-12 object-contain"
                        />
                    </div>

                    {/* Hero Text */}
                    <div className="absolute left-20 top-1/2 -translate-y-1/2 text-white z-10">
                        <h1 className="text-5xl font-bold leading-tight mb-6">
                            Temukan Rumah
                            <br />
                            Impian Anda
                        </h1>

                        <p className="text-xl leading-relaxed font-medium">
                            Masuk untuk menyimpan properti
                            <br />
                            favorit dan menghubungi penjual
                            <br />
                            dengan mudah
                        </p>
                    </div>
                </div>

                {/* CENTER FORM */}
                <div className="flex-1 flex items-center justify-center px-6 py-10">
                    <div className="w-full max-w-[520px]">
                        <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-8">
                            <h2 className="text-center text-3xl font-bold mb-4">
                                Atur Ulang Password
                            </h2>

                            <p className="text-center text-sm text-gray-500 mb-8">
                                Masukkan Email Anda agar kami dapat memberikan
                                instruksi untuk mengatur ulang password Anda.
                            </p>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block font-semibold mb-3">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Masukkan Email anda"
                                        required
                                        className="w-full h-12 rounded-lg border border-[#D4A44C] px-4 focus:outline-none focus:ring-2 focus:ring-[#D4A44C]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-[#D4A44C] hover:bg-[#c5953f] text-white rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? 'Mengirim...'
                                        : 'Kirim Verifikasi'}
                                </button>

                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 border-t border-gray-400"></div>
                                    <span className="text-sm text-gray-500">
                                        atau
                                    </span>
                                    <div className="flex-1 border-t border-gray-400"></div>
                                </div>

                                <Link
                                    to="/login"
                                    className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center text-[#57534E] hover:bg-gray-50 transition"
                                >
                                    Kembali Ke Login
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT STATS */}
                <div className="hidden xl:flex w-[340px] items-center justify-center">
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl p-8 w-[250px] shadow-sm border border-[#D3C4B2]/30">
                            <div className="text-4xl font-semibold text-[#1F1B15]">
                                1,200+
                            </div>
                            <div className="text-sm text-[#4F4537] mt-1">
                                Properti Eksklusif
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 w-[250px] shadow-sm border border-[#D3C4B2]/30">
                            <div className="text-4xl font-semibold text-[#1F1B15]">
                                4,500+
                            </div>
                            <div className="text-sm text-[#4F4537] mt-1">
                                Pengguna Aktif
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 w-[250px] shadow-sm border border-[#D3C4B2]/30">
                            <div className="text-4xl font-semibold text-[#1F1B15]">
                                150+
                            </div>
                            <div className="text-sm text-[#4F4537] mt-1">
                                Agen Berlisensi
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="bg-[#403B2D] py-4 text-center">
                <p className="text-[#838383] text-sm">
                    © 2026 HousePoint. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default ForgotPasswordPage;