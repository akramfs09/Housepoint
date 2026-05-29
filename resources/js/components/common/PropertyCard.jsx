import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    return (
        <div className="bg-[#f8f4ec] rounded-[22px] overflow-hidden shadow-lg border border-[#e6dac7]">
            <div className="relative h-[240px] overflow-hidden">
                <img
                    src={property.image || property.image_main || 'https://images.unsplash.com/photo-1600585154526-990dced4db42?q=80&w=1200&auto=format&fit=crop'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                <div className="absolute top-4 left-4 bg-[#d49b37] text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
                    {property.status === 'published' ? 'TERSEDIA' : property.status?.toUpperCase() || 'TERSEDIA'}
                </div>

                {/* TODO: Favorit - Batch 5 */}
                <button
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-[#d85f6a] shadow-md text-lg hover:scale-110 transition cursor-not-allowed"
                    title="Favorit (segera hadir)"
                >
                    ♡
                </button>
            </div>

            <div className="p-5">
                <h4 className="text-[#c08a2c] text-[22px] font-bold">
                    {typeof property.price === 'number'
                        ? `Rp ${property.price.toLocaleString('id-ID')}`
                        : property.price}
                </h4>

                <h5 className="text-[20px] font-semibold mt-3 leading-snug">
                    {property.title}
                </h5>

                <p className="text-[#8b8478] text-[14px] mt-2">
                    {property.city || property.location || ''}
                </p>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e4d7c4] text-[13px] text-[#6f685d]">
                    <span>{property.land_area || property.size || '?'} m²</span>
                    <span>{property.bedrooms || property.beds || '?'} Kamar</span>
                    <span>{property.bathrooms || property.baths || '?'} Bath</span>
                </div>

                <Link
                    to={`/property/${property.slug || property.id}`}
                    className="block mt-4 text-center border border-[#d49b37] text-[#d49b37] py-2 rounded-lg font-medium text-[13px] hover:bg-[#d49b37] hover:text-white transition"
                >
                    Detail
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;