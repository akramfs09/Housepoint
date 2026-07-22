import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api, { storeSearchHistory } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import ProvinceCitySelect from '../../components/common/ProvinceCitySelect';
import { useAuth } from '../../hooks/useAuth';

const PROPERTY_TYPES = [
    { value: 'rumah', label: 'Rumah' },
    { value: 'apartemen', label: 'Apartement' },
    { value: 'villa', label: 'Villa' },
    { value: 'tanah', label: 'Tanah' },
];

const SORT_OPTIONS = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
    { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
    { value: 'popular', label: 'Paling Populer' },
];

const MIN_PRICE = 100000000;
const MAX_PRICE = 20000000000;

const formatRupiahSingkat = (value) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(0)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    return `Rp ${value}`;
};

const defaultFilters = {
    search: '',
    type: '',
    province: '',
    province_id: '',
    city: '',
    city_id: '',
    min_price: '',
    max_price: '',
    sort_by: 'latest',
    page: 1,
};

const getInitialFilters = (searchParams) => ({
    ...defaultFilters,
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    province: searchParams.get('province') || '',
    province_id: searchParams.get('province_id') || '',
    city: searchParams.get('city') || '',
    city_id: searchParams.get('city_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort_by: searchParams.get('sort_by') || 'latest',
});

const getInitialPriceRange = (searchParams) => ({
    min: Number(searchParams.get('min_price')) || MIN_PRICE,
    max: Number(searchParams.get('max_price')) || MAX_PRICE,
});

const buildCatalogSearchParams = (filters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (['page', 'per_page'].includes(key)) return;
        if (key === 'min_price' && Number(value) === MIN_PRICE) return;
        if (key === 'max_price' && Number(value) === MAX_PRICE) return;
        if (key === 'sort_by' && value === 'latest') return;
        if (value !== '' && value !== null && value !== undefined) {
            params.set(key, value);
        }
    });

    return params;
};

