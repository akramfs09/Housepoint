import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPublicPropertyDetail } from '../../services/api';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ShareModal from '../../components/common/ShareModal';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

// Komponen Ikon SVG Modern
const IconArea = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>;
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconDoc = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconBolt = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconCar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="8" rx="2" ry="2"/><path d="M5 11l1.5-4.5h11L19 11M9 15h.01M15 15h.01"/></svg>;
const IconPool = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 16h20M2 20h20M12 4a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"/></svg>;
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconWifi = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>;
const IconTree = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-6M8 16l4-6 4 6M10 10l2-4 2 4M12 2a4 4 0 0 0-4 4c0 1.5 1 3 2 4"/></svg>;
const IconMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconHeart = ({ solid }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={solid ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconShare = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;

const PropertyDetail = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Detail');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShareClick = async () => {
        const shareUrl = window.location.href;
        const formattedPrice = property?.price 
            ? `Rp ${Number(property.price).toLocaleString('id-ID', { maximumFractionDigits: 0 })}` 
            : '';
        const shareText = `Halo! Cek properti "${property?.title || 'ini'}" (${formattedPrice}) di HousePoint:`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: property?.title || 'Detail Properti',
                    text: shareText,
                    url: shareUrl,
                });
                return;
            } catch {
                // User membatal share native atau error -> tampilkan custom ShareModal
            }
        }
        setIsShareModalOpen(true);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data } = await fetchPublicPropertyDetail(slug);
                const prop = data.data || data;
                setProperty(prop);
                setIsFavorited(prop.is_favorited ?? false);

                try {
                    const recRes = await api.get(`/properties?city=${prop.city}&per_page=4`);
                    const recList = recRes.data?.data?.data || recRes.data?.data || [];
                    setRecommendations(recList.filter(p => p.id !== prop.id).slice(0, 4));
                } catch (e) {
                    console.error("Gagal memuat rekomendasi", e);
                }
            } catch {
                toast.error('Properti tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

    const formatPrice = (p) => {
        if (!p) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p).replace('IDR', 'Rp');
    };

    const getVideoEmbedUrl = () => {
        if (!property) return null;

        if (property.video_type === 'youtube' && property.youtube_url) {
            const url = property.youtube_url;

            try {
                const parsed = new URL(url);
                const videoId =
                    parsed.searchParams.get('v') ||
                    parsed.pathname.split('/').filter(Boolean).pop();

                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
                }
            } catch {
                const match = url.match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:\?|&|$)/);
                if (match?.[1]) {
                    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
                }
            }
        }

        if (property.video_path) {
            return property.video_path.startsWith('http')
                ? property.video_path
                : `/storage/${property.video_path}`;
        }

        return null;
    };

    const getGalleryMedia = () => {
        if (!property) return [];
        const list = [];

        const videoUrl = getVideoEmbedUrl();
        if (videoUrl) {
            list.push({
                type: property.video_type === 'youtube' ? 'youtube' : 'video',
                src: videoUrl,
                title: property.video_type === 'youtube' ? 'Video YouTube' : 'Video Properti',
            });
        }

        if (property.image_main) {
            list.push({
                type: 'image',
                src: property.image_main,
                title: 'Gambar Utama',
            });
        }

        if (property.images && property.images.length > 0) {
            property.images.forEach(img => {
                const path = img.url || img.path;
                if (path && path !== property.image_main) {
                    list.push({
                        type: 'image',
                        src: path,
                        title: `Foto ${img.order || list.length + 1}`,
                    });
                }
            });
        }

        if (list.length === 0) {
            list.push({
                type: 'image',
                src: 'https://images.unsplash.com/photo-1600585154526-990dced4db42?w=1200',
                title: 'Foto Properti',
            });
        }

        return list;
    };

    const media = getGalleryMedia();

    const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % media.length);
    const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + media.length) % media.length);

    // ================= EFFECT AUTO-SLIDE =================
    useEffect(() => {
        if (media.length <= 1) return;

        const interval = setInterval(() => {
            if (isVideoPlaying) return;
            nextImage();
        }, 20000); // Berganti setiap 20 detik

        return () => clearInterval(interval); // Hapus interval saat unmount atau kondisi berubah
    }, [media.length, currentImgIndex, isVideoPlaying]);

    useEffect(() => {
        setIsVideoPlaying(false);
    }, [currentImgIndex]);

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

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu.');
            navigate('/login');
            return;
        }
        setFavoriteLoading(true);
        try {
            const { data } = await api.post(`/properties/${property.id}/favorite`);
            setIsFavorited(data.data.is_favorited);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengubah favorit.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF5E2] text-[#A8A29E] font-sans font-medium">Memuat detail properti eksklusif...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center bg-[#FDF5E2] text-[#A8A29E] font-sans font-medium">Properti tidak ditemukan.</div>;

    const sellerAgen = property.sellerProfile;
    const sellerName = sellerAgen?.nama_agen || property.seller?.name || 'Agen Terpercaya';
    const sellerEmail = property.seller?.email || 'tidak_ada_email@mail.com';
    const sellerPhone = property.seller?.phone || sellerAgen?.no_hp || 'Tidak ada nomor';
    const mapQuery = property.gmaps_query || [property.address, property.city, property.province].filter(Boolean).join(', ') || 'Menteng Jakarta';
    const mapEmbedUrl = property.gmaps_url?.includes('/embed')
        ? property.gmaps_url
        : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const openMapUrl = property.gmaps_url || `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`;
    const currentMedia = media[currentImgIndex] || media[0];
    const isActiveVideo = currentMedia?.type === 'video' || currentMedia?.type === 'youtube';

    return (
        <div className="min-h-screen bg-[#FDF5E2] text-[#1F1B15] font-sans antialiased selection:bg-[#D4A44C] selection:text-white pb-20">
            <Navbar />

            {/* ================= HEADER TITLE ================= */}
            <div className="max-w-[1280px] mx-auto pt-10 pb-6 px-4 md:px-8 flex justify-between items-end">
                <h1 className="text-3xl md:text-5xl font-bold text-[#D4A44C]">{property.title}</h1>
                <Link to="/properties" className="text-sm font-medium text-[#78716C] hover:text-[#D4A44C] flex items-center gap-2 transition-colors mb-2">
                    ← Kembali ke Properti
                </Link>
            </div>

            {/* ================= MAIN SLIDER ================= */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-8">
                <div className="relative aspect-[1280/500] w-full rounded-[12px] overflow-hidden bg-white shadow-lg">
                    {currentMedia?.type === 'image' ? (
                        <img
                            src={currentMedia.src.startsWith('http') ? currentMedia.src : `/storage/${currentMedia.src}`}
                            alt={currentMedia.title || property.title}
                            className="w-full h-full object-cover transition-opacity duration-500"
                        />
                    ) : currentMedia?.type === 'youtube' ? (
                        <iframe
                            src={currentMedia.src}
                            title={currentMedia.title || property.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : currentMedia?.type === 'video' ? (
                        <video
                            src={currentMedia.src}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onEnded={() => setIsVideoPlaying(false)}
                        />
                    ) : null}
                    
                    {/* Badge Dijual */}
                    <span className="absolute top-6 left-6 bg-[#F7A700] text-white font-bold text-sm px-5 py-2 rounded-xl shadow-md">
                        {property.status_jual === 'dijual' ? 'Dijual' : 'Terjual'}
                    </span>

                    {/* Image Counter */}
                    <span className="absolute top-6 right-6 bg-[#1F1B15]/60 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                        {currentImgIndex + 1} / {media.length}
                    </span>

                    {isActiveVideo && (
                        <span className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            {isVideoPlaying ? 'Video sedang diputar' : 'Video aktif'}
                        </span>
                    )}

                    {/* Navigation Arrows */}
                    <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1F1B15] shadow-lg hover:bg-[#FDF5E2] transition-colors border border-gray-100 z-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1F1B15] shadow-lg hover:bg-[#FDF5E2] transition-colors border border-gray-100 z-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>

                {/* ================= THUMBNAILS ROW ================= */}
                <div className="w-full flex justify-between gap-4 md:gap-6 py-4 mt-2 overflow-x-auto scrollbar-none items-center">
                    {media.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentImgIndex(i)}
                            className={`flex-1 flex-shrink-0 min-w-[100px] h-[100px] md:min-w-[150px] md:h-[160px] lg:h-[180px] rounded-[20px] overflow-hidden transition-all duration-300 border-[3.5px] bg-white ${
                                i === currentImgIndex 
                                    ? 'border-[#D4A44C] shadow-md scale-[1.02]' 
                                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#D4A44C]'
                            }`}
                        >
                            {item.type === 'image' ? (
                                <img 
                                    src={item.src.startsWith('http') ? item.src : `/storage/${item.src}`} 
                                    className="w-full h-full object-cover" 
                                    alt={`Thumbnail ${i + 1}`} 
                                />
                            ) : (
                                <div className="relative h-full w-full bg-[#111827]">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                                            {item.type === 'youtube' ? 'Video YouTube' : 'Video'}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ================= CONTENT GRID ================= */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 md:gap-12 items-start">
                    
                    {/* ===== LEFT COLUMN (Details) ===== */}
                    <div className="space-y-10">
                        
                        {/* Tab Menu */}
                        <div className="bg-white rounded-xl flex border border-[#D4A44C] shadow-sm max-w-2xl overflow-hidden">
                            {['Detail', 'Deskripsi', 'Fasilitas', 'Lokasi'].map((tab) => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 text-center py-4 text-sm font-semibold transition-all relative ${
                                        activeTab === tab ? 'text-[#D4A44C]' : 'text-[#78716C] hover:text-[#1F1B15] bg-[#FDF5E2]/30'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#D4A44C] rounded-t-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Spesifikasi Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { label: 'LUAS TANAH', value: `${property.land_area || '450'} m²`, icon: <IconArea /> },
                                { label: 'LUAS BANGUNAN', value: `${property.building_area || '320'} m²`, icon: <IconHome /> },
                                { label: 'SERTIFIKAT', value: property.certificate || 'SHM', icon: <IconDoc /> },
                                { label: 'LISTRIK', value: `${property.electricity || '5500'} VA`, icon: <IconBolt /> },
                                { label: 'TAHUN BANGUN', value: property.tahun_dibangun || '2021', icon: <IconCalendar /> },
                                { label: 'GARASI', value: `${property.garasi || '2'} Mobil`, icon: <IconCar /> },
                            ].map((spec, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm flex flex-col justify-center">
                                    <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">{spec.label}</p>
                                    <div className="flex items-center gap-3 text-[#1F1B15] font-bold text-base">
                                        <span className="text-[#D4A44C]">{spec.icon}</span> 
                                        {spec.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-[#1F1B15]">Tentang Properti Ini</h2>
                            <p className="text-[15px] text-[#595959] leading-relaxed whitespace-pre-line">
                                {property.description || 'Rasakan kemewahan hunian di jantung Menteng. Vila modern ini menawarkan desain asimetris yang menawan dengan sentuhan kontemporer yang tetap mempertahankan kehangatan rumah tinggal. Dilengkapi dengan kolam renang pribadi, taman vertikal yang asri, dan sistem pintar (Smart Home) terbaru.\n\nSetiap ruangan dirancang dengan material premium, mulai dari lantai marmer Carrara hingga kitchen set bespoke. Lokasi sangat strategis, hanya beberapa menit dari pusat bisnis dan sekolah internasional terbaik di Jakarta.'}
                            </p>
                        </div>

                        {/* Fasilitas */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-[#1F1B15]">Fasilitas Utama</h3>
                            <div className="flex flex-wrap items-center gap-8 text-[15px] text-[#595959] font-medium">
                                <div className="flex items-center gap-3"><span className="text-[#D4A44C]"><IconPool /></span> Kolam Renang</div>
                                <div className="flex items-center gap-3"><span className="text-[#D4A44C]"><IconShield /></span> Keamanan 24 Jam</div>
                                <div className="flex items-center gap-3"><span className="text-[#D4A44C]"><IconWifi /></span> Wi-Fi & Smart Home</div>
                                <div className="flex items-center gap-3"><span className="text-[#D4A44C]"><IconTree /></span> Taman Pribadi</div>
                            </div>
                        </div>

                        {/* Lokasi Map */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-[#1F1B15]">Lokasi Strategis</h3>
                            <div className="relative w-full max-w-[706px] h-[400px] bg-[#E7E5E4] rounded-[24px] overflow-hidden border border-[#D3C4B2]">
                                <iframe 
                                    className="w-full h-full"
                                    title="Peta Lokasi"
                                    src={mapEmbedUrl}
                                    frameBorder="0" scrolling="no"
                                ></iframe>
                                <a 
                                    href={openMapUrl}
                                    target="_blank" rel="noopener noreferrer"
                                    className="absolute bottom-6 right-6 bg-[#D4A44C] hover:bg-[#c2933e] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2"
                                >
                                    <IconMapPin /> Buka di Google Maps
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* ===== RIGHT COLUMN (Cards) ===== */}
                    <div className="space-y-6 lg:sticky top-28">
                        
                        {/* KARTU 1: HARGA */}
                        <div className="bg-white rounded-[24px] p-8 border border-[#D4A44C] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#1F1B15] mb-2">{property.title || 'Menteng Royal Villa'}</h2>
                                    <p className="text-sm text-[#78716C] flex items-center gap-1.5">
                                        <span className="text-[#A8A29E]"><IconMapPin /></span> 
                                        {property.city || 'Menteng, Jakarta Pusat'}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleToggleFavorite}
                                    disabled={favoriteLoading}
                                    className="text-[#BA1A1A] hover:bg-red-50 p-2 rounded-full transition-colors"
                                >
                                    <IconHeart solid={isFavorited} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs font-semibold text-[#A8A29E] mb-1">Harga Penawaran</p>
                                <p className="text-3xl font-bold text-[#D4A44C] tracking-tight">{formatPrice(property.price || 12500000000)}</p>
                            </div>

                            <button
                                onClick={handleContactSeller}
                                disabled={contactLoading}
                                className="w-full bg-white border-2 border-[#D4A44C] hover:bg-[#FDF5E2] text-[#D4A44C] py-3.5 rounded-xl text-[15px] font-bold transition-colors mb-3"
                            >
                                {contactLoading ? 'Menghubungkan...' : 'Chat Agen'}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <a href={`mailto:${sellerEmail}`} className="bg-white border border-[#D3C4B2] hover:bg-[#FDF5E2] text-[#595959] py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <IconMail /> Email
                                </a>
                                <button type="button" onClick={handleShareClick} className="bg-white border border-[#D3C4B2] hover:bg-[#FDF5E2] text-[#595959] py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <IconShare /> Bagikan
                                </button>
                            </div>
                        </div>

                        {/* KARTU 2: PENJUAL */}
                        <div className="bg-white rounded-[24px] p-8 border border-[#D4A44C] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-lg font-bold text-[#1F1B15] text-center mb-6">Informasi Agen</h3>
                            
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-[80px] h-[80px] rounded-full bg-[#E7E5E4] overflow-hidden flex-shrink-0">
                                    {sellerAgen?.foto_agen ? (
                                        <img src={sellerAgen.foto_agen} className="w-full h-full object-cover" alt="Foto Agen" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#A8A29E]">
                                            <IconArea />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-[#1F1B15] mb-1">{sellerName}</p>
                                    <p className="text-sm text-[#78716C] mb-3">Agen Properti</p>
                                    <div className="space-y-1.5 text-sm text-[#1F1B15] font-medium">
                                        <div className="flex items-center gap-2"><IconPhone /> {sellerPhone}</div>
                                        <div className="flex items-center gap-2 break-all"><IconMail /> {sellerEmail}</div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => sellerAgen?.id && navigate(`/agen/${sellerAgen.id}`)}
                                className="w-full bg-white border border-[#D3C4B2] text-[#595959] hover:border-[#D4A44C] hover:text-[#D4A44C] py-3.5 rounded-xl text-[15px] font-semibold transition-colors"
                            >
                                Lihat Detail Agen
                            </button>
                        </div>

                    </div>
                </div>

                {/* ================= REKOMENDASI ================= */}
                <div className="mt-20 pt-10 border-t border-[#D3C4B2]/40">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-[11px] font-bold text-[#D4A44C] uppercase tracking-widest block mb-2">Rekomendasi</span>
                            <h3 className="text-3xl font-bold text-[#1F1B15]">Properti Serupa</h3>
                        </div>
                        <Link to="/properties" className="text-sm font-semibold text-[#D4A44C] hover:underline flex items-center gap-1">
                            Lihat Semua <span>→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recommendations.length > 0 ? (
                            recommendations.map(p => (
                                <Link to={`/property/${p.slug}`} key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E7E5E4] group block">
                                    <div className="h-[206px] w-full relative bg-[#E7E5E4]">
                                        <img src={p.image_main?.startsWith('http') ? p.image_main : `/storage/${p.image_main}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} />
                                        <span className="absolute top-4 left-4 bg-[#F7A700] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">Dijual</span>
                                        <button className="absolute top-4 right-4 text-[#BA1A1A] bg-white/80 backdrop-blur p-1.5 rounded-full">
                                            <IconHeart />
                                        </button>
                                    </div>
                                    <div className="p-5 text-center">
                                        <p className="text-lg font-bold text-[#D4A44C] mb-1">{formatPrice(p.price)}</p>
                                        <h4 className="text-sm font-bold text-[#1F1B15] truncate mb-2">{p.title}</h4>
                                        <p className="text-xs text-[#78716C] font-medium flex justify-center items-center gap-1">
                                            <IconMapPin /> {p.city}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-sm text-[#A8A29E] font-medium bg-white rounded-2xl border border-[#E7E5E4]">
                                Belum ada properti serupa saat ini.
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            <div className="h-16"></div>
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} property={property} />
            <Footer />
        </div>
    );
};

export default PropertyDetail;
