import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';
import { Home, Banknote, Search, ChevronDown } from 'lucide-react';
import StatsBar from './StatsBar';
import ProvinceCitySelect from '../common/ProvinceCitySelect';

const PROPERTY_TYPES = [
    { value: '', label: 'Semua Tipe' },
    { value: 'rumah', label: 'Rumah' },
    { value: 'apartemen', label: 'Apartemen' },
    { value: 'villa', label: 'Villa' },
    { value: 'tanah', label: 'Tanah' },
];

const PRICE_RANGES = [
    { value: '', label: 'Semua Harga' },
    { value: '<1M', label: '< 1 Miliar' },
    { value: '1M-5M', label: '1 - 5 Miliar' },
    { value: '>5M', label: '> 5 Miliar' },
];

const HeroSection = () => {
    const navigate = useNavigate();
    const { content } = useWebsiteContent();
    const images = useMemo(() => (content.hero.images || []).filter((image) => image.image_url), [content.hero]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);

    const typeRef = useRef(null);
    const priceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (typeRef.current && !typeRef.current.contains(e.target)) {
                setShowTypeDropdown(false);
            }
            if (priceRef.current && !priceRef.current.contains(e.target)) {
                setShowPriceDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [searchState, setSearchState] = useState({
        province: '',
        province_id: '',
        city: '',
        city_id: '',
        type: '',
        priceRange: ''
    });

    const handleSearch = () => {
        const query = new URLSearchParams();
        if (searchState.province) query.set('province', searchState.province);
        if (searchState.province_id) query.set('province_id', searchState.province_id);
        if (searchState.city) query.set('city', searchState.city);
        if (searchState.city_id) query.set('city_id', searchState.city_id);
        if (searchState.type) query.set('type', searchState.type);
        
        if (searchState.priceRange) {
            if (searchState.priceRange === '<1M') {
                query.set('max_price', '1000000000');
            } else if (searchState.priceRange === '1M-5M') {
                query.set('min_price', '1000000000');
                query.set('max_price', '5000000000');
            } else if (searchState.priceRange === '>5M') {
                query.set('min_price', '5000000000');
            }
        }
        
        navigate(`/properties?${query.toString()}`);
    };

    useEffect(() => {
        setActiveIndex(0);
    }, [images.length]);

    useEffect(() => {
        if (images.length <= 1) return undefined;

        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % images.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="relative w-full overflow-hidden bg-[#2c241b] min-h-[650px] md:h-[700px] lg:h-[750px] flex flex-col justify-between">
            {images.length === 0 ? (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#efe6d5] text-sm font-medium text-[#8b8478]">
                    Belum ada gambar hero.
                </div>
            ) : (
                images.map((image, index) => (
                    <img
                        key={`${image.image_url}-${index}`}
                        src={image.image_url}
                        alt={image.alt_text || content.hero.alt_text}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                            index === activeIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                ))
            )}

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-20 text-center w-full">
                <h1 className="mb-4 max-w-[800px] text-[34px] font-black leading-tight text-white drop-shadow-md sm:text-[46px] lg:text-[56px]">
                    Temukan Rumah Impianmu
                </h1>
                <p className="mb-10 max-w-[700px] text-[14px] font-medium leading-relaxed text-white/90 drop-shadow-sm sm:text-[16px]">
                    Jelajahi ribuan properti terbaik dari berbagai lokasi di Indonesia dengan proses cepat, aman, dan terpercaya.
                </p>

                {/* Search Bar Container */}
                <div className="flex w-full max-w-[960px] flex-col items-center gap-4 rounded-3xl bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.15)] md:flex-row md:gap-0">
                    
                    {/* Lokasi */}
                    <div className="flex w-full flex-col md:flex-row md:w-auto md:flex-1">
                        <ProvinceCitySelect 
                            province={searchState.province}
                            provinceId={searchState.province_id}
                            city={searchState.city}
                            cityId={searchState.city_id}
                            onProvinceChange={(val) => setSearchState(prev => ({ ...prev, province: val }))}
                            onProvinceSelect={(val) => setSearchState(prev => ({ ...prev, province_id: val }))}
                            onCityChange={(val) => setSearchState(prev => ({ ...prev, city: val }))}
                            onCitySelect={(val) => setSearchState(prev => ({ ...prev, city_id: val }))}
                            layout="hero"
                        />
                    </div>
                    
                    {/* Tipe Properti */}
                    <div ref={typeRef} className="relative flex w-full md:w-auto flex-1 flex-col px-5 py-2 text-left md:border-r md:border-gray-200">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Tipe Properti</span>
                        <div 
                            className="mt-1 flex items-center justify-between cursor-pointer"
                            onClick={() => {
                                setShowTypeDropdown(!showTypeDropdown);
                                setShowPriceDropdown(false);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Home className="h-5 w-5 shrink-0 text-[#c49a4a]" strokeWidth={2.5} />
                                <span className="text-[15px] font-bold text-[#2c241b]">
                                    {PROPERTY_TYPES.find(t => t.value === searchState.type)?.label || 'Semua Tipe'}
                                </span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-[#8b8478]" />
                        </div>
                        
                        {showTypeDropdown && (
                            <div className="absolute top-full left-0 z-40 mt-2 w-full min-w-[200px] rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
                                {PROPERTY_TYPES.map((type) => (
                                    <div
                                        key={type.value}
                                        className="px-4 py-3 text-sm text-[#2f2a22] font-medium hover:bg-gray-50 hover:text-[#c49a4a] cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSearchState(prev => ({ ...prev, type: type.value }));
                                            setShowTypeDropdown(false);
                                        }}
                                    >
                                        {type.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Harga */}
                    <div ref={priceRef} className="relative flex w-full flex-1 flex-col px-5 py-2 text-left">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Harga</span>
                        <div 
                            className="mt-1 flex items-center justify-between cursor-pointer"
                            onClick={() => {
                                setShowPriceDropdown(!showPriceDropdown);
                                setShowTypeDropdown(false);
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Banknote className="h-5 w-5 shrink-0 text-[#c49a4a]" strokeWidth={2.5} />
                                <span className="text-[15px] font-bold text-[#2c241b]">
                                    {PRICE_RANGES.find(p => p.value === searchState.priceRange)?.label || 'Semua Harga'}
                                </span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-[#8b8478]" />
                        </div>
                        
                        {showPriceDropdown && (
                            <div className="absolute top-full left-0 z-40 mt-2 w-full min-w-[200px] rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
                                {PRICE_RANGES.map((price) => (
                                    <div
                                        key={price.value}
                                        className="px-4 py-3 text-sm text-[#2f2a22] font-medium hover:bg-gray-50 hover:text-[#c49a4a] cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSearchState(prev => ({ ...prev, priceRange: price.value }));
                                            setShowPriceDropdown(false);
                                        }}
                                    >
                                        {price.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSearch}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c49a4a] px-8 py-5 text-[15px] font-black text-white shadow-lg transition hover:bg-[#a57f36] md:mt-0 md:w-auto"
                    >
                        <Search className="h-5 w-5" strokeWidth={2.5} />
                        Cari
                    </button>
                </div>
            </div>

            <StatsBar />
        </section>
    );
};

export default HeroSection;
