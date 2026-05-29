import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const VerifyOTPPage = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const purpose = location.state?.purpose || 'register'; // default: register

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (purpose === 'reset_password') {
                // Untuk lupa password: arahkan ke halaman reset password
                navigate('/reset-password', {
                    state: { email: email, otp: otp }
                });
            } else {
                // Untuk registrasi: panggil verifyOtp dari AuthContext
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
            setError(err.response?.data?.message || 'Verifikasi OTP gagal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pageTitle = purpose === 'reset_password'
        ? 'Verifikasi OTP - Lupa Password'
        : 'Verifikasi OTP - Registrasi';
    const pageDescription = purpose === 'reset_password'
        ? 'Masukkan kode OTP untuk melanjutkan reset password'
        : 'Kode OTP telah dikirim untuk verifikasi akun';

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">🔐 {pageTitle}</h2>
                    <p className="text-gray-500 mt-2">{pageDescription}</p>
                    <p className="text-gray-400 text-sm mt-1">Email: <strong>{email}</strong></p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kode OTP (6 digit)</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="000000"
                            maxLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || otp.length !== 6}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Tidak menerima kode? <button className="text-blue-600 hover:underline font-medium">Kirim Ulang</button></p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTPPage;