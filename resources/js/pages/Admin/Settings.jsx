import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DEFAULT_WEBSITE_CONTENT } from '../../data/defaultWebsiteContent';
import { fetchAdminWebsiteContent, updateWebsiteContent } from '../../services/api';

const MAX_HERO_IMAGES = 10;

const emptyForm = {
    brand_name: DEFAULT_WEBSITE_CONTENT.branding.brand_name,
    logo_alt_text: DEFAULT_WEBSITE_CONTENT.branding.logo_alt_text,
    header_logo_url: DEFAULT_WEBSITE_CONTENT.branding.header_logo_url,
    header_logo_original_url: DEFAULT_WEBSITE_CONTENT.branding.header_logo_url,
    header_logo_file: null,
    remove_header_logo: false,
    footer_logo_url: DEFAULT_WEBSITE_CONTENT.branding.footer_logo_url,
    footer_logo_original_url: DEFAULT_WEBSITE_CONTENT.branding.footer_logo_url,
    footer_logo_file: null,
    remove_footer_logo: false,
    auth_logo_url: DEFAULT_WEBSITE_CONTENT.branding.auth_logo_url,
    auth_logo_original_url: DEFAULT_WEBSITE_CONTENT.branding.auth_logo_url,
    auth_logo_file: null,
    remove_auth_logo: false,
    hero_alt_text: DEFAULT_WEBSITE_CONTENT.hero.alt_text,
    hero_existing_images: [],
    hero_new_images: [],
    removed_hero_images: [],
    footer_description: DEFAULT_WEBSITE_CONTENT.footer.description,
    footer_services: DEFAULT_WEBSITE_CONTENT.footer.services,
    footer_address: DEFAULT_WEBSITE_CONTENT.footer.address,
    footer_phone: DEFAULT_WEBSITE_CONTENT.footer.phone,
    footer_email: DEFAULT_WEBSITE_CONTENT.footer.email,
    about_description: DEFAULT_WEBSITE_CONTENT.about.description,
    about_vision: DEFAULT_WEBSITE_CONTENT.about.vision,
    about_mission: DEFAULT_WEBSITE_CONTENT.about.mission,
    about_logo_url: null,
    about_logo_original_url: null,
    about_logo_file: null,
    remove_about_logo: false,
    features_title: DEFAULT_WEBSITE_CONTENT.about.features_title,
    features_subtitle: DEFAULT_WEBSITE_CONTENT.about.features_subtitle,
    features: DEFAULT_WEBSITE_CONTENT.about.features,
    contact_address: DEFAULT_WEBSITE_CONTENT.contact.address,
    contact_email: DEFAULT_WEBSITE_CONTENT.contact.email,
    contact_phone: DEFAULT_WEBSITE_CONTENT.contact.phone,
    contact_operational_hours: DEFAULT_WEBSITE_CONTENT.contact.operational_hours,
    contact_gmaps_url: DEFAULT_WEBSITE_CONTENT.contact.gmaps_url,
};

