import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPublicPropertyDetail } from '../../services/api';
import api from '../../services/api'; // untuk chat dan favorit
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const TYPE_LABEL = {
    rumah: 'Rumah', apartemen: 'Apartemen', ruko: 'Ruko', tanah: 'Tanah', gedung: 'Gedung',
};

const FASILITAS_LABEL = {
    ac: 'AC',
    wifi: 'WiFi',
    kolam_renang: 'Kolam Renang',
    taman: 'Taman',
    cctv: 'CCTV',
    security: 'Security',
    gym: 'Gym',
    balkon: 'Balkon',
    furnished: 'Furnished',
    water_heater: 'Water Heater',
};

const SUMBER_AIR_LABEL = {
    pdam: 'PDAM',
    sumur_bor: 'Sumur Bor',
    sumur_gali: 'Sumur Gali',
};

// 🆕 Fungsi untuk mendapatkan embed URL dari berbagai platform
const getEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube (watch, shorts, live, youtu.be, embed)
    const ytMatch = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo (vimeo.com/xxx)
    const vimeoMatch = url.match(
        /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/
    );
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Dailymotion (dailymotion.com/video/xxx)
    const dmMatch = url.match(
        /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/
    );
    if (dmMatch) {
        return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
    }

    // Jika tidak dikenali, kembalikan null
    return null;
};

// 🆕 Komponen kecil untuk menampilkan video embed
const VideoEmbed = ({ url }) => {
    const embedUrl = getEmbedUrl(url);

    if (!embedUrl) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm break-all">
                {url}
            </a>
        );
    }

    return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Properti"
            />
        </div>
    );
};

