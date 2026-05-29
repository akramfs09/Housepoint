import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', role: '', divisi: '', jabatan: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get(`/admin/admins/${id}`).then(res => {
            const d = res.data.data;
            setForm({ name: d.name, email: d.email, role: d.role, divisi: d.profile?.divisi || '', jabatan: d.profile?.jabatan || '' });
        });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.put(`/admin/admins/${id}`, form);
            navigate('/admin/admins');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memperbarui admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#2c2c2c]">Edit Admin</h2>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-[#e5d8c0] space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Nama Lengkap</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Role</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                        className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm">
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Divisi (opsional)</label>
                    <input type="text" value={form.divisi} onChange={e => setForm({ ...form, divisi: e.target.value })}
                        className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Jabatan (opsional)</label>
                    <input type="text" value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })}
                        className="w-full border border-[#e5dfd3] rounded-lg px-4 py-2 text-sm" />
                </div>
                <button type="submit" disabled={loading}
                    className="w-full bg-[#C5A065] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#b08d55] disabled:opacity-50 transition">
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </form>
        </div>
    );
};

export default EditAdmin;