// resources/js/components/common/PropertyCard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

// Import Icon Modern dari Lucide React
import { 
    Maximize2, 
    BedDouble, 
    Bath, 
    Heart,
    MapPin,
    Eye, 
    Pencil, 
    UploadCloud, 
    Trash2, 
    Clock, 
    Coins, 
    Sparkles,
    Lock,
    CheckCircle2,
    Tag
} from 'lucide-react';

const STATUS_BADGE = {
    draft: { color: 'bg-gray-400', label: 'Draft' },
    pending: { color: 'bg-amber-500', label: 'Menunggu Moderasi' },
    approved: { color: 'bg-emerald-600', label: 'Menunggu Pembayaran' },
    published: { color: 'bg-emerald-600', label: 'DIJUAL' },
    rejected: { color: 'bg-red-500', label: 'Ditolak' },
};

const getPropertyBadge = (property) => {
    if (property.status === 'published') {
        if (property.status_jual === 'terjual') {
            return { color: 'bg-red-600', label: 'TERJUAL' };
        }
        return { color: 'bg-emerald-600', label: 'DIJUAL' };
    }
    return STATUS_BADGE[property.status] || { color: 'bg-emerald-600', label: 'DIJUAL' };
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
    const badge = getPropertyBadge(property);

    // State favorit
    const [isFavorited, setIsFavorited] = useState(property.is_favorited ?? false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        setIsFavorited(property.is_favorited ?? false);
    }, [property.is_favorited]);

    const formatPrice = (price) => {
        const numericPrice = Number(price);
        if (!Number.isNaN(numericPrice)) {
            return `Rp ${numericPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
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

    if (isPublic) {
        return (
            <article className="group overflow-hidden rounded-xl border border-[#e8d3a6] bg-white shadow-[0_8px_18px_rgba(86,63,24,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(86,63,24,0.11)]">
                <div className="relative h-[184px] overflow-hidden">
                    <LinkedContent className="block h-full">
                        <img
                            src={imageUrl}
                            alt={property.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    </LinkedContent>

                    <div className={`absolute left-3 top-3 rounded-md px-3 py-1.5 text-[10px] font-bold tracking-wide leading-none text-white shadow-sm uppercase ${
                        property.status_jual === 'terjual' ? 'bg-red-600' : 'bg-[#d9a441]'
                    }`}>
                        {property.status_jual === 'terjual' ? 'TERJUAL' : 'DIJUAL'}
                    </div>

                    {property.status === 'published' && canUseFavorite && (
                        <button
                            type="button"
                            onClick={handleFavoriteClick}
                            disabled={favLoading}
                            className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#d85f6a] shadow-sm ring-1 ring-[#ecd7bf] transition hover:scale-105 ${
                                favLoading ? 'cursor-wait opacity-60' : ''
                            }`}
                            title={isFavorited ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                        >
                            <Heart className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.8} />
                        </button>
                    )}
                </div>

                <div className="min-h-[146px] px-4 pb-4 pt-5 text-center">
                    <p className="text-[12px] font-semibold leading-none text-[#c49a4a]">
                        {formatPrice(property.price)}
                    </p>

                    <LinkedContent>
                        <h3 className="mt-4 line-clamp-2 min-h-[34px] text-[14px] font-semibold leading-[1.25] text-[#2f2a22] transition hover:text-[#c49a4a]">
                            {property.title}
                        </h3>
                    </LinkedContent>

                    <p className="mt-3 flex items-center justify-center gap-1 text-[9px] font-medium text-[#8b8478]">
                        <MapPin className="h-3 w-3 text-[#a79b89]" />
                        <span className="truncate">
                            {[property.city || property.location, property.province].filter(Boolean).join(', ')}
                        </span>
                    </p>
                </div>
            </article>
        );
    }

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

                {/* Tombol Favorit */}
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

                {/* Info Spek Rumah: Menggunakan Icon Modern Lucide */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e4d7c4] text-[13px] text-[#8b8478]">
                    <span className="flex items-center gap-1.5">
                        <Maximize2 className="w-4 h-4 text-[#c08a2c]/80" /> 
                        {property.land_area || '?'} m²
                    </span>
                    <span className="flex items-center gap-1.5">
                        <BedDouble className="w-4 h-4 text-[#c08a2c]/80" /> 
                        {property.bedrooms || '?'} Kamar
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-[#c08a2c]/80" /> 
                        {property.bathrooms || '?'} Bath
                    </span>
                </div>

                {/* Alasan Ditolak */}
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
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAction?.('edit', property.id);
                                    }}
                                    className="flex items-center gap-1.5 bg-[#c08a2c] text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#a37222] transition"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAction?.('submit', property.id);
                                    }}
                                    className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-amber-600 transition"
                                >
                                    <UploadCloud className="w-3.5 h-3.5" /> Ajukan
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAction?.('delete', property.id);
                                    }}
                                    className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-red-600 transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                            </>
                        )}

                        {/* Pending */}
                        {property.status === 'pending' && (
                            <span className="flex items-center gap-1.5 text-[13px] text-amber-700/70 italic font-medium py-1">
                                <Clock className="w-4 h-4 animate-pulse" /> Menunggu verifikasi admin...
                            </span>
                        )}

                        {/* Approved */}
                        {property.status === 'approved' && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAction?.('pay', property.id);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg text-[14px] font-bold hover:bg-emerald-700 transition shadow-sm"
                            >
                                <Coins className="w-4 h-4" /> Bayar Sekarang
                            </button>
                        )}

                        {/* Published */}
                        {property.status === 'published' && (
                            <div className="w-full space-y-2">
                                <a
                                    href={`/property/${property.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full text-center border border-[#d49b37] text-[#d49b37] py-2 rounded-lg font-medium text-[13px] hover:bg-[#d49b37] hover:text-white transition"
                                >
                                    <Eye className="w-4 h-4" /> Lihat di Katalog
                                </a>
                                {bisaEdit ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onAction?.('edit', property.id);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-[#c08a2c] text-white py-2 rounded-lg text-[13px] font-medium hover:bg-[#a37222] transition"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit (sisa {sisaEdit}x)
                                    </button>
                                ) : (
                                    <span className="flex items-center justify-center gap-1.5 w-full text-center text-xs text-gray-400 italic py-1">
                                        <Lock className="w-3.5 h-3.5" /> Batas edit sudah habis
                                    </span>
                                )}
                                
                                {property.status_jual === 'terjual' ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onAction?.('toggle_status_jual', property.id);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-2 rounded-lg text-[13px] font-medium hover:bg-emerald-700 transition"
                                    >
                                        <Tag className="w-4 h-4" /> Ubah ke "Dijual"
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onAction?.('toggle_status_jual', property.id);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2 rounded-lg text-[13px] font-medium hover:bg-red-700 transition"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Tandai "Terjual"
                                    </button>
                                )}

                                {/* Status Unggulan / Tombol Upgrade (Tema Emas Premium) */}
                                {property.featured_status ? (
                                    <div className="flex items-center justify-center gap-1.5 w-full bg-amber-50 border border-amber-200 text-amber-800 py-2 px-3 rounded-lg text-[13px] font-medium text-center">
                                        <Sparkles className="w-4 h-4 text-[#d49b37] animate-pulse" />
                                        <span>
                                            {FEATURED_STATUS[property.featured_status] || 'Terdaftar unggulan'}
                                            {property.featured_queue_position ? ` (#${property.featured_queue_position})` : ''}
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onAction?.('featured', property.id);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-amber-600 text-white py-2 rounded-lg text-[13px] font-medium hover:bg-amber-700 transition"
                                    >
                                        <Sparkles className="w-4 h-4" /> Upgrade ke Unggulan
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Rejected */}
                        {property.status === 'rejected' && (
                            <button
                                onClick={() => onAction?.('edit', property.id)}
                                className="flex items-center justify-center gap-2 w-full bg-[#c08a2c] text-white py-2 rounded-lg text-[13px] font-medium hover:bg-[#a37222] transition"
                            >
                                <Pencil className="w-4 h-4" /> Edit & Ajukan Ulang
                            </button>
                        )}
                    </div>
                )}

                {/* Tombol Detail (Public Only) */}
                {!isSeller && (
                    <Link
                        to={linkTo}
                        className="flex items-center justify-center gap-1.5 block mt-4 text-center border border-[#d49b37] text-[#d49b37] py-2 rounded-lg font-medium text-[13px] hover:bg-[#d49b37] hover:text-white transition"
                    >
                        Detail
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;