const PropertyCatalog = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
    const [priceRange, setPriceRange] = useState(() => getInitialPriceRange(searchParams));

    const loadProperties = useCallback(async (pageNumber, currentFilters) => {
        setLoading(true);
        try {
            const params = {
                ...currentFilters,
                page: pageNumber,
                per_page: 9,
            };

            Object.keys(params).forEach((key) => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });

            const { data } = await api.get('/properties', { params });
            const allData = data.data?.data || data.data || [];
            const total = data.data?.meta?.total || allData.length;
            
            setProperties(Array.isArray(allData) ? allData : []);
            setPagination({
                currentPage: data.data?.meta?.current_page || pageNumber,
                lastPage: data.data?.meta?.last_page || 1,
                total,
            });

            return { total };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memuat katalog properti.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProperties(filters.page, filters);
    }, [loadProperties]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleProvinceChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            province: value,
            province_id: '',
            city: '',
            city_id: '',
            page: 1,
        }));
    };

    const handleProvinceSelect = (value) => {
        setFilters((prev) => ({
            ...prev,
            province_id: value || '',
            page: 1,
        }));
    };

    const handleCityChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            city: value,
            city_id: '',
            page: 1,
        }));
    };

    const handleCitySelect = (value) => {
        setFilters((prev) => ({
            ...prev,
            city_id: value || '',
            page: 1,
        }));
    };

    const handlePageChange = (page) => {
        const nextFilters = { ...filters, page };
        setFilters(nextFilters);
        setSearchParams(buildCatalogSearchParams(nextFilters), { replace: true });
        loadProperties(page, nextFilters);
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    const buildSearchHistoryPayload = (currentFilters, resultCount) => {
        const searchText = currentFilters.search?.trim() || '';
        const historyFilters = {};

        if (currentFilters.type) historyFilters.type = currentFilters.type;
        if (currentFilters.province) historyFilters.province = currentFilters.province;
        if (currentFilters.province_id) historyFilters.province_id = currentFilters.province_id;
        if (currentFilters.city) historyFilters.city = currentFilters.city;
        if (currentFilters.city_id) historyFilters.city_id = currentFilters.city_id;
        if (Number(currentFilters.min_price) && Number(currentFilters.min_price) !== MIN_PRICE) {
            historyFilters.min_price = Number(currentFilters.min_price);
        }
        if (Number(currentFilters.max_price) && Number(currentFilters.max_price) !== MAX_PRICE) {
            historyFilters.max_price = Number(currentFilters.max_price);
        }
        if (currentFilters.sort_by && currentFilters.sort_by !== 'latest') {
            historyFilters.sort_by = currentFilters.sort_by;
        }

        if (!searchText && Object.keys(historyFilters).length === 0) {
            return null;
        }

        return {
            search_text: searchText,
            filters: historyFilters,
            result_count: resultCount,
        };
    };

    const recordSearchHistory = async (currentFilters, resultCount) => {
        if (!user || !['customer', 'seller'].includes(user.role)) return;

        const payload = buildSearchHistoryPayload(currentFilters, resultCount);
        if (!payload) return;

        try {
            await storeSearchHistory(payload);
        } catch (error) {
            console.error('Gagal menyimpan riwayat pencarian:', error);
        }
    };

    const applyActiveFilters = async () => {
        const nextFilters = {
            ...filters,
            min_price: priceRange.min,
            max_price: priceRange.max,
            page: 1,
        };
        setFilters(nextFilters);
        setSearchParams(buildCatalogSearchParams(nextFilters), { replace: true });

        const result = await loadProperties(1, nextFilters);
        if (result) {
            await recordSearchHistory(nextFilters, result.total);
        }
    };

    const resetFilters = () => {
        setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });
        setFilters(defaultFilters);
        setSearchParams({}, { replace: true });
        loadProperties(1, defaultFilters);
    };

    return (
        <div className="min-h-screen bg-[#f7f0e4] text-[#222222] font-sans antialiased text-left selection:bg-amber-200">
            <Navbar />

            <main className="max-w-[1120px] mx-auto px-5 pb-[74px] pt-9">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <aside className="w-full lg:w-[250px] flex-shrink-0">
                        <div className="bg-white rounded-lg border border-[#f0e4cf] shadow-[0_8px_22px_rgba(75,55,25,0.035)] p-5 sticky top-24 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[14px] font-semibold tracking-wide text-[#2f2a22]">Filter</h2>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-[10px] font-semibold text-[#b88a35] hover:underline"
                                >
                                    Reset
                                </button>
                            </div>

                            <div>
                                <label className="block text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8e8576] mb-2.5">
                                    Kata Kunci
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#c49a4a]" />
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(event) => handleFilterChange('search', event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                applyActiveFilters();
                                            }
                                        }}
                                        placeholder="Cari nama properti"
                                        className="h-9 w-full rounded-md border border-[#eadcc4] bg-white pl-8 pr-3 text-[10px] text-[#5f574c] outline-none transition placeholder:text-[#b5ab9b] focus:border-[#c49a4a]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8e8576] mb-2.5">
                                    Lokasi
                                </label>
                                <ProvinceCitySelect
                                    province={filters.province}
                                    provinceId={filters.province_id}
                                    city={filters.city}
                                    cityId={filters.city_id}
                                    onProvinceChange={handleProvinceChange}
                                    onProvinceSelect={handleProvinceSelect}
                                    onCityChange={handleCityChange}
                                    onCitySelect={handleCitySelect}
                                    errors={{}}
                                    layout="vertical"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8e8576] mb-2.5">
                                    Tipe Properti
                                </label>
                                <div className="space-y-2">
                                    {PROPERTY_TYPES.map((type) => (
                                        <label
                                            key={type.value}
                                            className="flex cursor-pointer select-none items-center gap-2 text-[10px] font-medium text-[#5f574c]"
                                        >
                                            <input
                                                type="radio"
                                                name="property-type"
                                                checked={filters.type === type.value}
                                                onChange={() => handleFilterChange('type', type.value)}
                                                className="h-3.5 w-3.5 cursor-pointer border-[#d7c8ac] text-[#c49a4a] focus:ring-0"
                                            />
                                            <span>{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-center text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8e8576] mb-2.5">
                                    Rentang Harga
                                </label>

                                <div className="relative flex h-7 w-full items-center">
                                    <div className="absolute h-[3px] w-full rounded-full bg-[#eadbc3]" />
                                    <div
                                        className="absolute h-[3px] rounded-full bg-[#c49a4a]"
                                        style={{
                                            left: `${(priceRange.min / MAX_PRICE) * 100}%`,
                                            right: `${100 - (priceRange.max / MAX_PRICE) * 100}%`,
                                        }}
                                    />

                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_PRICE}
                                        step="100000000"
                                        value={priceRange.min}
                                        onChange={(event) => {
                                            const value = Math.min(Number(event.target.value), priceRange.max - 500000000);
                                            setPriceRange((prev) => ({ ...prev, min: value }));
                                        }}
                                        className="absolute z-20 w-full appearance-none bg-transparent outline-none pointer-events-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#c49a4a] [&::-webkit-slider-thumb]:pointer-events-auto"
                                    />

                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_PRICE}
                                        step="100000000"
                                        value={priceRange.max}
                                        onChange={(event) => {
                                            const value = Math.max(Number(event.target.value), priceRange.min + 500000000);
                                            setPriceRange((prev) => ({ ...prev, max: value }));
                                        }}
                                        className="absolute z-20 w-full appearance-none bg-transparent outline-none pointer-events-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#c49a4a] [&::-webkit-slider-thumb]:pointer-events-auto"
                                    />
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-1/2 rounded-md border border-[#eadcc4] bg-[#f8f1e5] py-1.5 text-center text-[9px] font-semibold text-[#4b4338]">
                                        {formatRupiahSingkat(priceRange.min)}
                                    </div>
                                    <span className="text-[9px] font-semibold text-[#a89a84]">ke</span>
                                    <div className="w-1/2 rounded-md border border-[#eadcc4] bg-[#f8f1e5] py-1.5 text-center text-[9px] font-semibold text-[#4b4338]">
                                        {formatRupiahSingkat(priceRange.max)}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={applyActiveFilters}
                                className="h-10 w-full rounded-md bg-[#c49a4a] text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#ae8434] active:scale-[0.99]"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </aside>

                    <section className="w-full flex-1">
                        <div className="mb-6 flex items-start justify-between gap-4 px-0.5">
                            <div>
                                <h1 className="text-[22px] font-bold leading-none tracking-tight text-[#2b261f]">Properti Pilihan</h1>
                                <p className="mt-2 text-[11px] font-medium text-[#8b8478]">
                                    Menampilkan {properties.length} dari {pagination?.total || 0} pilihan properti premium
                                </p>
                            </div>

                            <div className="relative min-w-[150px]">
                                <select
                                    value={filters.sort_by}
                                    onChange={(event) => {
                                        const nextSort = event.target.value;
                                        const nextFilters = {
                                            ...filters,
                                            sort_by: nextSort,
                                            page: 1,
                                        };
                                        setFilters(nextFilters);
                                        setSearchParams(buildCatalogSearchParams(nextFilters), { replace: true });
                                        loadProperties(1, nextFilters);
                                    }}
                                    className="h-8 w-full appearance-none rounded-md border border-[#eadcc4] bg-white px-3 pr-8 text-[10px] font-medium text-[#2f2a22] outline-none focus:border-[#c49a4a]"
                                >
                                    {SORT_OPTIONS.map((sort) => (
                                        <option key={sort.value} value={sort.value}>
                                            {sort.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9c927f]" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="rounded-lg border border-[#eadcc4] bg-white py-32 text-center text-xs font-medium text-[#8b8478]">
                                Memuat katalog properti...
                            </div>
                        ) : properties.length === 0 ? (
                            <div className="rounded-lg border border-[#eadcc4] bg-white py-32 text-center">
                                <p className="text-sm font-medium text-[#8b8478]">Tidak ada properti yang cocok dengan filter Anda</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {properties.map((property) => (
                                        <PropertyCard key={property.id} property={property} mode="public" />
                                    ))}
                                </div>

                                {pagination && pagination.lastPage > 1 && (
                                    <div className="mt-14 flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                                            disabled={filters.page === 1}
                                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] hover:border-[#c49a4a] disabled:opacity-35"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </button>

                                        {Array.from({ length: pagination.lastPage }, (_, index) => index + 1).map((page) => (
                                            <button
                                                type="button"
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`h-8 w-8 rounded-md text-[10px] font-semibold transition ${
                                                    page === pagination.currentPage
                                                        ? 'bg-[#80601f] text-white'
                                                        : 'border border-[#eadcc4] bg-white text-[#8b8478] hover:border-[#c49a4a]'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(Math.min(pagination.lastPage, filters.page + 1))}
                                            disabled={filters.page === pagination.lastPage}
                                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadcc4] bg-white text-[#9c927f] hover:border-[#c49a4a] disabled:opacity-35"
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PropertyCatalog;
