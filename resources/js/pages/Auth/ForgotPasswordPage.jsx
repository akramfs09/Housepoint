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
            // ✅ Langsung arahkan ke halaman Verify OTP dengan email + flag purpose
            navigate('/verify-otp', {
                state: {
                    email: email,
                    purpose: 'reset_password'
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim OTP.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">🔑 Lupa Password</h2>
                    <p className="text-gray-500 mt-2">Masukkan email untuk menerima kode OTP</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="contoh@email.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim OTP'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Ingat password? <Link to="/login" className="text-blue-600 hover:underline font-medium">Masuk</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;