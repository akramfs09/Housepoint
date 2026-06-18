import { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';

const Favorites = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get('/favorites');
                // Response: { success, data: { data: [...], meta: ... } }
                const responseData = response.data?.data;        // { data: [...], meta: ... }
                const propertiesArray = responseData?.data || [];  // array properti
                setProperties(propertiesArray);
            } catch {
                toast.error('Gagal memuat favorit.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">❤️ Properti Favorit Saya</h1>
                {loading ? (
                    <p className="text-center py-16 text-gray-500">Memuat...</p>
                ) : properties.length === 0 ? (
                    <p className="text-center py-16 text-gray-500">Belum ada properti favorit.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {properties.map(p => (
                            <PropertyCard key={p.id} property={p} mode="public" />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Favorites;