const PropertyDetail = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [contactLoading, setContactLoading] = useState(false);

    // State Favorit
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchPublicPropertyDetail(slug);
                const prop = data.data || data;
                setProperty(prop);
                setSelectedImage(
                    prop.image_main ||
                    prop.images?.[0]?.url ||
                    prop.images?.[0]?.path ||
                    null
                );
            } catch {
                toast.error('Properti tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    // Sinkronkan isFavorited setelah properti dimuat
    useEffect(() => {
        if (property) {
            setIsFavorited(property.is_favorited ?? false);
        }
    }, [property]);

    const formatPrice = (p) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p);

    const getImageUrl = (path) => {
        if (!path) return 'https://images.unsplash.com/photo-1600585154526-990dced4db42?w=800';
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    const handleContactSeller = async () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu.');
            navigate('/login');
            return;
        }

        if (user.role === 'admin' || user.role === 'super_admin') {
            toast.error('Admin tidak bisa menghubungi seller.');
            return;
        }

        setContactLoading(true);
        try {
            const { data } = await api.post('/chat/start', { property_id: property.id });
            navigate(`/chat?conversation=${data.conversation_id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memulai percakapan.');
        } finally {
            setContactLoading(false);
        }
    };

    // Handler Favorit
    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu.');
            navigate('/login');
            return;
        }

        if (user.role === 'admin' || user.role === 'super_admin') {
            return;
        }

        setFavoriteLoading(true);
        try {
            const { data } = await api.post(`/properties/${property.id}/favorite`);
            const newFavorited = data.data.is_favorited;
            setIsFavorited(newFavorited);
            // Update juga property object agar konsisten
            setProperty(prev => ({ ...prev, is_favorited: newFavorited }));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengubah favorit.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#efe6d5]"><Navbar /><p>Memuat...</p></div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center bg-[#efe6d5]"><Navbar /><p>Properti tidak ditemukan.</p></div>;

    const sellerStore = property.sellerProfile;
    const sellerName = property.seller?.name || sellerStore?.nama_lengkap || 'Seller';

    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-4">
                <nav className="text-sm text-gray-500">
                    <Link to="/" className="hover:text-[#C5A065]">Home</Link>
                    <span className="mx-2">/</span>
                    <Link to="/properties" className="hover:text-[#C5A065]">Properti</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#C5A065]">{property.title}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kolom Kiri: Galeri + Detail */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Gambar Utama */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={property.title}
                                className="w-full h-[400px] object-cover"
                            />
                        </div>

                        {/* Thumbnail Galeri */}
                        {property.images?.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto">
                                {property.image_main && (
                                    <img
                                        src={getImageUrl(property.image_main)}
                                        onClick={() => setSelectedImage(property.image_main)}
                                        className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 ${
                                            selectedImage === property.image_main ? 'border-[#C5A065]' : 'border-transparent'
                                        }`}
                                        alt="Gambar utama"
                                    />
                                )}
                                {property.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img.url || getImageUrl(img.path)}
                                        onClick={() => setSelectedImage(img.url || img.path)}
                                        className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 flex-shrink-0 ${
                                            selectedImage === (img.url || img.path) ? 'border-[#C5A065]' : 'border-transparent'
                                        }`}
                                        alt={`Gallery ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Container Toko */}
                        {sellerStore && (
                            <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-[#e5d8c0] flex-shrink-0">
                                        {sellerStore.foto_toko ? (
                                            <img src={sellerStore.foto_toko} className="w-full h-full object-cover" alt="Foto Toko" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">🏪</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-[#2c2c2c]">{sellerStore.nama_toko || 'Tanpa Nama Toko'}</p>
                                        <p className="text-xs text-gray-500">{sellerName}</p>
                                    </div>
                                </div>
                                <Link to={`/store/${sellerStore.id}`} className="text-sm text-[#C5A065] hover:underline font-medium flex-shrink-0">
                                    Lihat Semua &rarr;
                                </Link>
                            </div>
                        )}

                        {/* Deskripsi */}
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                            <h2 className="text-xl font-bold mb-4">Deskripsi</h2>
                            <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
                        </div>

                        {/* Spesifikasi */}
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                            <h2 className="text-xl font-bold mb-4">Spesifikasi</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {property.land_area && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.land_area} m²</p><p className="text-xs text-gray-500">Luas Tanah</p></div>}
                                {property.building_area && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.building_area} m²</p><p className="text-xs text-gray-500">Luas Bangunan</p></div>}
                                {property.bedrooms != null && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.bedrooms}</p><p className="text-xs text-gray-500">Kamar Tidur</p></div>}
                                {property.bathrooms != null && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.bathrooms}</p><p className="text-xs text-gray-500">Kamar Mandi</p></div>}
                                {property.garasi != null && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.garasi}</p><p className="text-xs text-gray-500">Garasi</p></div>}
                                {property.jumlah_lantai && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.jumlah_lantai}</p><p className="text-xs text-gray-500">Jumlah Lantai</p></div>}
                                {property.tahun_dibangun && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{property.tahun_dibangun}</p><p className="text-xs text-gray-500">Tahun Dibangun</p></div>}
                                {property.sumber_air && <div className="text-center p-3 bg-[#faf7f0] rounded-lg"><p className="text-2xl font-bold text-[#C5A065]">{SUMBER_AIR_LABEL[property.sumber_air] || property.sumber_air}</p><p className="text-xs text-gray-500">Sumber Air</p></div>}
                            </div>
                        </div>

                        {/* Fasilitas */}
                        {property.fasilitas && property.fasilitas.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                <h2 className="text-xl font-bold mb-4">Fasilitas</h2>
                                <div className="flex flex-wrap gap-2">
                                    {property.fasilitas.map((f, i) => (
                                        <span key={i} className="px-3 py-1 bg-[#faf7f0] text-[#C5A065] rounded-full text-sm border border-[#e5d8c0]">
                                            ✅ {FASILITAS_LABEL[f] || f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video */}
                        {(property.video_path || property.youtube_url) && (
                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                <h2 className="text-xl font-bold mb-4">Video Properti</h2>

                                {property.video_type === 'upload' && property.video_path && (
                                    <video controls className="w-full rounded-lg" style={{ maxHeight: '400px' }}>
                                        <source src={property.video_path} type="video/mp4" />
                                        Browser Anda tidak mendukung pemutaran video.
                                    </video>
                                )}

                                {property.video_type === 'youtube' && property.youtube_url && (
                                    <VideoEmbed url={property.youtube_url} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Kolom Kanan: Info Properti + Seller */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    property.status_jual === 'dijual' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {property.status_jual === 'dijual' ? '🟢 Dijual' : '🔴 Terjual'}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-[#c08a2c] mb-4">{formatPrice(property.price)}</p>
                            <h1 className="text-xl font-bold mb-3">{property.title}</h1>
                            <div className="space-y-2 mb-4 text-sm text-gray-600">
                                <p>🏷️ {TYPE_LABEL[property.type] || property.type}</p>
                                <p>📍 {property.address}, {property.city}, {property.province}</p>
                                <p>👁️ {property.views_count || 0} kali dilihat</p>
                                <p>📅 {new Date(property.published_at).toLocaleDateString('id-ID')}</p>
                            </div>
                            <button
                                onClick={handleContactSeller}
                                disabled={contactLoading}
                                className="w-full bg-[#d49b37] text-white py-3 rounded-xl font-bold text-lg mb-2 hover:bg-[#c08a2c] transition disabled:opacity-50">
                                {contactLoading ? 'Memproses...' : '💬 Hubungi Seller'}
                            </button>
                            {/* Tombol Favorit */}
                            <button
                                onClick={handleToggleFavorite}
                                disabled={favoriteLoading}
                                className={`w-full border py-3 rounded-xl font-bold text-lg transition ${
                                    isFavorited
                                        ? 'bg-red-50 border-red-400 text-red-500'
                                        : 'border-[#d49b37] text-[#d49b37] hover:bg-[#d49b37] hover:text-white'
                                } disabled:opacity-50`}
                            >
                                {favoriteLoading ? 'Memproses...' : isFavorited ? '❤️ Tersimpan' : '🤍 Simpan ke Favorit'}
                            </button>
                        </div>

                        {property.seller && (
                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                <h3 className="text-lg font-bold mb-4">Informasi Seller</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-[#C5A065] flex items-center justify-center text-white font-bold text-lg">
                                        {property.seller.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{property.seller.name}</p>
                                        <p className="text-xs text-gray-500">{property.seller.email}</p>
                                    </div>
                                </div>
                                {sellerStore?.nama_toko && <p className="text-sm text-gray-600 mt-2">🏪 {sellerStore.nama_toko}</p>}
                                {sellerStore?.deskripsi && <p className="text-sm text-gray-500 mt-2">{sellerStore.deskripsi}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PropertyDetail;

