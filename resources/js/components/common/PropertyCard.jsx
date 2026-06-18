// resources/js/components/common/PropertyCard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const STATUS_BADGE = {
    draft: { color: 'bg-gray-400', label: 'Draft' },
    pending: { color: 'bg-yellow-500', label: 'Menunggu Moderasi' },
    approved: { color: 'bg-blue-500', label: 'Menunggu Pembayaran' },
    published: { color: 'bg-[#d49b37]', label: 'TERSEDIA' },
    rejected: { color: 'bg-red-500', label: 'Ditolak' },
};

const TYPE_LABEL = {
    rumah: 'Rumah',
    apartemen: 'Apartemen',
    ruko: 'Ruko',
    tanah: 'Tanah',
    gedung: 'Gedung',
};

const FEATURED_STATUS = {
    pending: 'Pembayaran unggulan menunggu konfirmasi',
    paid: 'Masuk antrian unggulan',
    active: 'Sedang tampil sebagai unggulan',
};

const PropertyCard = ({ property, mode = 'public', onAction, onFavoriteChange }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isSeller = mode === 'seller';
    const isPublic = mode === 'public';
    const canUseFavorite = !user || user.role === 'customer' || user.role === 'seller';
    const badge = STATUS_BADGE[property.status] || STATUS_BADGE.published;

    // State favorit
    const [isFavorited, setIsFavorited] = useState(property.is_favorited ?? false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        setIsFavorited(property.is_favorited ?? false);
    }, [property.is_favorited]);

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `Rp ${price.toLocaleString('id-ID')}`;
        }
        return price;
    };

    const getSellerLink = () => {
        if (property.status === 'published' && property.slug) {
            return `/property/${property.slug}`;
        }
        if (['draft', 'rejected'].includes(property.status)) {
            return `/seller/properties/${property.id}/edit`;
        }
        if (property.status === 'approved') {
            return `/seller/properties/${property.id}/pay`;
        }
        return null;
    };

    const linkTo = isSeller ? getSellerLink() : `/property/${property.slug || property.id}`;

    const imageUrl =
        property.image_main ||
        property.image ||
        property.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1600585154526-990dced4db42?q=80&w=1200&auto=format&fit=crop';

    const editCount = property.edit_count || 0;
    const maxEdit = 2;
    const sisaEdit = maxEdit - editCount;
    const bisaEdit = sisaEdit > 0;
    const linkedClassName = linkTo ? '' : 'cursor-default';
    const titleClassName = `text-[20px] font-semibold mt-3 leading-snug transition line-clamp-2 ${
        linkTo ? 'hover:text-[#d49b37]' : ''
    }`;

    const LinkedContent = ({ children, className = '' }) => {
        if (!linkTo) {
            return <div className={className || linkedClassName}>{children}</div>;
        }
        return (
            <Link to={linkTo} className={className}>
                {children}
            </Link>
        );
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Silakan login terlebih dahulu.');
            navigate('/login');
            return;
        }
        if (user.role === 'admin' || user.role === 'super_admin') {
            return;
        }
        setFavLoading(true);
        try {
            const { data } = await api.post(`/properties/${property.id}/favorite`);
            const newStatus = data.data.is_favorited;
            setIsFavorited(newStatus);
            if (onFavoriteChange) {
                onFavoriteChange(property.id, newStatus);
            }
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengubah favorit.');
        } finally {
            setFavLoading(false);
        }
    };

    return (
        <div className="bg-[#f8f4ec] rounded-[22px] overflow-hidden shadow-lg border border-[#e6dac7]">
            {/* Gambar */}
            <div className="relative h-[240px] overflow-hidden">
                <LinkedContent className={linkedClassName}>
                    <img
                        src={imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </LinkedContent>

                {/* Badge Status */}
                <div className={`absolute top-4 left-4 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide ${badge.color}`}>
                    {badge.label}
                </div>

                {/* Tombol Favorit (hanya untuk mode public dan properti published) */}
                {isPublic && property.status === 'published' && canUseFavorite && (
                    <button
                        onClick={handleFavoriteClick}
                        disabled={favLoading}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full shadow-md flex items-center justify-center text-lg transition ${
                            isFavorited
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-white/95 text-[#d85f6a] hover:scale-110'
                        } ${favLoading ? 'opacity-50 cursor-wait' : ''}`}
                        title={isFavorited ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                    >
                        {isFavorited ? '❤️' : '🤍'}
                    </button>
                )}
            </div>

            {/* Konten */}
            <div className="p-5">
                {/* Harga */}
                <h4 className="text-[#c08a2c] text-[22px] font-bold">
                    {formatPrice(property.price)}
                </h4>

                {/* Judul */}
                <LinkedContent>
                    <h5 className={titleClassName}>
                        {property.title}
                    </h5>
                </LinkedContent>

                {/* Kota & Tipe */}
                <p className="text-[#8b8478] text-[14px] mt-2">
                    {TYPE_LABEL[property.type] || property.type} • {property.city || property.location || ''}
                </p>

                {/* Info: Luas, Kamar */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e4d7c4] text-[13px] text-[#6f685d]">
                    <span>{property.land_area || '?'} m²</span>
                    <span>{property.bedrooms || '?'} Kamar</span>
                    <span>{property.bathrooms || '?'} Bath</span>
                </div>

                {/* Alasan Ditolak (Seller Only) */}
                {isSeller && property.status === 'rejected' && property.alasan_tolak && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-[13px]">
                        <strong>Alasan ditolak:</strong> {property.alasan_tolak}
                    </div>
                )}

                {/* Tombol Aksi (Seller Only) */}
                {isSeller && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#e4d7c4]">
                        {/* Draft */}
                        {property.status === 'draft' && (
                            <>
                                <button
                                    onClick={() => onAction?.('edit', property.id)}
                                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-600 transition"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => onAction?.('submit', property.id)}
                                    className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-yellow-600 transition"
                                >
                                    📤 Ajukan
                                </button>
                                <button
                                    onClick={() => onAction?.('delete', property.id)}
                                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-red-600 transition"
                                >
                                    🗑️ Hapus
                                </button>
                            </>
                        )}

                        {/* Pending */}
                        {property.status === 'pending' && (
                            <span className="text-[13px] text-gray-500 italic">
                                Menunggu verifikasi admin...
                            </span>
                        )}

                        {/* Approved */}
                        {property.status === 'approved' && (
                            <button
                                onClick={() => onAction?.('pay', property.id)}
                                className="w-full bg-green-500 text-white py-2 rounded-lg text-[14px] font-bold hover:bg-green-600 transition"
                            >
                                💰 Bayar Sekarang
                            </button>
                        )}

                        {/* Published */}
                        {property.status === 'published' && (
                            <div className="w-full space-y-2">
                                <a
                                    href={`/property/${property.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center border border-[#d49b37] text-[#d49b37] py-2 rounded-lg font-medium text-[13px] hover:bg-[#d49b37] hover:text-white transition"
                                >
                                    👁️ Lihat di Katalog
                                </a>
                                {bisaEdit ? (
                                    <button
                                        onClick={() => onAction?.('edit', property.id)}
                                        className="w-full bg-blue-500 text-white py-2 rounded-lg text-[13px] font-medium hover:bg-blue-600 transition"
                                    >
                                        ✏️ Edit (sisa {sisaEdit}x)
                                    </button>
                                ) : (
                                    <span className="block text-center text-xs text-gray-400 italic">
                                        Batas edit sudah habis
                                    </span>
                                )}
                                {/* Tombol Upgrade ke Unggulan */}
                                {property.featured_status ? (
                                    <div className="w-full bg-purple-50 border border-purple-200 text-purple-700 py-2 px-3 rounded-lg text-[13px] font-medium text-center">
                                        {FEATURED_STATUS[property.featured_status] || 'Terdaftar unggulan'}
                                        {property.featured_queue_position ? ` (#${property.featured_queue_position})` : ''}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onAction?.('featured', property.id)}
                                        className="w-full bg-purple-600 text-white py-2 rounded-lg text-[13px] font-medium hover:bg-purple-700 transition"
                                    >
                                        Upgrade ke Unggulan
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Rejected */}
                        {property.status === 'rejected' && (
                            <button
                                onClick={() => onAction?.('edit', property.id)}
                                className="w-full bg-blue-500 text-white py-2 rounded-lg text-[13px] font-medium hover:bg-blue-600 transition"
                            >
                                ✏️ Edit & Ajukan Ulang
                            </button>
                        )}
                    </div>
                )}

                {/* Tombol Detail (Public Only) */}
                {!isSeller && (
                    <Link
                        to={linkTo}
                        className="block mt-4 text-center border border-[#d49b37] text-[#d49b37] py-2 rounded-lg font-medium text-[13px] hover:bg-[#d49b37] hover:text-white transition"
                    >
                        Detail
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;
