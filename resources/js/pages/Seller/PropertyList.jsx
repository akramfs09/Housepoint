import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMyProperties, deleteProperty, submitProperty, createProperty, updateProperty } from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import ProvinceCitySelect from '../../components/common/ProvinceCitySelect';
import DragDropUpload from '../../components/common/DragDropUpload';
import { toast } from 'react-hot-toast';
import FeaturedModal from '../../components/common/FeaturedModal';

const STATUS_TABS = [
    { key: '', label: 'Semua' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Menunggu Moderasi' },
    { key: 'approved', label: 'Menunggu Pembayaran' },
    { key: 'published', label: 'Aktif' },
    { key: 'rejected', label: 'Ditolak' },
];

const FASILITAS_LIST = [
    { key: 'ac', label: 'AC' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'kolam_renang', label: 'Kolam Renang' },
    { key: 'taman', label: 'Taman' },
    { key: 'cctv', label: 'CCTV' },
    { key: 'security', label: 'Security' },
    { key: 'gym', label: 'Gym' },
    { key: 'balkon', label: 'Balkon' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'water_heater', label: 'Water Heater' },
];

const PropertyList = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [activeTab, setActiveTab] = useState('list');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [counts, setCounts] = useState({ draft: 0, pending: 0 });
    const [featuredModal, setFeaturedModal] = useState(null);

    // ========== FORM UPLOAD STATE ==========
    const [formLoading, setFormLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        type: 'rumah',
        status_jual: 'dijual',
        address: '',
        city: '',
        province: '',
        bedrooms: '',
        bathrooms: '',
        land_area: '',
        building_area: '',
        tahun_dibangun: '',
        garasi: '',
        jumlah_lantai: '',
        sumber_air: '',
        fasilitas: [],
        video_type: '',
        youtube_url: '',
    });
    const [imageMain, setImageMain] = useState(null);
    const [images, setImages] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [errors, setErrors] = useState({});

    // ========== LOAD PROPERTIES ==========
    const loadProperties = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const { data } = await fetchMyProperties(params);
            const propertyData = data.data || [];
            setProperties(propertyData);

            if (!statusFilter) {
                setCounts({
                    draft: propertyData.filter(p => p.status === 'draft').length,
                    pending: propertyData.filter(p => p.status === 'pending').length,
                });
            }
        } catch (error) {
            toast.error('Gagal memuat properti.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') loadProperties();
    }, [statusFilter, activeTab]);

    // ========== LOAD DATA UNTUK EDIT ==========
    useEffect(() => {
        if (!isEdit) return;
        const loadProperty = async () => {
            try {
                const { data } = await fetchMyProperties();
                const found = (data.data || []).find(p => p.id === parseInt(id));
                if (found) {
                    setForm({
                        title: found.title || '',
                        description: found.description || '',
                        price: found.price || '',
                        type: found.type || 'rumah',
                        status_jual: found.status_jual || 'dijual',
                        address: found.address || '',
                        city: found.city || '',
                        province: found.province || '',
                        bedrooms: found.bedrooms || '',
                        bathrooms: found.bathrooms || '',
                        land_area: found.land_area || '',
                        building_area: found.building_area || '',
                        tahun_dibangun: found.tahun_dibangun || '',
                        garasi: found.garasi || '',
                        jumlah_lantai: found.jumlah_lantai || '',
                        sumber_air: found.sumber_air || '',
                        fasilitas: found.fasilitas || [],
                        video_type: found.video_type || '',
                        youtube_url: found.youtube_url || '',
                    });
                    setActiveTab('upload');
                }
            } catch (error) {
                toast.error('Gagal memuat data properti.');
                navigate('/seller/properties');
            }
        };
        loadProperty();
    }, [id]);

    // ========== PROPERTY ACTIONS ==========
    const handleAction = async (action, propertyId) => {
        switch (action) {
            case 'edit':
                navigate(`/seller/properties/${propertyId}/edit`);
                break;
            case 'submit':
                if (counts.pending >= 3) {
                    toast.error('Batas pengajuan maksimal 3.');
                    return;
                }
                try {
                    await submitProperty(propertyId);
                    toast.success('Properti berhasil diajukan!');
                    loadProperties();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal mengajukan properti.');
                }
                break;
            case 'delete':
                if (window.confirm('Yakin ingin menghapus properti ini?')) {
                    try {
                        await deleteProperty(propertyId);
                        toast.success('Properti berhasil dihapus.');
                        loadProperties();
                    } catch (error) {
                        toast.error('Gagal menghapus properti.');
                    }
                }
                break;
            case 'pay':
                navigate(`/seller/properties/${propertyId}/pay`);
                break;
            case 'featured':
                const prop = properties.find(p => p.id === propertyId);
                if (prop) setFeaturedModal(prop);
                break;
            default:
                break;
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        setErrors({ ...errors, [name]: null });
    };

    const resetForm = () => {
        setForm({
            title: '', description: '', price: '', type: 'rumah',
            status_jual: 'dijual', address: '', city: '', province: '',
            bedrooms: '', bathrooms: '', land_area: '', building_area: '',
            tahun_dibangun: '', garasi: '', jumlah_lantai: '', sumber_air: '',
            fasilitas: [], video_type: '', youtube_url: '',
        });
        setImageMain(null);
        setImages([]);
        setVideoFile(null);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (key === 'fasilitas') {
                if (form.fasilitas.length > 0) {
                    form.fasilitas.forEach((f, i) => formData.append(`fasilitas[${i}]`, f));
                }
            } else if (form[key] !== '' && form[key] !== null) {
                formData.append(key, form[key]);
            }
        });
        if (imageMain) formData.append('image_main', imageMain);
        images.forEach(img => formData.append('images[]', img.file || img));
        if (videoFile) formData.append('video_file', videoFile);

        try {
            if (isEdit) {
                await updateProperty(id, formData);
                toast.success('Properti berhasil diperbarui!');
            } else {
                await createProperty(formData);
                toast.success('Properti berhasil disimpan sebagai draft!');
            }
            resetForm();
            setActiveTab('list');
            loadProperties();
            if (isEdit) navigate('/seller/properties');
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Batas draft tercapai (maks 3).');
            } else if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                toast.error('Gagal menyimpan properti.');
            }
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isEdit ? 'Edit Properti' : 'Kelola Properti'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Atur, pantau, dan publikasikan listing properti Anda dengan mudah.
                    </p>
                </div>
                {isEdit && (
                    <button 
                        onClick={() => navigate('/seller/properties')}
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#d49b37] transition duration-200 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
                    >
                        ← Kembali ke Daftar Properti
                    </button>
                )}
            </div>

            {/* Tab Switcher */}
            {!isEdit && (
                <div className="flex border border-gray-200 mb-8 bg-white p-1 rounded-xl shadow-sm max-w-md">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            activeTab === 'list' 
                                ? 'bg-[#d49b37] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        📋 Daftar Properti
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')} 
                        disabled={counts.draft >= 3}
                        title={counts.draft >= 3 ? 'Batas draft maksimal 3 tercapai' : ''}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            activeTab === 'upload' 
                                ? 'bg-[#d49b37] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        ➕ Upload Properti
                    </button>
                </div>
            )}

            {/* ========== TAB: DAFTAR PROPERTI ========== */}
            {activeTab === 'list' && !isEdit && (
                <>
                    {/* Limit Info Alerts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                            <span className="text-sm text-amber-800 font-medium">Slot Penyimpanan Draft</span>
                            <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${counts.draft >= 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                {counts.draft}/3
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <span className="text-sm text-gray-700 font-medium">Menunggu Moderasi Aktif</span>
                            <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${counts.pending >= 3 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-800'}`}>
                                {counts.pending}/3
                            </span>
                        </div>
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex gap-2 mb-8 flex-wrap items-center">
                        {STATUS_TABS.map(tab => (
                            <button 
                                key={tab.key} 
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition duration-200 ${
                                    statusFilter === tab.key 
                                        ? 'bg-[#1e293b] text-white shadow-sm' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid List Elements */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d49b37] mb-3"></div>
                            <span className="text-sm font-medium tracking-wide">Memperbarui data properti...</span>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm max-w-2xl mx-auto px-6">
                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏬</div>
                            <p className="text-gray-900 font-semibold text-lg mb-1">Belum ada properti ditemukan</p>
                            <p className="text-gray-400 text-sm max-w-md mx-auto">
                                {statusFilter
                                    ? `Tidak ada properti saat ini dengan kategori status "${STATUS_TABS.find(t => t.key === statusFilter)?.label}".`
                                    : 'Mulai tawarkan properti terbaik Anda dengan beralih ke menu tab "Upload Properti" di atas.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map(property => (
                                <PropertyCard key={property.id} property={property} mode="seller" onAction={handleAction} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ========== TAB: UPLOAD / EDIT PROPERTI ========== */}
            {(activeTab === 'upload' || isEdit) && (
                <div className="max-w-4xl bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                        <h2 className="font-bold text-gray-800 text-base">Formulir Isian Data Aset Properti</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        
                        {/* SECTION 1: Informasi Dasar */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase border-l-4 border-[#d49b37] pl-3">1. Informasi Dasar Properti</h3>
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Judul Properti <span className="text-red-500">*</span></label>
                                    <input type="text" name="title" value={form.title} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" placeholder="Contoh: Rumah Minimalis 2 Lantai Strategis" required maxLength={255} />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Deskripsi Lengkap <span className="text-red-500">*</span></label>
                                    <textarea name="description" value={form.description} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" rows={5} placeholder="Jelaskan keunggulan, spesifikasi utama, dan detail daya tarik aset properti Anda..." required maxLength={5000} />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Tipe Properti <span className="text-red-500">*</span></label>
                                        <select name="type" value={form.type} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition">
                                            <option value="rumah">Rumah</option>
                                            <option value="apartemen">Apartemen</option>
                                            <option value="ruko">Ruko</option>
                                            <option value="tanah">Tanah</option>
                                            <option value="gedung">Gedung</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Status Properti <span className="text-red-500">*</span></label>
                                        <select name="status_jual" value={form.status_jual} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition">
                                            <option value="dijual">Dijual</option>
                                            <option value="terjual">Terjual</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Harga Nominal (Rp) <span className="text-red-500">*</span></label>
                                        <input type="number" name="price" value={form.price} onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" placeholder="Masukkan nominal angka saja" required min={1} />
                                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Tahun Dibangun</label>
                                        <input type="number" name="tahun_dibangun" value={form.tahun_dibangun} onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={1900} max={new Date().getFullYear()} placeholder="Contoh: 2022" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Luas Tanah (m²)</label>
                                        <input type="number" name="land_area" value={form.land_area} onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={1} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Luas Bangunan (m²)</label>
                                        <input type="number" name="building_area" value={form.building_area} onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={1} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 2: Lokasi */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase border-l-4 border-[#d49b37] pl-3">2. Detail Lokasi</h3>
                            <div className="space-y-4">
                                <ProvinceCitySelect
                                    province={form.province}
                                    city={form.city}
                                    onProvinceChange={(val) => { setForm({ ...form, province: val, city: '' }); setErrors({ ...errors, province: null }); }}
                                    onCityChange={(val) => { setForm({ ...form, city: val }); setErrors({ ...errors, city: null }); }}
                                    errors={errors}
                                />
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Alamat Lengkap Properti <span className="text-red-500">*</span></label>
                                    <textarea name="address" value={form.address} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" rows={2} placeholder="Nama jalan, nomor rumah, RT/RW, cluster..." required maxLength={500} />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 3: Detail Bangunan */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase border-l-4 border-[#d49b37] pl-3">3. Spesifikasi Konstruksi</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Kamar Tidur</label>
                                    <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={0} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Kamar Mandi</label>
                                    <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={0} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Kapasitas Garasi</label>
                                    <input type="number" name="garasi" value={form.garasi} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={0} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Jumlah Lantai</label>
                                    <input type="number" name="jumlah_lantai" value={form.jumlah_lantai} onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" min={1} />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Sumber Pasokan Air</label>
                                    <select name="sumber_air" value={form.sumber_air} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition">
                                        <option value="">Pilih Sumber Air</option>
                                        <option value="pdam">PDAM</option>
                                        <option value="sumur_bor">Sumur Bor</option>
                                        <option value="sumur_gali">Sumur Gali</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 4: Fasilitas */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase border-l-4 border-[#d49b37] pl-3">4. Fasilitas Tersedia</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                {FASILITAS_LIST.map(f => (
                                    <label key={f.key} className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                                        <input type="checkbox"
                                            checked={form.fasilitas?.includes(f.key) || false}
                                            onChange={(e) => {
                                                const current = form.fasilitas || [];
                                                const updated = e.target.checked ? [...current, f.key] : current.filter(x => x !== f.key);
                                                setForm({ ...form, fasilitas: updated });
                                            }}
                                            className="rounded-md border-gray-300 text-[#d49b37] focus:ring-[#d49b37] w-4 h-4" />
                                        <span className="text-sm text-gray-700 font-medium">{f.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 5: Upload Foto */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase border-l-4 border-[#d49b37] pl-3">5. Unggah Berkas Foto</h3>
                            <DragDropUpload images={images} setImages={setImages} errors={errors} />
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-w-md">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Gambar Utama Cover</label>
                                <input type="file" accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => setImageMain(e.target.files[0])}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#d49b37]/10 file:text-[#d49b37] hover:file:bg-[#d49b37]/20" />
                                {errors.image_main && <p className="text-red-500 text-xs mt-1">{errors.image_main[0]}</p>}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION 6: Video */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase border-l-4 border-[#d49b37] pl-3">6. Media Video Properti</h3>
                            <div className="space-y-4">
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="radio" name="video_type" value="upload"
                                            checked={form.video_type === 'upload'} onChange={handleFormChange} className="text-[#d49b37] focus:ring-[#d49b37]" />
                                        <span className="text-sm text-gray-700 font-medium">Unggah Berkas MP4</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="radio" name="video_type" value="youtube"
                                            checked={form.video_type === 'youtube'} onChange={handleFormChange} className="text-[#d49b37] focus:ring-[#d49b37]" />
                                        <span className="text-sm text-gray-700 font-medium">Tautan YouTube</span>
                                    </label>
                                </div>
                                {form.video_type === 'upload' && (
                                    <div className="max-w-md bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <input type="file" accept="video/mp4"
                                            onChange={(e) => setVideoFile(e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#d49b37]/10 file:text-[#d49b37] hover:file:bg-[#d49b37]/20" />
                                        <p className="text-xs text-gray-400 mt-2 font-medium">Ekstensi video wajib .MP4 dengan ukuran berkas maksimal 100 MB.</p>
                                    </div>
                                )}
                                {form.video_type === 'youtube' && (
                                    <div className="max-w-xl">
                                        <input type="url" name="youtube_url" value={form.youtube_url} onChange={handleFormChange}
                                            placeholder="https://youtube.com/watch?v=..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d49b37]/20 focus:border-[#d49b37] transition" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tombol Aksi Formulir */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                            <button type="button" onClick={() => isEdit ? navigate('/seller/properties') : resetForm()}
                                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition duration-200">
                                {isEdit ? 'Batalkan' : 'Reset Form'}
                            </button>
                            <button type="submit" disabled={formLoading}
                                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 shadow-sm transition duration-200">
                                {formLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan sebagai Draft'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Unggulan Komponen */}
            {featuredModal && (
                <FeaturedModal
                    property={featuredModal}
                    onClose={(shouldReload = false) => {
                        setFeaturedModal(null);
                        if (shouldReload) loadProperties();
                    }}
                />
            )}
        </div>
    );
};

export default PropertyList;