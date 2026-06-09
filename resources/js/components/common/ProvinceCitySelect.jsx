import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const ProvinceCitySelect = ({ province, city, onProvinceChange, onCityChange, errors }) => {
    const [provinceInput, setProvinceInput] = useState(province);
    const [cityInput, setCityInput] = useState(city);
    const [provinceSearch, setProvinceSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [provinceOptions, setProvinceOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);

    const provinceRef = useRef(null);
    const cityRef = useRef(null);

    useEffect(() => setProvinceInput(province), [province]);
    useEffect(() => setCityInput(city), [city]);

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
        // Jangan reset selectedProvinceId, biarkan filter kota tetap bekerja
    };

    const handleCityChange = (e) => {
        const val = e.target.value;
        setCityInput(val);
        setCitySearch(val);
        setShowCityDropdown(true);
        // ✅ Kirim langsung ke parent
        onCityChange(val);
    };

    const selectProvince = (provinceObj) => {
        setProvinceInput(provinceObj.nama);
        setProvinceSearch('');
        setShowProvinceDropdown(false);
        onProvinceChange(provinceObj.nama);
        setSelectedProvinceId(provinceObj.id);
        // Reset kota
        setCityInput('');
        onCityChange('');
    };

    const selectCity = (cityObj) => {
        setCityInput(cityObj.nama);
        setCitySearch('');
        setShowCityDropdown(false);
        onCityChange(cityObj.nama);
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

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Provinsi */}
            <div ref={provinceRef} className="relative">
                <label className="block text-sm font-medium mb-1">Provinsi *</label>
                <input
                    type="text"
                    value={provinceInput}
                    onChange={handleProvinceChange}
                    onFocus={() => {
                        setShowProvinceDropdown(true);
                        setProvinceSearch(provinceInput);
                    }}
                    onBlur={handleProvinceBlur}
                    placeholder="Ketik atau pilih provinsi..."
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {errors?.province && <p className="text-red-500 text-xs mt-1">{errors.province[0]}</p>}

                {showProvinceDropdown && provinceOptions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {provinceOptions.map((p) => (
                            <div
                                key={p.id}
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
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
                <label className="block text-sm font-medium mb-1">Kota/Kabupaten *</label>
                <input
                    type="text"
                    value={cityInput}
                    onChange={handleCityChange}
                    onFocus={() => {
                        setShowCityDropdown(true);
                        setCitySearch(cityInput);
                    }}
                    onBlur={handleCityBlur}
                    placeholder="Ketik atau pilih kota..."
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {errors?.city && <p className="text-red-500 text-xs mt-1">{errors.city[0]}</p>}

                {showCityDropdown && cityOptions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {cityOptions.map((c) => (
                            <div
                                key={c.id}
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
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