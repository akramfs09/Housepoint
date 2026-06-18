import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMyProperties, deleteProperty, submitProperty, createProperty, updateProperty } from '../../services/api';
import PropertyCard from '../../components/common/PropertyCard';
import ProvinceCitySelect from '../../components/common/ProvinceCitySelect';
import DragDropUpload from '../../components/common/DragDropUpload';
import { toast } from 'react-hot-toast';
import FeaturedModal from '../../components/common/FeaturedModal'; // ✅ import modal unggulan

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
    const [featuredModal, setFeaturedModal] = useState(null); // ✅ state untuk modal unggulan

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
            case 'featured':   // ✅ buka modal unggulan
                const prop = properties.find(p => p.id === propertyId);
                if (prop) setFeaturedModal(prop);
                break;
            default:
                break;
        }
    };

    // ========== FORM HANDLERS ==========
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

    // ========== RENDER ==========
    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEdit ? 'Edit Properti' : 'Kelola Properti'}
                </h1>
                {isEdit && (
                    <button onClick={() => navigate('/seller/properties')}
                        className="text-sm text-gray-500 hover:text-gray-700">
                        ← Kembali ke Daftar Properti
                    </button>
                )}
            </div>

            {/* Tab Switcher (hanya tampil jika bukan mode edit) */}
            {!isEdit && (
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button onClick={() => setActiveTab('list')}
                        className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                            activeTab === 'list' ? 'border-[#d49b37] text-[#d49b37]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}>
                        📋 Daftar Properti
                    </button>
                    <button onClick={() => setActiveTab('upload')} disabled={counts.draft >= 3}
                        title={counts.draft >= 3 ? 'Batas draft maksimal 3 tercapai' : ''}
                        className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                            activeTab === 'upload' ? 'border-[#d49b37] text-[#d49b37]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}>
                        ➕ Upload Properti
                    </button>
                </div>
            )}

            {/* ========== TAB: DAFTAR PROPERTI ========== */}
            {activeTab === 'list' && !isEdit && (
                <>
                    <div className="flex gap-4 mb-6 text-sm text-gray-600">
                        <span>Draft: <strong className={counts.draft >= 3 ? 'text-red-500' : ''}>{counts.draft}/3</strong></span>
                        <span>Menunggu Moderasi: <strong className={counts.pending >= 3 ? 'text-red-500' : ''}>{counts.pending}/3</strong></span>
                    </div>

                    <div className="flex gap-2 mb-6 flex-wrap">
                        {STATUS_TABS.map(tab => (
                            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    statusFilter === tab.key ? 'bg-[#d49b37] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>{tab.label}</button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Memperbarui...</div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl">
                            <p className="text-gray-400 text-lg mb-2">Belum ada properti</p>
                            <p className="text-gray-400 text-sm">
                                {statusFilter
                                    ? `Tidak ada properti dengan status "${STATUS_TABS.find(t => t.key === statusFilter)?.label}".`
                                    : 'Klik tab "Upload Properti" untuk menambahkan properti pertama Anda.'}
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
                <div className="max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* SECTION 1: Informasi Dasar */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-bold mb-4">1. Informasi Dasar Properti</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Judul Properti *</label>
                                    <input type="text" name="title" value={form.title} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" required maxLength={255} />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Deskripsi *</label>
                                    <textarea name="description" value={form.description} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" rows={4} required maxLength={5000} />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tipe Properti *</label>
                                        <select name="type" value={form.type} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2">
                                            <option value="rumah">Rumah</option><option value="apartemen">Apartemen</option>
                                            <option value="ruko">Ruko</option><option value="tanah">Tanah</option><option value="gedung">Gedung</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status Properti *</label>
                                        <select name="status_jual" value={form.status_jual} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2">
                                            <option value="dijual">Dijual</option><option value="terjual">Terjual</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Harga (Rp) *</label>
                                        <input type="number" name="price" value={form.price} onChange={handleFormChange}
                                            className="w-full border rounded-lg px-3 py-2" required min={1} />
                                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tahun Dibangun</label>
                                        <input type="number" name="tahun_dibangun" value={form.tahun_dibangun} onChange={handleFormChange}
                                            className="w-full border rounded-lg px-3 py-2" min={1900} max={new Date().getFullYear()} placeholder="20xx" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Luas Tanah (m²)</label>
                                        <input type="number" name="land_area" value={form.land_area} onChange={handleFormChange}
                                            className="w-full border rounded-lg px-3 py-2" min={1} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Luas Bangunan (m²)</label>
                                        <input type="number" name="building_area" value={form.building_area} onChange={handleFormChange}
                                            className="w-full border rounded-lg px-3 py-2" min={1} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Lokasi */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-bold mb-4">2. Lokasi</h3>
                            <div className="space-y-4">
                                <ProvinceCitySelect
                                    province={form.province}
                                    city={form.city}
                                    onProvinceChange={(val) => { setForm({ ...form, province: val, city: '' }); setErrors({ ...errors, province: null }); }}
                                    onCityChange={(val) => { setForm({ ...form, city: val }); setErrors({ ...errors, city: null }); }}
                                    errors={errors}
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-1">Alamat Lengkap *</label>
                                    <textarea name="address" value={form.address} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" rows={2} required maxLength={500} />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Detail Bangunan */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-bold mb-4">3. Detail Bangunan</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kamar Tidur</label>
                                    <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" min={0} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kamar Mandi</label>
                                    <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" min={0} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Garasi</label>
                                    <input type="number" name="garasi" value={form.garasi} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" min={0} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jumlah Lantai</label>
                                    <input type="number" name="jumlah_lantai" value={form.jumlah_lantai} onChange={handleFormChange}
                                        className="w-full border rounded-lg px-3 py-2" min={1} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sumber Air</label>
                                    <select name="sumber_air" value={form.sumber_air} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2">
                                        <option value="">Pilih Sumber Air</option>
                                        <option value="pdam">PDAM</option>
                                        <option value="sumur_bor">Sumur Bor</option>
                                        <option value="sumur_gali">Sumur Gali</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Fasilitas */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-bold mb-4">4. Fasilitas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {FASILITAS_LIST.map(f => (
                                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox"
                                            checked={form.fasilitas?.includes(f.key) || false}
                                            onChange={(e) => {
                                                const current = form.fasilitas || [];
                                                const updated = e.target.checked ? [...current, f.key] : current.filter(x => x !== f.key);
                                                setForm({ ...form, fasilitas: updated });
                                            }}
                                            className="rounded border-gray-300 text-[#C5A065] focus:ring-[#C5A065]" />
                                        <span className="text-sm">{f.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 5: Upload Foto */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-bold mb-4">5. Upload Foto Properti</h3>
                            <DragDropUpload images={images} setImages={setImages} errors={errors} />
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1">Gambar Utama</label>
                                <input type="file" accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => setImageMain(e.target.files[0])}
                                    className="w-full border rounded-lg px-3 py-2" />
                                {errors.image_main && <p className="text-red-500 text-xs mt-1">{errors.image_main[0]}</p>}
                            </div>
                        </div>

                        {/* SECTION 6: Video */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-bold mb-4">6. Video Properti</h3>
                            <div className="space-y-4">
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="video_type" value="upload"
                                            checked={form.video_type === 'upload'} onChange={handleFormChange} />
                                        <span className="text-sm">Upload Video</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="video_type" value="youtube"
                                            checked={form.video_type === 'youtube'} onChange={handleFormChange} />
                                        <span className="text-sm">Link YouTube</span>
                                    </label>
                                </div>
                                {form.video_type === 'upload' && (
                                    <div>
                                        <input type="file" accept="video/mp4"
                                            onChange={(e) => setVideoFile(e.target.files[0])}
                                            className="w-full border rounded-lg px-3 py-2" />
                                        <p className="text-xs text-gray-500 mt-1">Format: MP4 | Maks: 100 MB</p>
                                    </div>
                                )}
                                {form.video_type === 'youtube' && (
                                    <div>
                                        <input type="url" name="youtube_url" value={form.youtube_url} onChange={handleFormChange}
                                            placeholder="https://youtube.com/watch?v=..." className="w-full border rounded-lg px-3 py-2" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tombol Submit */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button type="submit" disabled={formLoading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {formLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan sebagai Draft'}
                            </button>
                            <button type="button" onClick={() => isEdit ? navigate('/seller/properties') : resetForm()}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                                {isEdit ? 'Batal' : 'Reset'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ✅ Modal Unggulan */}
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
