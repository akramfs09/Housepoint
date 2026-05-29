import PropertyCard from '../common/PropertyCard';
import dummyProperties from '../../data/dummyProperties';

const FeaturedProperties = () => {
    // TODO: Ganti dengan fetch dari /api/properties di Batch 3
    const properties = dummyProperties.slice(0, 4);

    return (
        <section className="max-w-[1180px] mx-auto px-6 pt-20 pb-10">
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h3 className="text-[38px] font-bold">Properti Unggulan</h3>
                    <p className="text-[#8b8478] mt-2 text-[15px]">
                        Penawaran terbaik kami untuk bulan ini
                    </p>
                </div>

                <button className="text-[#c08a2c] font-semibold text-[14px] hover:underline">
                    Lihat Semua →
                </button>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </section>
    );
};

export default FeaturedProperties;