const Settings = () => {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const heroPreviews = useMemo(() => ([
        ...form.hero_existing_images.map((image) => ({ ...image, source: 'existing' })),
        ...form.hero_new_images.map((image) => ({ image_url: image.preview_url, image_path: null, source: 'new', id: image.id })),
    ]), [form.hero_existing_images, form.hero_new_images]);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchAdminWebsiteContent();
                const content = data.data;

                setForm({
                    brand_name: content.branding?.brand_name || emptyForm.brand_name,
                    logo_alt_text: content.branding?.logo_alt_text || emptyForm.logo_alt_text,
                    header_logo_url: content.branding?.header_logo_url || emptyForm.header_logo_url,
                    header_logo_original_url: content.branding?.header_logo_url || emptyForm.header_logo_original_url,
                    header_logo_file: null,
                    remove_header_logo: false,
                    footer_logo_url: content.branding?.footer_logo_url || emptyForm.footer_logo_url,
                    footer_logo_original_url: content.branding?.footer_logo_url || emptyForm.footer_logo_original_url,
                    footer_logo_file: null,
                    remove_footer_logo: false,
                    auth_logo_url: content.branding?.auth_logo_url || emptyForm.auth_logo_url,
                    auth_logo_original_url: content.branding?.auth_logo_url || emptyForm.auth_logo_original_url,
                    auth_logo_file: null,
                    remove_auth_logo: false,
                    hero_alt_text: content.hero?.alt_text || emptyForm.hero_alt_text,
                    hero_existing_images: content.hero?.images?.length ? content.hero.images : [],
                    hero_new_images: [],
                    removed_hero_images: [],
                    footer_description: content.footer?.description || '',
                    footer_services: content.footer?.services?.length ? content.footer.services : [''],
                    footer_address: content.footer?.address || '',
                    footer_phone: content.footer?.phone || '',
                    footer_email: content.footer?.email || '',
                    about_description: content.about?.description || '',
                    about_vision: content.about?.vision || '',
                    about_mission: content.about?.mission || '',
                    about_logo_url: content.about?.about_logo_url || null,
                    about_logo_original_url: content.about?.about_logo_url || null,
                    about_logo_file: null,
                    remove_about_logo: false,
                    features_title: content.about?.features_title || emptyForm.features_title,
                    features_subtitle: content.about?.features_subtitle || emptyForm.features_subtitle,
                    features: content.about?.features?.length ? content.about.features.slice(0, 4) : emptyForm.features,
                    contact_address: content.contact?.address || '',
                    contact_email: content.contact?.email || '',
                    contact_phone: content.contact?.phone || '',
                    contact_operational_hours: content.contact?.operational_hours || '',
                    contact_gmaps_url: content.contact?.gmaps_url || '',
                });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal memuat pengaturan website.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const setField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const setLogoFile = (field, previewField, removeField, file, originalField) => {
        setForm((current) => ({
            ...current,
            [field]: file,
            [previewField]: file ? URL.createObjectURL(file) : current[originalField],
            [removeField]: false,
        }));
    };

    const removeLogo = (field, previewField, removeField, originalField) => {
        setForm((current) => ({
            ...current,
            [field]: null,
            [previewField]: current[field] ? (current[originalField] || null) : null,
            [removeField]: current[field] ? false : true,
        }));
    };

    const setService = (index, value) => {
        setForm((current) => ({
            ...current,
            footer_services: current.footer_services.map((service, itemIndex) => itemIndex === index ? value : service),
        }));
    };

    const addService = () => {
        setForm((current) => ({ ...current, footer_services: [...current.footer_services, ''] }));
    };

    const removeService = (index) => {
        setForm((current) => ({
            ...current,
            footer_services: current.footer_services.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const setFeature = (index, field, value) => {
        setForm((current) => ({
            ...current,
            features: current.features.map((feature, itemIndex) => (
                itemIndex === index ? { ...feature, [field]: value } : feature
            )),
        }));
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        setForm((current) => {
            const availableSlots = MAX_HERO_IMAGES - current.hero_existing_images.length - current.hero_new_images.length;
            if (availableSlots <= 0) {
                toast.error('Maksimal 10 gambar hero.');
                return current;
            }

            const acceptedFiles = files.slice(0, availableSlots);
            if (files.length > availableSlots) {
                toast.error(`Hanya ${availableSlots} gambar yang dapat ditambahkan.`);
            }

            return {
                ...current,
                hero_new_images: [
                    ...current.hero_new_images,
                    ...acceptedFiles.map((file) => ({
                        id: `${file.name}-${file.lastModified}-${Math.random()}`,
                        file,
                        preview_url: URL.createObjectURL(file),
                    })),
                ],
            };
        });

        event.target.value = '';
    };

    const removeHeroImage = (image) => {
        setForm((current) => {
            if (image.source === 'new') {
                return {
                    ...current,
                    hero_new_images: current.hero_new_images.filter((item) => item.id !== image.id),
                };
            }

            return {
                ...current,
                hero_existing_images: current.hero_existing_images.filter((item) => item.image_path !== image.image_path),
                removed_hero_images: image.image_path
                    ? [...current.removed_hero_images, image.image_path]
                    : current.removed_hero_images,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        const payload = new FormData();
        payload.append('brand_name', form.brand_name || '');
        payload.append('logo_alt_text', form.logo_alt_text || '');
        if (form.header_logo_file) payload.append('header_logo', form.header_logo_file);
        if (form.footer_logo_file) payload.append('footer_logo', form.footer_logo_file);
        if (form.auth_logo_file) payload.append('auth_logo', form.auth_logo_file);
        payload.append('remove_header_logo', form.remove_header_logo ? '1' : '0');
        payload.append('remove_footer_logo', form.remove_footer_logo ? '1' : '0');
        payload.append('remove_auth_logo', form.remove_auth_logo ? '1' : '0');
        form.hero_new_images.forEach((image, index) => payload.append(`hero_images[${index}]`, image.file));
        form.removed_hero_images.forEach((imagePath, index) => payload.append(`removed_hero_images[${index}]`, imagePath));
        payload.append('hero_alt_text', form.hero_alt_text || '');
        payload.append('footer_description', form.footer_description || '');
        payload.append('footer_address', form.footer_address || '');
        payload.append('footer_phone', form.footer_phone || '');
        payload.append('footer_email', form.footer_email || '');
        payload.append('about_description', form.about_description || '');
        payload.append('about_vision', form.about_vision || '');
        payload.append('about_mission', form.about_mission || '');
        if (form.about_logo_file) payload.append('about_logo', form.about_logo_file);
        payload.append('remove_about_logo', form.remove_about_logo ? '1' : '0');
        payload.append('features_title', form.features_title || '');
        payload.append('features_subtitle', form.features_subtitle || '');
        payload.append('contact_address', form.contact_address || '');
        payload.append('contact_email', form.contact_email || '');
        payload.append('contact_phone', form.contact_phone || '');
        payload.append('contact_operational_hours', form.contact_operational_hours || '');
        payload.append('contact_gmaps_url', form.contact_gmaps_url || '');

        form.footer_services
            .filter((service) => service.trim() !== '')
            .forEach((service, index) => payload.append(`footer_services[${index}]`, service));
        form.features.slice(0, 4).forEach((feature, index) => {
            payload.append(`features[${index}][title]`, feature.title || '');
            payload.append(`features[${index}][desc]`, feature.desc || '');
            payload.append(`features[${index}][icon]`, feature.icon || 'search');
        });

        try {
            const { data } = await updateWebsiteContent(payload);
            setForm((current) => ({
                ...current,
                brand_name: data.data.branding?.brand_name || current.brand_name,
                logo_alt_text: data.data.branding?.logo_alt_text || current.logo_alt_text,
                header_logo_url: data.data.branding?.header_logo_url || current.header_logo_url,
                header_logo_original_url: data.data.branding?.header_logo_url || current.header_logo_original_url,
                header_logo_file: null,
                remove_header_logo: false,
                footer_logo_url: data.data.branding?.footer_logo_url || current.footer_logo_url,
                footer_logo_original_url: data.data.branding?.footer_logo_url || current.footer_logo_original_url,
                footer_logo_file: null,
                remove_footer_logo: false,
                auth_logo_url: data.data.branding?.auth_logo_url || current.auth_logo_url,
                auth_logo_original_url: data.data.branding?.auth_logo_url || current.auth_logo_original_url,
                auth_logo_file: null,
                remove_auth_logo: false,
                hero_existing_images: data.data.hero?.images || [],
                hero_new_images: [],
                removed_hero_images: [],
                about_logo_url: data.data.about?.about_logo_url || null,
                about_logo_original_url: data.data.about?.about_logo_url || null,
                about_logo_file: null,
                remove_about_logo: false,
            }));
            toast.success('Pengaturan website berhasil disimpan.');
            window.dispatchEvent(new Event('website-content-updated'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan website.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="rounded-xl bg-white p-8 text-center text-sm font-medium text-[#8b8478]">Memuat pengaturan...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-[#eadcc4] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#2c241b]">Branding Logo</h2>
                <p className="mt-1 text-xs font-medium text-[#8b8478]">
                    Logo ini dipakai di header, footer, login, dan register.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="xl:col-span-2">
                        <span className="text-xs font-bold text-[#746b5e]">Nama Brand</span>
                        <input
                            value={form.brand_name}
                            onChange={(event) => setField('brand_name', event.target.value)}
                            className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                        />
                    </label>
                    <label className="xl:col-span-2">
                        <span className="text-xs font-bold text-[#746b5e]">Alt Text Logo</span>
                        <input
                            value={form.logo_alt_text}
                            onChange={(event) => setField('logo_alt_text', event.target.value)}
                            className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                        />
                    </label>

                    {[
                        { label: 'Logo Header', fileField: 'header_logo_file', previewField: 'header_logo_url', removeField: 'remove_header_logo', originalField: 'header_logo_original_url' },
                        { label: 'Logo Footer', fileField: 'footer_logo_file', previewField: 'footer_logo_url', removeField: 'remove_footer_logo', originalField: 'footer_logo_original_url' },
                        { label: 'Logo Login & Register', fileField: 'auth_logo_file', previewField: 'auth_logo_url', removeField: 'remove_auth_logo', originalField: 'auth_logo_original_url' },
                    ].map((slot) => (
                        <div key={slot.label} className="rounded-lg border border-[#eadcc4] bg-[#fdfaf4] p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold text-[#746b5e]">{slot.label}</p>
                                    <p className="mt-1 text-[11px] text-[#8b8478]">Format JPG, PNG, atau WEBP. Maksimal 5 MB.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeLogo(slot.fileField, slot.previewField, slot.removeField, slot.originalField)}
                                    className="rounded-md px-2 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50"
                                >
                                    Hapus
                                </button>
                            </div>

                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-[#eadcc4] bg-white">
                                    {form[slot.previewField] ? (
                                        <img src={form[slot.previewField]} alt={form.logo_alt_text} className="h-full w-full object-contain p-1" />
                                    ) : (
                                        <span className="text-[10px] font-medium text-[#8b8478]">Kosong</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0] || null;
                                            setLogoFile(slot.fileField, slot.previewField, slot.removeField, file, slot.originalField);
                                            event.target.value = '';
                                        }}
                                        className="block w-full text-xs text-[#746b5e]"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-xl border border-[#eadcc4] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#2c241b]">Hero Iklan</h2>
                        <p className="mt-1 text-xs font-medium text-[#8b8478]">
                            Maksimal {MAX_HERO_IMAGES} gambar. Gambar akan bergeser otomatis setiap 6 detik.
                        </p>
                    </div>
                    <span className="text-xs font-bold text-[#8a6400]">{heroPreviews.length}/{MAX_HERO_IMAGES} gambar</span>
                </div>

                <div className="mt-5 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {heroPreviews.map((image, index) => (
                            <div key={`${image.image_url}-${image.id || image.image_path || index}`} className="group relative overflow-hidden rounded-lg border border-[#eadcc4] bg-[#f8f4ec]">
                                <img src={image.image_url} alt={form.hero_alt_text} className="h-36 w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeHeroImage(image)}
                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm transition hover:bg-red-50"
                                    title="Hapus gambar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white">
                                    #{index + 1}
                                </div>
                            </div>
                        ))}

                        {heroPreviews.length === 0 && (
                            <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-[#d6c5a8] bg-[#f8f4ec] text-xs font-medium text-[#8b8478] sm:col-span-2 lg:col-span-3">
                                Belum ada gambar hero.
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                        <label className="block">
                            <span className="text-xs font-bold text-[#746b5e]">Tambah Gambar Hero</span>
                            <div className="mt-2 flex min-h-11 items-center gap-2 rounded-lg border border-[#eadcc4] px-3 py-2 text-sm text-[#746b5e]">
                                <Upload className="h-4 w-4" />
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="text-xs" />
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-xs font-bold text-[#746b5e]">Alt Text</span>
                            <input
                                type="text"
                                value={form.hero_alt_text}
                                onChange={(event) => setField('hero_alt_text', event.target.value)}
                                className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                            />
                        </label>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-[#eadcc4] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#2c241b]">Footer</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="md:col-span-2">
                        <span className="text-xs font-bold text-[#746b5e]">Deskripsi</span>
                        <textarea value={form.footer_description} onChange={(event) => setField('footer_description', event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#eadcc4] px-3 py-2 text-sm outline-none focus:border-[#c49a4a]" />
                    </label>
                    <label>
                        <span className="text-xs font-bold text-[#746b5e]">Alamat</span>
                        <input value={form.footer_address} onChange={(event) => setField('footer_address', event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]" />
                    </label>
                    <label>
                        <span className="text-xs font-bold text-[#746b5e]">Telepon</span>
                        <input value={form.footer_phone} onChange={(event) => setField('footer_phone', event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]" />
                    </label>
                    <label>
                        <span className="text-xs font-bold text-[#746b5e]">Email</span>
                        <input type="email" value={form.footer_email} onChange={(event) => setField('footer_email', event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]" />
                    </label>
                    <div className="md:col-span-2">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#746b5e]">Layanan</span>
                            <button type="button" onClick={addService} className="inline-flex items-center gap-1 rounded-md bg-[#f2e6d1] px-2.5 py-1 text-xs font-bold text-[#8a6400]">
                                <Plus className="h-3.5 w-3.5" />
                                Tambah
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.footer_services.map((service, index) => (
                                <div key={index} className="flex gap-2">
                                    <input value={service} onChange={(event) => setService(index, event.target.value)} className="h-10 flex-1 rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]" />
                                    <button type="button" onClick={() => removeService(index)} className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-[#eadcc4] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#2c241b]">Tentang Kami</h2>
                <div className="mt-5 space-y-4">
                    {/* Logo Tentang Kami */}
                    <div className="rounded-lg border border-[#eadcc4] bg-[#fdfaf4] p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-[#746b5e]">Logo Tentang Kami</p>
                                <p className="mt-1 text-[11px] text-[#8b8478]">Tampil di halaman Tentang Kami. Format JPG, PNG, atau WEBP. Maksimal 5 MB.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeLogo('about_logo_file', 'about_logo_url', 'remove_about_logo', 'about_logo_original_url')}
                                className="rounded-md px-2 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50"
                            >
                                Hapus
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-[#eadcc4] bg-white">
                                {form.about_logo_url ? (
                                    <img src={form.about_logo_url} alt="Logo Tentang Kami" className="h-full w-full object-contain p-1" />
                                ) : (
                                    <span className="text-[10px] font-medium text-[#8b8478]">Kosong</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        setLogoFile('about_logo_file', 'about_logo_url', 'remove_about_logo', file, 'about_logo_original_url');
                                        event.target.value = '';
                                    }}
                                    className="block w-full text-xs text-[#746b5e]"
                                />
                            </div>
                        </div>
                    </div>

                    <textarea value={form.about_description} onChange={(event) => setField('about_description', event.target.value)} rows={4} placeholder="Deskripsi" className="w-full rounded-lg border border-[#eadcc4] px-3 py-2 text-sm outline-none focus:border-[#c49a4a]" />
                    <textarea value={form.about_vision} onChange={(event) => setField('about_vision', event.target.value)} rows={3} placeholder="Visi" className="w-full rounded-lg border border-[#eadcc4] px-3 py-2 text-sm outline-none focus:border-[#c49a4a]" />
                    <textarea value={form.about_mission} onChange={(event) => setField('about_mission', event.target.value)} rows={3} placeholder="Misi" className="w-full rounded-lg border border-[#eadcc4] px-3 py-2 text-sm outline-none focus:border-[#c49a4a]" />
                </div>
            </section>


            <section className="rounded-xl border border-[#eadcc4] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#2c241b]">Mengapa Memilih Kami</h2>
                <div className="mt-5 space-y-4">
                    <input
                        value={form.features_title}
                        onChange={(event) => setField('features_title', event.target.value)}
                        placeholder="Judul section"
                        className="h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                    />
                    <textarea
                        value={form.features_subtitle}
                        onChange={(event) => setField('features_subtitle', event.target.value)}
                        rows={2}
                        placeholder="Deskripsi section"
                        className="w-full rounded-lg border border-[#eadcc4] px-3 py-2 text-sm outline-none focus:border-[#c49a4a]"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        {form.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="rounded-lg border border-[#eadcc4] bg-[#fdfaf4] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#8a6400]">Fitur {index + 1}</span>
                                    <select
                                        value={feature.icon}
                                        onChange={(event) => setFeature(index, 'icon', event.target.value)}
                                        className="h-8 rounded-md border border-[#eadcc4] bg-white px-2 text-xs outline-none focus:border-[#c49a4a]"
                                    >
                                        <option value="search">Pencarian</option>
                                        <option value="home">Properti</option>
                                        <option value="zap">Cepat</option>
                                        <option value="shield">Aman</option>
                                    </select>
                                </div>
                                <input
                                    value={feature.title}
                                    onChange={(event) => setFeature(index, 'title', event.target.value)}
                                    placeholder="Judul fitur"
                                    className="h-10 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                                />
                                <textarea
                                    value={feature.desc}
                                    onChange={(event) => setFeature(index, 'desc', event.target.value)}
                                    rows={2}
                                    placeholder="Deskripsi fitur"
                                    className="mt-2 w-full rounded-lg border border-[#eadcc4] px-3 py-2 text-sm outline-none focus:border-[#c49a4a]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-[#eadcc4] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#2c241b]">Kontak</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input value={form.contact_address} onChange={(event) => setField('contact_address', event.target.value)} placeholder="Alamat" className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a] md:col-span-2" />
                    <input type="email" value={form.contact_email} onChange={(event) => setField('contact_email', event.target.value)} placeholder="Email" className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]" />
                    <input value={form.contact_phone} onChange={(event) => setField('contact_phone', event.target.value)} placeholder="Telepon" className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]" />
                    <input value={form.contact_operational_hours} onChange={(event) => setField('contact_operational_hours', event.target.value)} placeholder="Jam Operasional" className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a] md:col-span-2" />
                    <input type="url" value={form.contact_gmaps_url} onChange={(event) => setField('contact_gmaps_url', event.target.value)} placeholder="Link Google Maps" className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a] md:col-span-2" />
                </div>
            </section>

            <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#c49a4a] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#ad812f] disabled:opacity-60">
                <Save className="h-4 w-4" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </form>
    );
};

export default Settings;
