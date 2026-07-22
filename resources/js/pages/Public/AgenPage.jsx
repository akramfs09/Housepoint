import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import { toast } from 'react-hot-toast';
import { Building2, Mail, User } from 'lucide-react';

const AgenPage = () => {
    const { sellerId } = useParams();
    const [agen, setAgen] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadAgenData = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/agen/${sellerId}?page=${currentPage}`);
                setAgen(data.agen);

                const responseData = data.properties?.data || data.properties || [];
                setProperties(responseData);
                setPagination({
                    currentPage: data.properties?.meta?.current_page || currentPage,
                    lastPage: data.properties?.meta?.last_page || 1,
                    total: data.properties?.meta?.total || responseData.length,
                });
            } catch (error) {
                toast.error('Gagal memuat profil agen.');
            } finally {
                setLoading(false);
            }
        };

        loadAgenData();
    }, [sellerId, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] font-sans antialiased flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* HERO SECTION AGEN */}
                <div className="relative pt-24 pb-12 overflow-hidden bg-white border-b border-[#F0E6D8]">
                    {/* Background Pattern/Gradient */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBF7] to-white"></div>
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FBF3E9] to-transparent opacity-50"></div>
                    </div>

                    <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start gap-8 mt-6">
                        {/* FOTO PROFIL */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-[0_8px_30px_rgba(139,115,85,0.12)] shrink-0 border border-[#F4EFEA] rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-[#FBF3E9] flex items-center justify-center">
                                {agen?.foto_agen ? (
                                    <img src={agen.foto_agen} alt={agen.nama_agen} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-12 h-12 text-[#D4A44C] opacity-50" />
                                )}
                            </div>
                        </div>

                        {/* INFO AGEN */}
                        <div className="text-center md:text-left flex-1 mt-2 md:mt-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF3E9] text-[#8A6E3D] text-[11px] font-bold tracking-wide uppercase mb-3 border border-[#EBE3D5]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A44C] animate-pulse"></span>
                                Agen Properti Terverifikasi
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[#2A2621] tracking-tight mb-3">
                                {agen?.nama_agen || 'Nama Agen'}
                            </h1>
                            <p className="text-[#6B6255] text-sm md:text-base max-w-2xl leading-relaxed mb-6 mx-auto md:mx-0">
                                {agen?.deskripsi || 'Agen profesional yang berdedikasi tinggi untuk membantu Anda menemukan properti idaman dan investasi terbaik di lokasi strategis.'}
                            </p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#4A433A] bg-[#FAF8F5] px-4 py-2 rounded-xl border border-[#F0E6D8]">
                                    <User className="w-4 h-4 text-[#D4A44C]" />
                                    {agen?.nama_penjual || 'Verified Member'}
                                </div>
                                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#4A433A] bg-[#FAF8F5] px-4 py-2 rounded-xl border border-[#F0E6D8]">
                                    <Mail className="w-4 h-4 text-[#D4A44C]" />
                                    {agen?.email || 'email@tidaktersedia.com'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLEKSI PROPERTI SECTION */}
                <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#2A2621] tracking-tight flex items-center gap-2">
                                Etalase Properti
                                <span className="bg-[#FBF3E9] border border-[#EBE3D5] text-[#D4A44C] text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    {pagination?.total || properties.length} Listing
                                </span>
                            </h2>
                            <p className="text-sm text-[#9C9487] mt-1">
                                Koleksi hunian terbaik yang dikelola oleh agen ini.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-32 bg-white rounded-3xl border border-[#F0E6D8] shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#FBF3E9] border-t-[#D4A44C] rounded-full animate-spin mb-4"></div>
                            <p className="text-[#9C9487] text-sm font-medium">Memuat katalog properti...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl border border-[#F0E6D8] shadow-sm flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#FBF3E9] rounded-2xl flex items-center justify-center mb-4">
                                <Building2 className="w-8 h-8 text-[#D4A44C] opacity-50" />
                            </div>
                            <h3 className="text-[#2A2621] font-bold text-lg mb-1">Belum Ada Properti</h3>
                            <p className="text-[#9C9487] text-sm font-medium">Agen ini belum mengunggah listing properti apapun.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {properties.map((p) => (
                                    <PropertyCard key={p.id} property={p} mode="public" />
                                ))}
                            </div>

                            {/* PAGINATION */}
                            {pagination && pagination.lastPage > 1 && (
                                <div className="flex items-center justify-center gap-1.5 mt-12">
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 rounded-lg text-sm border border-[#EBE3D5] bg-white text-[#5C5449] disabled:opacity-40 hover:bg-[#FBF3E9] transition-colors"
                                    >
                                        &laquo; Sebelumnya
                                    </button>
                                    {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                                p === currentPage
                                                    ? 'bg-[#C5A065] text-white shadow-md shadow-[#C5A065]/20'
                                                    : 'border border-[#EBE3D5] bg-white text-[#5C5449] hover:bg-[#FBF3E9]'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(Math.min(pagination.lastPage, currentPage + 1))}
                                        disabled={currentPage === pagination.lastPage}
                                        className="px-3 py-1.5 rounded-lg text-sm border border-[#EBE3D5] bg-white text-[#5C5449] disabled:opacity-40 hover:bg-[#FBF3E9] transition-colors"
                                    >
                                        Selanjutnya &raquo;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AgenPage;
