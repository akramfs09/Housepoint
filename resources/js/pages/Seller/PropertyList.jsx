import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/seller/properties').then(res => setProperties(res.data.data || [])).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Properti Saya</h1>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr><th className="p-4 text-left">Judul</th><th>Harga</th><th>Status</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
                        {properties.map(p => (
                            <tr key={p.id} className="border-t">
                                <td className="p-4">{p.title}</td>
                                <td className="text-center">Rp {parseInt(p.price).toLocaleString('id-ID')}</td>
                                <td className="text-center"><span className={`px-2 py-1 rounded-full text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span></td>
                                <td className="text-center"><Link to={`/seller/properties/${p.id}/edit`} className="text-blue-600 hover:underline">Edit</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyList;