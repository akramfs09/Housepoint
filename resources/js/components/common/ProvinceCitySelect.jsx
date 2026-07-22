import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const ProvinceCitySelect = ({
    province,
    provinceId,
    city,
    cityId,
    onProvinceChange,
    onProvinceSelect,
    onCityChange,
    onCitySelect,
    errors,
    layout = 'horizontal', // 'horizontal' atau 'vertical'
}) => {
    const [provinceInput, setProvinceInput] = useState(province);
    const [cityInput, setCityInput] = useState(city);
    const [provinceSearch, setProvinceSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [provinceOptions, setProvinceOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [selectedProvinceId, setSelectedProvinceId] = useState(provinceId || null);

    const provinceRef = useRef(null);
    const cityRef = useRef(null);

    useEffect(() => setProvinceInput(province), [province]);
    useEffect(() => setCityInput(city), [city]);
    useEffect(() => setSelectedProvinceId(provinceId || null), [provinceId]);

    // Fetch provinsi
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const { data } = await api.get('/locations/provinces', {
                    params: { search: provinceSearch, limit: 1000 }
                });
                setProvinceOptions(data);
            } catch (error) {
                console.error('Gagal memuat provinsi');
            }
        };
        const timer = setTimeout(fetchProvinces, 300);
        return () => clearTimeout(timer);
    }, [provinceSearch]);

    // Fetch kota
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const params = { search: citySearch, limit: 1000 };
                if (selectedProvinceId) {
                    params.province_id = selectedProvinceId;
                }
                const { data } = await api.get('/locations/cities', { params });
                setCityOptions(data);
            } catch (error) {
                console.error('Gagal memuat kota');
            }
        };
        const timer = setTimeout(fetchCities, 300);
        return () => clearTimeout(timer);
    }, [citySearch, selectedProvinceId]);

    // Klik luar tutup dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (provinceRef.current && !provinceRef.current.contains(e.target)) {
                setShowProvinceDropdown(false);
            }
            if (cityRef.current && !cityRef.current.contains(e.target)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProvinceChange = (e) => {
        const val = e.target.value;
        setProvinceInput(val);
        setProvinceSearch(val);
        setShowProvinceDropdown(true);
        // ✅ Kirim langsung ke parent, sehingga form.province selalu terisi
        onProvinceChange(val);
        setSelectedProvinceId(null);
        onProvinceSelect?.(null);
        onCityChange('');
        onCitySelect?.(null);
        setCityInput('');
        setCityOptions([]);
        setShowCityDropdown(false);
    };

    const handleCityChange = (e) => {
        const val = e.target.value;
        setCityInput(val);
        setCitySearch(val);
        setShowCityDropdown(true);
        // ✅ Kirim langsung ke parent
        onCityChange(val);
        onCitySelect?.(null);
    };

    const selectProvince = (provinceObj) => {
        setProvinceInput(provinceObj.nama);
        setProvinceSearch('');
        setShowProvinceDropdown(false);
        onProvinceChange(provinceObj.nama);
        setSelectedProvinceId(provinceObj.id);
        onProvinceSelect?.(provinceObj.id);
        // Reset kota
        setCityInput('');
        setCitySearch('');
        onCityChange('');
        onCitySelect?.(null);
        setCityOptions([]);
    };

    const selectCity = (cityObj) => {
        setCityInput(cityObj.nama);
        setCitySearch('');
        setShowCityDropdown(false);
        onCityChange(cityObj.nama);
        onCitySelect?.(cityObj.id);
    };

    const handleProvinceBlur = () => {
        // Saat blur, pastikan nilai final terkirim (jika belum)
        if (provinceInput !== province) {
            onProvinceChange(provinceInput);
        }
        setTimeout(() => setShowProvinceDropdown(false), 150);
    };

    const handleCityBlur = () => {
        if (cityInput !== city) {
            onCityChange(cityInput);
        }
        setTimeout(() => setShowCityDropdown(false), 150);
    };

    if (layout === 'hero') {
        return (
            <div className="flex w-full flex-col md:flex-row">
                {/* Provinsi */}
                <div ref={provinceRef} className="relative flex w-full flex-1 flex-col px-5 py-2 text-left md:border-r md:border-gray-200">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Lokasi</span>
                    <div className="mt-1 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-[#c49a4a]">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <input
                            type="text"
                            value={provinceInput}
                            onChange={handleProvinceChange}
                            onFocus={() => {
                                setShowProvinceDropdown(true);
                                setProvinceSearch(provinceInput);
                            }}
                            onBlur={handleProvinceBlur}
                            placeholder="Semua Lokasi"
                            className="w-full cursor-pointer appearance-none bg-transparent text-[15px] font-bold text-[#2c241b] outline-none placeholder:text-[#2c241b]"
                        />
                    </div>
                    {showProvinceDropdown && provinceOptions.length > 0 && (
                        <div className="absolute top-full left-0 z-20 mt-2 w-full min-w-[200px] rounded-xl border border-gray-100 bg-white shadow-xl max-h-64 overflow-y-auto">
                            {provinceOptions.map((p) => (
                                <div
                                    key={p.id}
                                    className="px-4 py-3 text-sm text-[#2f2a22] font-medium hover:bg-gray-50 hover:text-[#c49a4a] cursor-pointer transition-colors"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => selectProvince(p)}
                                >
                                    {p.nama}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={layout === 'vertical' ? 'space-y-3' : 'grid grid-cols-2 gap-4'}>
            {/* Provinsi */}
            <div ref={provinceRef} className="relative">
                <label className={layout === 'vertical' 
                    ? 'block text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8e8576] mb-1.5' 
                    : 'block text-sm font-medium mb-1'
                }>
                    {layout === 'vertical' ? 'Provinsi' : 'Provinsi *'}
                </label>
                <input
                    type="text"
                    value={provinceInput}
                    onChange={handleProvinceChange}
                    onFocus={() => {
                        setShowProvinceDropdown(true);
                        setProvinceSearch(provinceInput);
                    }}
                    onBlur={handleProvinceBlur}
                    placeholder={layout === 'vertical' ? 'Pilih provinsi...' : 'Ketik atau pilih provinsi...'}
                    className={layout === 'vertical'
                        ? 'h-9 w-full rounded-md border border-[#eadcc4] bg-white px-3 text-[10px] text-[#5f574c] outline-none transition placeholder:text-[#b5ab9b] focus:border-[#c49a4a]'
                        : 'w-full border rounded-lg px-3 py-2 text-sm'
                    }
                />
                {errors?.province && <p className="text-red-500 text-xs mt-1">{errors.province[0]}</p>}

                {showProvinceDropdown && provinceOptions.length > 0 && (
                    <div className={layout === 'vertical'
                        ? 'absolute z-20 w-full bg-white border border-[#eadcc4] rounded-md mt-1 max-h-48 overflow-y-auto shadow-md'
                        : 'absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg'
                    }>
                        {provinceOptions.map((p) => (
                            <div
                                key={p.id}
                                className={layout === 'vertical'
                                    ? 'px-3 py-1.5 text-[10px] text-[#5f574c] hover:bg-[#fcfaf5] hover:text-[#c49a4a] cursor-pointer transition-colors'
                                    : 'px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                                }
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectProvince(p)}
                            >
                                {p.nama}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Kota */}
            <div ref={cityRef} className="relative">
                <label className={layout === 'vertical' 
                    ? 'block text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8e8576] mb-1.5' 
                    : 'block text-sm font-medium mb-1'
                }>
                    {layout === 'vertical' ? 'Kota/Kabupaten' : 'Kota/Kabupaten *'}
                </label>
                <input
                    type="text"
                    value={cityInput}
                    onChange={handleCityChange}
                    onFocus={() => {
                        setShowCityDropdown(true);
                        setCitySearch(cityInput);
                    }}
                    onBlur={handleCityBlur}
                    placeholder={layout === 'vertical' ? 'Pilih kota...' : 'Ketik atau pilih kota...'}
                    className={layout === 'vertical'
                        ? 'h-9 w-full rounded-md border border-[#eadcc4] bg-white px-3 text-[10px] text-[#5f574c] outline-none transition placeholder:text-[#b5ab9b] focus:border-[#c49a4a]'
                        : 'w-full border rounded-lg px-3 py-2 text-sm'
                    }
                />
                {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city[0]}</p>}

                {showCityDropdown && cityOptions.length > 0 && (
                    <div className={layout === 'vertical'
                        ? 'absolute z-20 w-full bg-white border border-[#eadcc4] rounded-md mt-1 max-h-48 overflow-y-auto shadow-md'
                        : 'absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg'
                    }>
                        {cityOptions.map((c) => (
                            <div
                                key={c.id}
                                className={layout === 'vertical'
                                    ? 'px-3 py-1.5 text-[10px] text-[#5f574c] hover:bg-[#fcfaf5] hover:text-[#c49a4a] cursor-pointer transition-colors'
                                    : 'px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer'
                                }
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectCity(c)}
                            >
                                {c.nama}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProvinceCitySelect;
