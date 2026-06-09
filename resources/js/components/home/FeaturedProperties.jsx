import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../common/PropertyCard';
import { fetchPublicProperties } from '../../services/api';

const FeaturedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFeatured = async () => {
            try {
                const { data } = await fetchPublicProperties({ sort_by: 'latest', per_page: 4 });
                setProperties(data.data || []);
            } catch (error) {
                console.error('Gagal memuat properti unggulan:', error);
                // Fallback: tetap kosong, tidak pakai dummy
            } finally {
                setLoading(false);
            }
        };
        loadFeatured();
    }, []);

    // Jangan tampilkan section jika tidak ada properti
    if (loading || properties.length === 0) return null;

    return (
        <section className="max-w-[1180px] mx-auto px-6 pt-20 pb-10">
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h3 className="text-[38px] font-bold">Properti Unggulan</h3>
                    <p className="text-[#8b8478] mt-2 text-[15px]">
                        Penawaran terbaik kami untuk bulan ini
                    </p>
                </div>

                <Link
                    to="/properties"
                    className="text-[#c08a2c] font-semibold text-[14px] hover:underline"
                >
                    Lihat Semua →
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} mode="public" />
                ))}
            </div>
        </section>
    );
};

export default FeaturedProperties;