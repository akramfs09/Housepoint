import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../common/PropertyCard';
import { fetchFeaturedProperties, fetchPublicProperties } from '../../services/api';

const SECTION_CONFIG = [
    {
        key: 'featured',
        title: 'Unggulan',
        icon: '🌟',
        description: 'Slot promosi berbayar yang sedang tampil hari ini.',
    },
    {
        key: 'popular',
        title: 'Terpopuler Minggu Ini',
        icon: '🔥',
        description: 'Properti dengan kunjungan tertinggi dalam 7 hari terakhir.',
    },
    {
        key: 'favorited',
        title: 'Terfavorit Minggu Ini',
        icon: '💗',
        description: 'Properti yang paling sering disimpan pengguna minggu ini.',
    },
];

const emptyState = {
    featured: 'Belum ada properti unggulan aktif.',
    popular: 'Belum ada data kunjungan minggu ini.',
    favorited: 'Belum ada properti favorit minggu ini.',
};

const normalizeResourceList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const FeaturedProperties = () => {
    const [sections, setSections] = useState({
        featured: [],
        popular: [],
        favorited: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadCatalogSections = async () => {
            setLoading(true);

            try {
                const [featuredResponse, catalogResponse] = await Promise.all([
                    fetchFeaturedProperties(),
                    fetchPublicProperties({ per_page: 1 }),
                ]);

                if (!isMounted) return;

                setSections({
                    featured: normalizeResourceList(featuredResponse.data),
                    popular: normalizeResourceList(catalogResponse.data?.popular),
                    favorited: normalizeResourceList(catalogResponse.data?.favorited),
                });
            } catch (error) {
                console.error('Gagal memuat section katalog:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCatalogSections();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFavoriteChange = (propertyId, isFavorited) => {
        setSections((current) => {
            const update = (items) => items.map((item) => (
                item.id === propertyId ? { ...item, is_favorited: isFavorited } : item
            ));

            return {
                featured: update(current.featured),
                popular: update(current.popular),
                favorited: update(current.favorited),
            };
        });
    };

    return (
        <>
            {SECTION_CONFIG.map((config) => (
                <CatalogRail
                    key={config.key}
                    config={config}
                    properties={sections[config.key]}
                    loading={loading}
                    emptyMessage={emptyState[config.key]}
                    onFavoriteChange={handleFavoriteChange}
                />
            ))}
        </>
    );
};

const CatalogRail = ({ config, properties, loading, emptyMessage, onFavoriteChange }) => {
    return (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-12 first:pt-16 pb-2 min-w-0">
            <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-[24px] md:text-[28px] font-bold flex items-center gap-2">
                        <span aria-hidden="true">{config.icon}</span>
                        {config.title}
                    </h3>
                    <p className="text-[#8b8478] mt-1 text-[14px]">
                        {config.description}
                    </p>
                </div>

                <Link
                    to="/properties"
                    className="shrink-0 text-[#c08a2c] font-semibold text-[14px] hover:underline"
                >
                    Lihat Semua →
                </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="min-w-[270px] sm:min-w-[280px] lg:min-w-[285px] h-[420px] rounded-[22px] bg-white/60 border border-[#e5d8c0] animate-pulse snap-start"
                        />
                    ))
                ) : properties.length > 0 ? (
                    properties.map((property) => (
                        <div
                            key={property.id}
                            className="min-w-[270px] sm:min-w-[280px] lg:min-w-[285px] max-w-[285px] snap-start"
                        >
                            <PropertyCard
                                property={property}
                                mode="public"
                                onFavoriteChange={onFavoriteChange}
                            />
                        </div>
                    ))
                ) : (
                    <div className="w-full rounded-xl border border-dashed border-[#d8c8ac] bg-[#f7f1e7] px-5 py-8 text-center text-sm text-[#81796c]">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProperties;
