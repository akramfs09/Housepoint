import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PasswordInput from '../../components/common/PasswordInput';
import AuthStatsBar from '../../components/common/AuthStatsBar';

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
                            Daftar sekarang untuk mulai mencari properti impian anda
                        </p>
                    </div>
                </div>

                {/* Kolom tengah - Form */}
                <div className="flex-1 flex justify-center">
                    <div className="bg-white rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-[35px] w-[430px]">
                        <div className="mb-5">
                            <h2 className="text-[#C5A065] font-bold text-[22px] mb-1">
                                Daftar Akun <span className="text-black font-semibold">/ Masuk ke Akun</span>
                            </h2>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Buat akun untuk menyimpan properti favorit dan menghubungi penjual
                            </p>
                        </div>

                        {serverError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{serverError}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3.5">
                                <label className="block text-[12px] font-bold text-black mb-1">Nama Lengkap</label>
                                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange}
                                    className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]" required />
                            </div>

                            <div className="mb-3.5">
                                <label className="block text-[12px] font-bold text-black mb-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className={`w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065] ${errors.email ? 'ring-1 ring-red-500' : ''}`} required />
                                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-3.5">
                                <label className="block text-[12px] font-bold text-black mb-1">No HP (Opsional)</label>
                                <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange}
                                    className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]" />
                            </div>

                            <div className="mb-3.5">
                                <PasswordInput value={formData.password}
                                    onChange={(val) => { setFormData({ ...formData, password: val }); if (errors.password) setErrors({ ...errors, password: '' }); }}
                                    label="Password" error={errors.password} />
                            </div>

                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-black mb-1">Konfirmasi Password</label>
                                <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange}
                                    className={`w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065] ${errors.password_confirmation ? 'ring-1 ring-red-500' : ''}`} required />
                                {errors.password_confirmation && <p className="text-red-500 text-[10px] mt-1">{errors.password_confirmation}</p>}
                            </div>

                            <button type="submit" disabled={isSubmitting}
                                className="w-full bg-[#C5A065] text-white font-semibold text-[14px] py-[10px] rounded-[6px] shadow-sm hover:bg-[#b08d55] transition-colors">
                                {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                            </button>

                            <div className="mt-5 text-center text-[12px]">
                                <span className="text-black font-medium">Sudah punya akun?</span>
                                <Link to="/login" className="text-[#C5A065] font-bold ml-1 hover:underline">Masuk Sekarang</Link>
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

export default RegisterPage;