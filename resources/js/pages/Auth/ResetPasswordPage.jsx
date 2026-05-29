import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PasswordInput from '../../components/common/PasswordInput';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const otp = location.state?.otp || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/reset-password', {
                email: email,
                otp: otp,
                password: password,
                password_confirmation: passwordConfirmation,
            });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">🔒 Reset Password</h2>
                    <p className="text-gray-500 mt-2">Masukkan password baru Anda</p>
                </div>

                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{message}</div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput value={password} onChange={setPassword} label="Password Baru" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Ulangi password baru"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;