import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const TYPE_LABEL = {
    rumah: 'Rumah', apartemen: 'Apartemen', ruko: 'Ruko', tanah: 'Tanah', gedung: 'Gedung',
};

const FASILITAS_LABEL = {
    ac: 'AC', wifi: 'WiFi', kolam_renang: 'Kolam Renang', taman: 'Taman',
    cctv: 'CCTV', security: 'Security', gym: 'Gym', balkon: 'Balkon',
    furnished: 'Furnished', water_heater: 'Water Heater',
};

const SUMBER_AIR_LABEL = {
    pdam: 'PDAM', sumur_bor: 'Sumur Bor', sumur_gali: 'Sumur Gali',
};

// 🆕 Fungsi embed URL (sama dengan di PropertyDetail)
const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    const dmMatch = url.match(/(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
    return null;
};

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

const PropertyVerifications = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [alasan, setAlasan] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/properties/pending');
            setProperties(data.data || data);
        } catch (err) {
            toast.error('Gagal memuat properti pending');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const openOverview = (property) => {
        setSelectedProperty(property);
        setAlasan('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProperty(null);
        setAlasan('');
    };

    const handleApprove = async () => {
        if (!selectedProperty) return;
        setActionLoading(true);
        try {
            await api.patch(`/properties/${selectedProperty.id}/approve`);
            toast.success('Properti disetujui');
            closeModal();
            fetchProperties();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyetujui');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedProperty) return;
        if (!alasan.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
        }
        setActionLoading(true);
        try {
            await api.patch(`/properties/${selectedProperty.id}/reject`, { alasan });
            toast.success('Properti ditolak');
            closeModal();
            fetchProperties();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menolak');
        } finally {
            setActionLoading(false);
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    if (loading) return <div className="p-6 text-center text-gray-500">Memuat...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Verifikasi Properti (Pending)</h1>

            {properties.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border">
                    <p className="text-gray-400 text-lg">Tidak ada properti yang menunggu moderasi.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4 text-left">Properti</th>
                                <th className="p-4 text-left">Seller</th>
                                <th className="p-4 text-center">Harga</th>
                                <th className="p-4 text-center">Tipe</th>
                                <th className="p-4 text-center">Status Jual</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((p) => (
                                <tr key={p.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={p.image_main || 'https://placehold.co/50x50?text=No+Image'}
                                                alt={p.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold">{p.title}</p>
                                                <p className="text-xs text-gray-500">{p.city}, {p.province}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-600">
                                        {p.seller?.name || 'N/A'}<br />
                                        {p.seller?.sellerProfile?.nama_toko && `🏪 ${p.seller.sellerProfile.nama_toko}`}
                                    </td>
                                    <td className="p-4 text-center font-medium">{formatPrice(p.price)}</td>
                                    <td className="p-4 text-center capitalize">{p.type}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            p.status_jual === 'dijual' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {p.status_jual === 'dijual' ? 'Dijual' : 'Terjual'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openOverview(p)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-medium transition"
                                        >
                                            📋 Overview
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ========== MODAL OVERVIEW ========== */}
            {showModal && selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl flex justify-between items-center">
                            <h2 className="text-lg font-bold">Overview Properti</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 1. Informasi Dasar */}
                            <div>
                                <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">1. Informasi Dasar</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-gray-500">Judul:</span> <span className="font-medium">{selectedProperty.title}</span></div>
                                    <div><span className="text-gray-500">Tipe:</span> <span className="font-medium">{TYPE_LABEL[selectedProperty.type] || selectedProperty.type}</span></div>
                                    <div><span className="text-gray-500">Status Jual:</span> <span className="font-medium">{selectedProperty.status_jual === 'dijual' ? 'Dijual' : 'Terjual'}</span></div>
                                    <div><span className="text-gray-500">Harga:</span> <span className="font-medium text-[#c08a2c]">{formatPrice(selectedProperty.price)}</span></div>
                                    <div><span className="text-gray-500">Luas Tanah:</span> <span className="font-medium">{selectedProperty.land_area || '-'} m²</span></div>
                                    <div><span className="text-gray-500">Luas Bangunan:</span> <span className="font-medium">{selectedProperty.building_area || '-'} m²</span></div>
                                    <div><span className="text-gray-500">Tahun Dibangun:</span> <span className="font-medium">{selectedProperty.tahun_dibangun || '-'}</span></div>
                                </div>
                                <div className="mt-3">
                                    <span className="text-gray-500 text-sm">Deskripsi:</span>
                                    <p className="text-sm mt-1 text-gray-700 whitespace-pre-line">{selectedProperty.description}</p>
                                </div>
                            </div>

                            {/* 2. Lokasi */}
                            <div>
                                <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">2. Lokasi</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-gray-500">Provinsi:</span> <span className="font-medium">{selectedProperty.province}</span></div>
                                    <div><span className="text-gray-500">Kota/Kabupaten:</span> <span className="font-medium">{selectedProperty.city}</span></div>
                                </div>
                                <div className="mt-2">
                                    <span className="text-gray-500 text-sm">Alamat Lengkap:</span>
                                    <p className="text-sm mt-1 text-gray-700">{selectedProperty.address}</p>
                                </div>
                            </div>

                            {/* 3. Detail Bangunan */}
                            <div>
                                <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">3. Detail Bangunan</h3>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div><span className="text-gray-500">Kamar Tidur:</span> <span className="font-medium">{selectedProperty.bedrooms ?? '-'}</span></div>
                                    <div><span className="text-gray-500">Kamar Mandi:</span> <span className="font-medium">{selectedProperty.bathrooms ?? '-'}</span></div>
                                    <div><span className="text-gray-500">Garasi:</span> <span className="font-medium">{selectedProperty.garasi ?? '-'}</span></div>
                                    <div><span className="text-gray-500">Jumlah Lantai:</span> <span className="font-medium">{selectedProperty.jumlah_lantai || '-'}</span></div>
                                    <div><span className="text-gray-500">Sumber Air:</span> <span className="font-medium">{SUMBER_AIR_LABEL[selectedProperty.sumber_air] || '-'}</span></div>
                                </div>
                            </div>

                            {/* 4. Fasilitas */}
                            {selectedProperty.fasilitas && selectedProperty.fasilitas.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">4. Fasilitas</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperty.fasilitas.map((f, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs border border-green-200">
                                                ✅ {FASILITAS_LABEL[f] || f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. Foto */}
                            <div>
                                <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">5. Foto Properti</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {selectedProperty.image_main && (
                                        <img src={selectedProperty.image_main} alt="Main" className="w-full h-24 object-cover rounded-lg" />
                                    )}
                                    {selectedProperty.images?.map((img, i) => (
                                        <img key={i} src={img.url || img.path} alt={`Gallery ${i+1}`} className="w-full h-24 object-cover rounded-lg" />
                                    ))}
                                </div>
                            </div>

                            {/* 6. Video */}
                            {(selectedProperty.video_path || selectedProperty.youtube_url) && (
                                <div>
                                    <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">6. Video</h3>
                                    {selectedProperty.video_type === 'upload' && selectedProperty.video_path && (
                                        <video controls className="w-full rounded-lg" style={{ maxHeight: '300px' }}>
                                            <source src={selectedProperty.video_path} type="video/mp4" />
                                        </video>
                                    )}
                                    {selectedProperty.video_type === 'youtube' && selectedProperty.youtube_url && (
                                        <VideoEmbed url={selectedProperty.youtube_url} />
                                    )}
                                </div>
                            )}

                            {/* 7. Info Seller */}
                            <div>
                                <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">7. Info Seller</h3>
                                <div className="text-sm space-y-1">
                                    <p><span className="text-gray-500">Nama:</span> <span className="font-medium">{selectedProperty.seller?.name || '-'}</span></p>
                                    <p><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedProperty.seller?.email || '-'}</span></p>
                                    <p><span className="text-gray-500">Toko:</span> <span className="font-medium">{selectedProperty.seller?.sellerProfile?.nama_toko || '-'}</span></p>
                                    <p><span className="text-gray-500">No. HP:</span> <span className="font-medium">{selectedProperty.seller?.sellerProfile?.no_hp || '-'}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Alasan Penolakan (jika ditolak)</label>
                                <textarea
                                    value={alasan}
                                    onChange={(e) => setAlasan(e.target.value)}
                                    placeholder="Tulis alasan penolakan..."
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Memproses...' : '✅ Setujui'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50"
                                >
                                    {actionLoading ? 'Memproses...' : '❌ Tolak'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyVerifications;