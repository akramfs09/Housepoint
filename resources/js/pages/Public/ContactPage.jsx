import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';
import { fetchMyUserReports, sendUserReportMessage, submitUserReport } from '../../services/api';

const REPORT_CATEGORIES = [
    { value: 'property', label: 'Properti' },
    { value: 'seller', label: 'Agen/Seller' },
    { value: 'chat', label: 'Pesan/Chat' },
    { value: 'payment', label: 'Pembayaran' },
    { value: 'bug', label: 'Bug Website' },
    { value: 'other', label: 'Lainnya' },
];

const REPORT_STATUS_LABEL = {
    pending: 'Menunggu diproses',
    reviewed: 'Sedang ditinjau',
    resolved: 'Selesai',
    rejected: 'Ditolak',
};

const REPORT_STATUS_CLASS = {
    pending: 'bg-amber-50 text-amber-700',
    reviewed: 'bg-blue-50 text-blue-600',
    resolved: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-red-50 text-red-600',
};

const getGoogleMapsQuery = (value, fallback) => {
    if (!value) return fallback || 'HousePoint Indonesia';

    try {
        const decoded = decodeURIComponent(value);
        const coordinateMatch = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
            || decoded.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
            || decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);

        if (coordinateMatch) {
            return `${coordinateMatch[1]},${coordinateMatch[2]}`;
        }

        const url = new URL(value);
        const query = url.searchParams.get('q') || url.searchParams.get('query');
        if (query) return query;

        const placeMatch = decoded.match(/\/place\/([^/@?]+)/);
        if (placeMatch?.[1]) {
            return placeMatch[1].replace(/\+/g, ' ');
        }
    } catch {
        return value;
    }

    return value;
};

