import { Link } from 'react-router-dom';
import { CheckCircle, Target, Zap, Shield } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';

const STAT_ICONS = {
    home: '🏠',
    search: '👥',
    zap: '🏆',
    shield: '⏰',
};

const AboutPage = () => {
    const { content } = useWebsiteContent();
    const about = content.about;
    const branding = content.branding;

    // Gunakan logo tentang kami jika ada, fallback ke logo brand utama
    const aboutLogo = about.about_logo_url || branding?.header_logo_url || '/logo.png';
    const brandName = branding?.brand_name || 'HOUSEPOINT';

    const features = about.features || [];

    return (
        <div className="min-h-screen bg-[#f7f0e4] text-[#2c2c2c]">
            <Navbar />
            <main>
                {/* === Section 1: Siapa Kami? === */}
                <section className="mx-auto max-w-[980px] px-5 py-14">
                    <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-16">
                        {/* Logo */}
                        <div className="flex flex-shrink-0 flex-col items-center">
                            <div className="flex h-[200px] w-[200px] items-center justify-center overflow-hidden sm:h-[240px] sm:w-[240px]">
                                <img
                                    src={aboutLogo}
                                    alt={brandName}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h1 className="text-[30px] font-black tracking-tight text-[#2c241b] sm:text-[34px]">
                                Siapa Kami?
                            </h1>
                            <p className="mt-4 max-w-[600px] text-sm font-medium leading-7 text-[#746b5e]">
                                {about.description}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {[
                                    'Platform terpercaya',
                                    'Data properti lengkap',
                                    'Tim profesional',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[#2c241b]">
                                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#c49a4a]" strokeWidth={2} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* === Section 2: CTA Banner === */}
                <section className="mx-auto max-w-[980px] px-5 pb-14">
                    <div
                        className="relative overflow-hidden rounded-2xl px-8 py-10 text-center shadow-md"
                        style={{
                            background: 'linear-gradient(135deg, #f5e8ca 0%, #eedbb0 50%, #e8cc90 100%)',
                        }}
                    >
                        {/* Decorative blobs */}
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c49a4a]/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#c49a4a]/10 blur-2xl" />

                        <h2 className="relative text-2xl font-black tracking-tight text-[#2c241b] sm:text-3xl">
                            Temukan Properti Impian Anda Sekarang
                        </h2>
                        <p className="relative mx-auto mt-3 max-w-[500px] text-sm font-medium leading-6 text-[#746b5e]">
                            Jadilah yang pertama menemukan hunian impian. Ratusan hunian baru dan
                            kekayaan di ujung jari Anda bersama HousePoint.
                        </p>
                        <Link
                            to="/properties"
                            className="relative mt-6 inline-flex items-center justify-center rounded-full bg-[#2c241b] px-7 py-3 text-sm font-bold text-[#f5e8ca] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c49a4a] hover:shadow-lg"
                        >
                            Cari Properti
                        </Link>
                    </div>
                </section>

                {/* === Section 3: Visi & Misi === */}
                <section className="mx-auto max-w-[980px] px-5 pb-14">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Visi */}
                        <div className="group relative overflow-hidden rounded-2xl border border-[#e8d8b8] bg-[#fffbf3] p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="pointer-events-none absolute right-4 top-4 opacity-5">
                                <Target className="h-20 w-20 text-[#c49a4a]" />
                            </div>
                            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5e8ca]">
                                <Target className="h-5 w-5 text-[#8a6400]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#2c241b]">Visi Kami</h2>
                            <p className="mt-3 text-sm font-medium leading-7 text-[#5f574c]">
                                {about.vision}
                            </p>
                        </div>

                        {/* Misi */}
                        <div className="group relative overflow-hidden rounded-2xl border border-[#e8d8b8] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="pointer-events-none absolute right-4 top-4 opacity-5">
                                <Zap className="h-20 w-20 text-[#c49a4a]" />
                            </div>
                            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5e8ca]">
                                <Zap className="h-5 w-5 text-[#8a6400]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#2c241b]">Misi Kami</h2>
                            <p className="mt-3 text-sm font-medium leading-7 text-[#5f574c]">
                                {about.mission}
                            </p>
                        </div>
                    </div>
                </section>

                {/* === Section 4: Stats Banner (Mengapa Memilih Kami) === */}
                {features.length > 0 && (
                    <section className="mx-auto max-w-[980px] px-5 pb-16">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-black tracking-tight text-[#2c241b] sm:text-3xl">
                                {about.features_title}
                            </h2>
                            {about.features_subtitle && (
                                <p className="mx-auto mt-2 max-w-[560px] text-sm font-medium leading-6 text-[#746b5e]">
                                    {about.features_subtitle}
                                </p>
                            )}
                        </div>
                        <div
                            className="overflow-hidden rounded-2xl shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #2c241b 0%, #3d3226 50%, #2c241b 100%)' }}
                        >
                            <div className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0">
                                {features.slice(0, 4).map((stat, index) => (
                                    <div
                                        key={index}
                                        className="group flex flex-col items-center justify-center px-6 py-9 text-center transition-colors duration-300 hover:bg-white/5"
                                    >
                                        <span className="text-[36px] font-black leading-none text-[#e0bd74] transition-transform duration-300 group-hover:scale-110 sm:text-[42px]">
                                            {stat.title}
                                        </span>
                                        <span className="mt-2 text-[11px] font-bold tracking-widest text-[#b9a07a]">
                                            {stat.desc}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
