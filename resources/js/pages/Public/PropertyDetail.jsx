import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPublicPropertyDetail } from '../../services/api';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const TYPE_LABEL = {
    rumah: 'Rumah', apartemen: 'Apartemen', ruko: 'Ruko', tanah: 'Tanah', gedung: 'Gedung',
};

const PropertyDetail = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [contactLoading, setContactLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Detail');

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

    const getAllImages = () => {
        if (!property) return [];
        const list = [];
        if (property.image_main) list.push(property.image_main);
        if (property.images && property.images.length > 0) {
            property.images.forEach(img => {
                const path = img.url || img.path;
                if (path && path !== property.image_main) list.push(path);
            });
        }
        if (list.length === 0) list.push('https://images.unsplash.com/photo-1600585154526-990dced4db42?w=1200');
        return list;
    };

    const images = getAllImages();

    const nextImage = () => {
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // ================= LOGIKA AUTO SLIDE BERGANTI SETIAP 3 DETIK =================
    useEffect(() => {
        // Jangan jalankan timer jika gambar hanya ada 1 atau sedang loading
        if (images.length <= 1) return;

        const slideInterval = setInterval(() => {
            nextImage();
        }, 3000); // 3000 ms = 3 detik

        // Bersihkan interval saat komponen di-unmount atau indeks gambar berubah manual
        return () => clearInterval(slideInterval);
    }, [currentImgIndex, images.length]);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE] text-gray-400 font-medium text-sm">Memuat detail properti eksklusif...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE] text-gray-400 font-medium text-sm">Properti tidak ditemukan.</div>;

    const sellerStore = property.sellerProfile;
    const sellerName = property.seller?.name || sellerStore?.nama_lengkap || 'Agen Terpercaya';

    return (
        <div className="min-h-screen bg-[#FAF6EE] text-[#2c2c2c] font-sans antialiased text-left selection:bg-amber-100">
            <Navbar />

            {/* ================= ATASAN JUDUL UTAMA ================= */}
            <div className="max-w-[1240px] mx-auto pt-8 pb-4 px-4 flex justify-between items-center border-b border-gray-200/50">
                <h1 className="text-2xl sm:text-3xl font-black text-[#93702d] tracking-tight">{property.title}</h1>
                <Link to="/properties" className="text-xs font-bold text-gray-400 hover:text-amber-700 flex items-center gap-1.5 transition-colors">
                    ← Kembali ke Properti
                </Link>
            </div>

            <div className="max-w-[1240px] mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* ================= KOLOM KIRI: SLIDER & DETAIL KONTEN ================= */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Main Image Slider Container */}
                        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-sm bg-black">
                            <img
                                src={images[currentImgIndex].startsWith('http') ? images[currentImgIndex] : `/storage/${images[currentImgIndex]}`}
                                alt={property.title}
                                className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                            />
                            
                            {/* Badge Status */}
                            <span className="absolute top-4 left-4 bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm">
                                {property.status_jual === 'dijual' ? 'Dijual' : 'Terjual'}
                            </span>

                            {/* Info Index Angka */}
                            <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                {currentImgIndex + 1} / {images.length}
                            </span>

                            {/* Tombol Panah Kiri */}
                            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow hover:bg-amber-50 transition-all z-10">‹</button>

                            {/* Tombol Panah Kanan */}
                            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow hover:bg-amber-50 transition-all z-10">›</button>
                        </div>

                        {/* Strip Thumbnail Row */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImgIndex(i)}
                                    className={`w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                                        i === currentImgIndex ? 'border-[#93702d] scale-[1.02]' : 'border-transparent opacity-70'
                                    }`}
                                >
                                    <img src={img.startsWith('http') ? img : `/storage/${img}`} className="w-full h-full object-cover" alt="Thumbnail" />
                                </button>
                            ))}
                        </div>

                        {/* Tab Menu Bar Minimalis */}
                        <div className="bg-white rounded-xl p-1 flex gap-1 border border-gray-100 shadow-sm max-w-lg">
                            {['Detail', 'Deskripsi', 'Fasilitas', 'Lokasi'].map((tab) => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 text-center py-2.5 text-[11px] font-bold transition-all relative ${
                                        activeTab === tab ? 'text-[#93702d]' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#93702d] rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Grid Spesifikasi Utama */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100/70 shadow-sm space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Luas Tanah</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg className="w-4 h-4 text-[#C5A065]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    <p className="text-xs sm:text-sm font-black">{property.land_area || '450'} m²</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100/70 shadow-sm space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Luas Bangunan</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg className="w-4 h-4 text-[#C5A065]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    <p className="text-xs sm:text-sm font-black">{property.building_area || '320'} m²</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100/70 shadow-sm space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sertifikat</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg className="w-4 h-4 text-[#C5A065]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-xs sm:text-sm font-black">{property.certificate || 'SHM'}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100/70 shadow-sm space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Listrik</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg className="w-4 h-4 text-[#C5A065]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <p className="text-xs sm:text-sm font-black">{property.electricity || '5500'} VA</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100/70 shadow-sm space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tahun Bangun</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg className="w-4 h-4 text-[#C5A065]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-xs sm:text-sm font-black">{property.tahun_dibangun || '2021'}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100/70 shadow-sm space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Garasi</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <svg className="w-4 h-4 text-[#C5A065]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2m-9-2v-6m0 6l-9 2m9-2V9m0 0a4 4 0 110-8 4 4 0 010 8zM2 14.5a3.5 3.5 0 117 0V17H2v-2.5m13 2.5V14.5a3.5 3.5 0 117 0V17h-7z" /></svg>
                                    <p className="text-xs sm:text-sm font-black">{property.garasi || '2'} Mobil</p>
                                </div>
                            </div>
                        </div>

                        {/* Section Deskripsi */}
                        <div className="space-y-3">
                            <h2 className="text-base font-black tracking-tight text-gray-800">Tentang Properti Ini</h2>
                            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line text-justify font-medium">
                                {property.description || 'Rasakan kemewahan hunian di jantung Menteng. Vila modern ini menawarkan desain asimetris yang menawan dengan sentuhan kontemporer.'}
                            </p>
                        </div>

                        {/* Section Fasilitas */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-base font-black text-gray-800 tracking-tight">Fasilitas Utama</h3>
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs text-[#555555] font-semibold">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#785b1d]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0-3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-9 9.5c0-.83.67-1.5 1.5-1.5h15c.83 0 1.5.67 1.5 1.5v.5H3v-.5Zm1.5 2c0 .55.45 1 1 1h13c.55 0 1-.45 1-1v-.5H4.5v.5Z"/>
                                        <path fillRule="evenodd" d="M2 13.5a2.5 2.5 0 0 1 4.3-.18c.3.36.75.68 1.2.68.45 0 .9-.32 1.2-.68a2.5 2.5 0 0 1 4.6 0c.3.36.75.68 1.2.68.45 0 .9-.32 1.2-.68a2.5 2.5 0 0 1 4.3.18V15h-1.55a1 1 0 0 0-1.7-.12c-.23.27-.52.62-.95.62s-.72-.35-.95-.62a1 1 0 0 0-1.7-.12c-.23.27-.52.62-.95.62s-.72-.35-.95-.62a1 1 0 0 0-1.7-.12c-.23.27-.52.62-.95.62s-.72-.35-.95-.62a1 1 0 0 0-1.7-.12H2v-1.5Z" clipRule="evenodd"/>
                                    </svg>
                                    <span>Kolam Renang</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#785b1d]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2S4.5 4.5 4.5 9.5c0 5 4.8 9.8 7.5 11.5 2.7-1.7 7.5-6.5 7.5-11.5C19.5 4.5 12 2 12 2Zm0 17.4V3.7c4.6 1.8 6 4.7 6 5.8 0 3.7-3.4 7.4-6 8.9Z"/>
                                    </svg>
                                    <span>Keamanan 24 Jam</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#785b1d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 13a11.5 11.5 0 0 1 14 0" />
                                        <path d="M8.5 16.5a6.5 6.5 0 0 1 7 0" />
                                        <rect x="2" y="18" width="20" height="4" rx="1" fill="currentColor" />
                                        <circle cx="12" cy="12" r="1" fill="currentColor"/>
                                    </svg>
                                    <span>Wi-Fi & Smart Home</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#785b1d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18v14H3V6Z" />
                                        <path d="M7 6v14M11 6v14M15 6v14M19 6v14" />
                                        <path d="M2 10h20M2 16h20" />
                                    </svg>
                                    <span>Taman Pribadi</span>
                                </div>
                            </div>
                        </div>

                        {/* Section Peta Lokasi */}
                        <div className="space-y-3 pt-2">
                            <h3 className="text-base font-black tracking-tight text-gray-800">Lokasi Strategis</h3>
                            <div className="relative w-full h-64 bg-amber-50 rounded-2xl overflow-hidden border border-gray-200/40 shadow-sm">
                                <iframe 
                                    className="w-full h-full grayscale-[10%]"
                                    title="Peta Lokasi"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address || property.city || 'Menteng Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                    frameBorder="0" scrolling="no"
                                ></iframe>
                                <a 
                                    href={`https://maps.google.com/?q=${encodeURIComponent(property.address || property.city || 'Menteng Jakarta')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="absolute bottom-4 right-4 bg-[#C5A065] hover:bg-[#bfa057] text-white font-bold text-[10px] px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                >
                                    🗺️ Buka di Google Maps
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* ================= KOLOM KANAN: KARTU AKSI & AKUN AGEN ================= */}
                    <div className="space-y-6 lg:sticky top-28">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-base font-black text-gray-800 tracking-tight">{property.title || 'Menteng Royal Villa'}</h2>
                                    <p className="text-[10px] font-medium text-gray-400 mt-1">📍 {property.city || 'Menteng, Jakarta Pusat'}</p>
                                </div>
                                <button 
                                    onClick={handleToggleFavorite}
                                    disabled={favoriteLoading}
                                    className="text-red-500 hover:scale-105 transition-transform text-lg"
                                >
                                    {isFavorited ? '❤️' : '🤍'}
                                </button>
                            </div>

                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Harga Penawaran</p>
                                <p className="text-xl font-black text-[#93702d] tracking-tight">{formatPrice(property.price || 12500000000)}</p>
                            </div>

                            <button
                                onClick={handleContactSeller}
                                disabled={contactLoading}
                                className="w-full border border-[#C5A065] bg-white text-[#93702d] hover:bg-[#FAF6EE] py-3 rounded-xl text-xs font-bold transition shadow-xs"
                            >
                                {contactLoading ? 'Menghubungkan...' : 'Chat Agen'}
                            </button>

                            <div className="grid grid-cols-2 gap-2 text-gray-500">
                                <a href={`mailto:${property.seller?.email || 'hayden12@gmail.com'}`} className="border border-gray-200 hover:bg-gray-50 text-center py-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1">
                                    ✉️ Email
                                </a>
                                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link tersalin!'); }} className="border border-gray-200 hover:bg-gray-50 text-center py-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1">
                                    🔗 Bagikan
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 text-center">
                            <h3 className="text-[11px] font-black text-gray-800 tracking-wide uppercase">Informasi Penjual</h3>
                            
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-amber-100 flex items-center justify-center shadow-xs">
                                    {sellerStore?.foto_toko ? <img src={sellerStore.foto_toko} className="w-full h-full object-cover" alt="Foto Agen" /> : '👤'}
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-xs text-gray-800">{sellerName}</p>
                                    <p className="text-[10px] font-semibold text-gray-400">Agen Rumah Sleman</p>
                                    <p className="text-[10px] font-medium text-gray-600 mt-1">📞 0858-7921-4829</p>
                                    <p className="text-[10px] font-medium text-gray-500">{property.seller?.email || 'hayden12@gmail.com'}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => sellerStore?.id && navigate(`/store/${sellerStore.id}`)}
                                className="w-full border border-[#C5A065] bg-white text-[#93702d] hover:bg-[#FAF6EE] py-2.5 rounded-xl text-[11px] font-bold transition-all"
                            >
                                Lihat Profil Agen
                            </button>
                        </div>

                    </div>
                </div>

                {/* ================= REKOMENDASI PROPERTI SERUPA ================= */}
                <div className="mt-20 pt-8 border-t border-gray-200/40">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Rekomendasi</span>
                            <h3 className="text-lg font-black text-gray-800 tracking-tight">Properti Serupa</h3>
                        </div>
                        <Link to="/properties" className="text-xs font-bold text-[#93702d] hover:underline">Lihat Semua →</Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recommendations.length > 0 ? (
                            recommendations.map(p => (
                                <Link to={`/property/${p.slug}`} key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all group">
                                    <div className="aspect-[4/3] relative bg-gray-100">
                                        <img src={p.image_main?.startsWith('http') ? p.image_main : `/storage/${p.image_main}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={p.title} />
                                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md">Dijual</span>
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <p className="text-xs font-black text-[#93702d]">{formatPrice(p.price)}</p>
                                        <h4 className="text-xs font-bold text-gray-800 truncate">{p.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">📍 {p.city}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-xs text-gray-400 font-medium bg-white rounded-2xl border border-gray-100">
                                Menyiapkan koleksi hunian premium sejenis untuk Anda...
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