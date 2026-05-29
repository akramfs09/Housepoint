import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const CustomerProfile = () => {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({ nama_lengkap: '', no_hp: '', alamat: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                nama_lengkap: user.profile.nama_lengkap || '',
                no_hp: user.profile.no_hp || '',
                alamat: user.profile.alamat || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put('/user/profile', formData);
            setMessage('Profil berhasil diperbarui.');
            refreshUser();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Gagal memperbarui profil.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-[#e5d8c0] p-6">
            <h2 className="text-lg font-bold text-[#2c2c2c] mb-6">Informasi Akun</h2>
            {message && <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('berhasil') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[12px] font-bold text-black mb-1">Nama Lengkap</label>
                    <input type="text" value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]" required />
                </div>
                <div>
                    <label className="block text-[12px] font-bold text-black mb-1">Nomor Telepon</label>
                    <input type="text" value={formData.no_hp} onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })} className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]" />
                </div>
                <div>
                    <label className="block text-[12px] font-bold text-black mb-1">Alamat</label>
                    <textarea value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} className="w-full bg-[#F5F5F5] text-[13px] text-gray-700 p-[10px] rounded-[4px] outline-none focus:ring-1 focus:ring-[#C5A065]" rows="3" />
                </div>
                <button type="submit" disabled={isSubmitting} className="bg-[#C5A065] text-white font-semibold text-[14px] py-[10px] px-6 rounded-[6px] shadow-sm hover:bg-[#b08d55] transition-colors">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
};

export default CustomerProfile;