const ContactPage = () => {
    const { user, isLoading } = useAuth();
    const { content } = useWebsiteContent();
    const contact = content.contact;
    const heroImages = useMemo(() => (content.hero.images || []).filter((image) => image.image_url), [content.hero]);
    const heroImage = heroImages[0]?.image_url || content.hero.image_url;

    const fallbackImages = useMemo(() => [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    ], []);

    const displayImages = useMemo(() => {
        const list = [...heroImages.map((img) => img.image_url)];
        while (list.length < 4) {
            list.push(fallbackImages[list.length]);
        }
        return list.slice(0, 4);
    }, [heroImages, fallbackImages]);

    const [activeHeroIndex, setActiveHeroIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [reportForm, setReportForm] = useState({
        category: 'property',
        subject: '',
        description: '',
    });
    const [activeReport, setActiveReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [reportMessage, setReportMessage] = useState('');

    const mapUrl = useMemo(() => {
        if (contact.gmaps_url?.includes('/embed')) return contact.gmaps_url;
        const target = contact.gmaps_query || getGoogleMapsQuery(contact.gmaps_url, contact.address);
        return `https://maps.google.com/maps?q=${encodeURIComponent(target)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }, [contact.gmaps_query, contact.gmaps_url, contact.address]);

    const openMapUrl = contact.gmaps_url || `https://maps.google.com/maps?q=${encodeURIComponent(contact.address || 'HousePoint Indonesia')}`;

    const contactCards = [
        { icon: MapPin, label: 'Alamat', value: contact.address },
        { icon: Mail, label: 'Email', value: contact.email },
        { icon: Clock, label: 'Jam Operasional', value: contact.operational_hours },
        { icon: Phone, label: 'Telepon', value: contact.phone },
    ];

    useEffect(() => {
        setActiveHeroIndex(0);
    }, [heroImages.length]);

    useEffect(() => {
        if (heroImages.length <= 1) return undefined;

        const interval = setInterval(() => {
            setActiveHeroIndex((current) => (current + 1) % heroImages.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [heroImages.length]);

    const loadReports = async () => {
        if (!user) return;

        try {
            const { data } = await fetchMyUserReports();
            setActiveReport(data.data?.active_report || null);
            setReports(data.data?.reports || []);
        } catch {
            toast.error('Gagal memuat laporan Anda.');
        }
    };

    useEffect(() => {
        if (!user) return;

        loadReports();
    }, [user]);

    const requireLogin = () => {
        if (isLoading) return false;
        if (!user) {
            toast.error('Silakan login terlebih dahulu.');
            return false;
        }
        return true;
    };

    const handleSubmitReport = async (event) => {
        event.preventDefault();
        if (!requireLogin()) return;

        setSubmitting(true);
        try {
            const { data } = await submitUserReport(reportForm);
            toast.success('Laporan berhasil dikirim.');
            setActiveReport(data.data || null);
            setReports((current) => [data.data, ...current.filter((report) => report.id !== data.data?.id)]);
            setReportForm({ category: 'property', subject: '', description: '' });
        } catch (error) {
            const conflictReport = error.response?.data?.errors?.active_report;
            if (conflictReport) {
                setActiveReport(conflictReport);
            }
            toast.error(error.response?.data?.message || 'Gagal mengirim laporan.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendReportMessage = async (event) => {
        event.preventDefault();
        if (!requireLogin() || !activeReport || !reportMessage.trim()) return;

        setSubmitting(true);
        try {
            await sendUserReportMessage(activeReport.id, { message: reportMessage.trim() });
            setReportMessage('');
            await loadReports();
            toast.success('Pesan laporan dikirim.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim pesan laporan.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f0e4] text-[#2c2c2c]">
            <Navbar />

            <section className="relative min-h-[410px] w-full overflow-hidden bg-[#2c241b]">
                {heroImages.length > 0 ? (
                    heroImages.map((image, index) => (
                        <img
                            key={`${image.image_url}-${index}`}
                            src={image.image_url}
                            alt={image.alt_text || content.hero.alt_text || 'HousePoint'}
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                                index === activeHeroIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    ))
                ) : heroImage ? (
                    <img src={heroImage} alt={content.hero.alt_text || 'HousePoint'} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-[#2c241b]" />
                )}
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative mx-auto flex min-h-[410px] max-w-[1180px] flex-col items-center justify-center px-5 text-center text-white">
                    <h1 className="text-[38px] font-black tracking-tight sm:text-[48px]">Hubungi Kami</h1>
                    <p className="mt-3 max-w-[640px] text-sm font-medium leading-7 text-white/85">
                        Laporkan kendala pengguna dan lanjutkan tindak lanjut bersama tim HousePoint.
                    </p>
                </div>
                {heroImages.length > 1 && (
                    <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
                        {heroImages.map((image, index) => (
                            <button
                                key={`${image.image_url}-contact-dot-${index}`}
                                type="button"
                                onClick={() => setActiveHeroIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                    index === activeHeroIndex ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'
                                }`}
                                aria-label={`Tampilkan hero ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            <main className="mx-auto max-w-[1180px] px-5 pb-16">
                <div className="-mt-16 grid gap-4 md:grid-cols-4">
                    {contactCards.map(({ icon: Icon, label, value }) => (
                        <section key={label} className="relative rounded-xl border border-[#eadcc4] bg-white p-5 text-center shadow-[0_14px_36px_rgba(75,55,25,0.12)]">
                            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49a4a]">
                                <Icon className="h-4 w-4" />
                            </div>
                            <h2 className="mt-3 text-sm font-black text-[#2c241b]">{label}</h2>
                            <p className="mt-1 text-xs font-medium leading-5 text-[#746b5e]">{value}</p>
                        </section>
                    ))}
                </div>

                {!user && !isLoading && (
                    <div className="mt-8 rounded-xl border border-[#eadcc4] bg-white px-5 py-4 text-sm font-medium text-[#746b5e]">
                        Anda perlu <Link to="/login" className="font-bold text-[#9b720f] hover:underline">login</Link> untuk mengirim laporan.
                    </div>
                )}

                <div className="mt-9 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <section>
                        <h2 className="text-[24px] font-black text-[#2c241b]">Kirim Pesan</h2>
                        <p className="mt-2 text-sm font-medium leading-6 text-[#746b5e]">
                            Kirim laporan kendala dan lanjutkan komunikasi dengan tim HousePoint.
                        </p>

                        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadcc4] bg-white shadow-sm">
                            <div className="flex items-center gap-2 border-b border-[#eadcc4] bg-[#fffdfa] px-6 py-4 text-sm font-black text-[#2c241b]">
                                <AlertTriangle className="h-4 w-4 text-[#c49a4a]" />
                                Laporan Pengguna
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmitReport} className="space-y-4">
                                        {activeReport && (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-sm font-black text-[#2c241b]">Laporan Anda masih diproses</p>
                                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${REPORT_STATUS_CLASS[activeReport.status] || 'bg-gray-100 text-gray-500'}`}>
                                                        {REPORT_STATUS_LABEL[activeReport.status] || activeReport.status}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs font-medium leading-5 text-[#746b5e]">
                                                    Anda dapat membuat laporan baru setelah laporan "{activeReport.subject}" selesai atau ditolak.
                                                </p>
                                            </div>
                                        )}
                                        {activeReport?.messages?.length > 0 && (
                                            <div className="rounded-xl border border-[#eadcc4] bg-[#fffdfa] p-4">
                                                <p className="mb-3 text-xs font-black uppercase text-[#8a6400]">Thread Tindak Lanjut</p>
                                                <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                                                    {activeReport.messages.map((message) => (
                                                        <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.is_mine ? 'bg-[#c49a4a] text-white' : 'border border-[#eadcc4] bg-white text-[#4b4338]'}`}>
                                                                <p className={`mb-1 text-[10px] font-black uppercase ${message.is_mine ? 'text-white/75' : 'text-[#9b720f]'}`}>
                                                                    {message.is_mine ? 'Anda' : message.sender?.label || message.sender?.name || 'Admin HousePoint'}
                                                                </p>
                                                                <p className="leading-6">{message.message}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {activeReport && (
                                            <div className="rounded-xl border border-[#eadcc4] bg-white p-3">
                                                <textarea
                                                    value={reportMessage}
                                                    onChange={(event) => setReportMessage(event.target.value)}
                                                    maxLength={2000}
                                                    rows={3}
                                                    placeholder="Balas tindak lanjut laporan Anda..."
                                                    className="w-full resize-none rounded-lg border border-[#eadcc4] px-3 py-3 text-sm outline-none focus:border-[#c49a4a]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSendReportMessage}
                                                    disabled={submitting || !reportMessage.trim()}
                                                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#c49a4a] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#9b720f] disabled:opacity-50"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Kirim Balasan
                                                </button>
                                            </div>
                                        )}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-xs font-bold text-[#8a6400]">Kategori</label>
                                                <select
                                                    value={reportForm.category}
                                                    onChange={(event) => setReportForm((current) => ({ ...current, category: event.target.value }))}
                                                    disabled={!!activeReport}
                                                    className="h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                                                >
                                                    {REPORT_CATEGORIES.map((category) => (
                                                        <option key={category.value} value={category.value}>{category.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-xs font-bold text-[#8a6400]">Subjek</label>
                                                <input
                                                    value={reportForm.subject}
                                                    onChange={(event) => setReportForm((current) => ({ ...current, subject: event.target.value }))}
                                                    maxLength={160}
                                                    placeholder="Ringkasan laporan"
                                                    disabled={!!activeReport}
                                                    className="h-11 w-full rounded-lg border border-[#eadcc4] px-3 text-sm outline-none focus:border-[#c49a4a]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-[#8a6400]">Detail Laporan</label>
                                            <textarea
                                                value={reportForm.description}
                                                onChange={(event) => setReportForm((current) => ({ ...current, description: event.target.value }))}
                                                maxLength={3000}
                                                rows={6}
                                                placeholder="Tuliskan kronologi dan detail yang perlu diperiksa oleh admin."
                                                disabled={!!activeReport}
                                                className="w-full resize-none rounded-lg border border-[#eadcc4] px-3 py-3 text-sm outline-none focus:border-[#c49a4a]"
                                                required
                                            />
                                        </div>
                                        <button disabled={submitting || !user || !!activeReport} className="rounded-lg bg-[#c49a4a] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#9b720f] disabled:opacity-50">
                                            {activeReport ? 'Laporan Sedang Diproses' : submitting ? 'Mengirim...' : 'Kirim Laporan'}
                                        </button>
                                        {reports.length > 0 && (
                                            <div className="border-t border-[#eadcc4] pt-4">
                                                <p className="mb-3 text-xs font-black uppercase text-[#8a6400]">Riwayat Laporan Anda</p>
                                                <div className="space-y-2">
                                                    {reports.slice(0, 3).map((report) => (
                                                        <div key={report.id} className="rounded-lg border border-[#f0e6d8] bg-[#fffdfa] px-3 py-2">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="truncate text-xs font-bold text-[#2c241b]">{report.subject}</p>
                                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${REPORT_STATUS_CLASS[report.status] || 'bg-gray-100 text-gray-500'}`}>
                                                                    {REPORT_STATUS_LABEL[report.status] || report.status}
                                                                </span>
                                                            </div>
                                                            {report.admin_note && (
                                                                <p className="mt-1 text-xs font-medium text-[#746b5e]">Balasan admin: {report.admin_note}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                </form>
                            </div>
                        </div>
                    </section>

                    <section className="w-full">
                        <div className="grid grid-cols-4 gap-3 h-[320px] sm:h-[460px] w-full">
                            {/* Gambar Utama (Kiri) */}
                            <div className="col-span-3 h-full overflow-hidden rounded-2xl">
                                <img
                                    src={displayImages[0]}
                                    alt="HousePoint contact primary"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* 3 Gambar Kecil (Kanan Stacked) */}
                            <div className="col-span-1 grid grid-rows-3 gap-3 h-full">
                                {displayImages.slice(1, 4).map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="h-full overflow-hidden rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                                    >
                                        <img
                                            src={url}
                                            alt={`HousePoint contact secondary ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <section className="mt-12">
                    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-[#d3c4b2] bg-[#e7e5e4] shadow-sm">
                        <iframe
                            className="h-full w-full"
                            title="Lokasi HousePoint"
                            src={mapUrl}
                            frameBorder="0"
                            scrolling="no"
                        />
                        <a
                            href={openMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-xl bg-[#d4a44c] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#c2933e]"
                        >
                            <MapPin className="h-4 w-4" />
                            Buka Maps
                        </a>
                    </div>
                </section>

                <section className="mt-10 text-center">
                    <h2 className="text-[22px] font-black text-[#2c241b]">Mulai Cari Properti Sekarang</h2>
                    <Link to="/properties" className="mt-4 inline-flex rounded-lg bg-[#c49a4a] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#9b720f]">
                        Cari Properti
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
