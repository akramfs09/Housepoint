import { useState, useEffect, useMemo } from 'react';
import { fetchSellerDashboard } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

// ==========================================
// KONSTANTA PALET WARNA (FIGMA 1:1)
// ==========================================
const COLOR_GOLD = '#D4A44C';
const COLOR_BAR_BG = '#EFEAE1'; // Warna krem lembut sesuai gambar
const COLOR_RING_EMPTY = '#F4EEE1';

// ==========================================
// IKON SVG MURNI SESUAI FIGMA
// ==========================================
const HomeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const EyeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const MessageIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

// ==========================================
// KOMPONEN SUB-CARD KPI UTAMA
// ==========================================
const DashboardCard = ({ title, value, subtext, type }) => {
    let subtextColor = "text-[#8A6E3D]"; 
    let iconComponent = <HomeIcon />;

    if (type === "views") {
        iconComponent = <EyeIcon />;
    } else if (type === "favorites") {
        iconComponent = <HeartIcon />;
    } else if (type === "contacts") {
        subtextColor = "text-[#B83E3E]"; 
        iconComponent = <MessageIcon />;
    }

    return (
        <div className="bg-[#FFFBF7] rounded-2xl p-6 border border-[#F4EFEA] flex justify-between items-start shadow-[0_4px_12px_rgba(139,115,85,0.02)] min-h-[145px]">
            <div className="flex flex-col justify-between h-full space-y-1.5">
                <div className="text-[14px] font-medium text-[#5C5449] max-w-[130px] leading-tight">
                    {title}
                </div>
                <div className="text-[32px] font-bold text-[#2A2621] tracking-tight leading-none pt-1">
                    {value}
                </div>
                {subtext && (
                    <div className={`text-[11px] font-bold tracking-wide pt-2 ${subtextColor}`}>
                        {subtext}
                    </div>
                )}
            </div>
            <div className="w-[46px] h-[46px] rounded-xl bg-[#FBF3E9] flex items-center justify-center flex-shrink-0">
                {iconComponent}
            </div>
        </div>
    );
};

const WEEK_COLORS = ['#D4A44C', '#8A6E3D', '#E5C07B', '#A88B4A'];

// ==========================================
// KOMPONEN DASHBOARD UTAMA
// ==========================================
const StatsDashboard = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchSellerDashboard({
                    start_month: selectedMonth,
                    end_month: selectedMonth,
                });
                setDashboard(data.data);
            } catch (err) {
                toast.error('Gagal memuat dashboard.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedMonth]);

    const properties = dashboard?.properties || [];
    const filteredProperties = useMemo(() => {
        if (!searchTerm.trim()) return properties;
        const term = searchTerm.toLowerCase();
        return properties.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.city.toLowerCase().includes(term)
        );
    }, [properties, searchTerm]);

    const views_chart = dashboard?.views_chart || [];
    const kpi = dashboard?.kpi || {};

    // Menentukan bar tertinggi untuk warna emas kustom
    const maxViewValue = useMemo(() => {
        if (views_chart.length === 0) return 0;
        return Math.max(...views_chart.map(item => item.count));
    }, [views_chart]);

    // ==========================================
    // DIAGRAM PERBANDINGAN FAVORIT PER-MINGGU DALAM BULAN
    // ==========================================
    const favoriteStats = useMemo(() => {
        const weekly = dashboard?.favorites_chart || [];
        const total = kpi.total_favorites ?? weekly.reduce((acc, w) => acc + (w.count || 0), 0);

        if (total === 0) {
            return {
                total: 0,
                chartData: [{ name: 'Tidak ada favorit', count: 1, color: COLOR_RING_EMPTY }],
                weeklyList: [],
                isEmpty: true,
            };
        }

        const chartData = weekly.map((w, idx) => ({
            name: w.name,
            count: w.count || 0,
            color: WEEK_COLORS[idx % WEEK_COLORS.length],
        }));

        return {
            total,
            chartData,
            weeklyList: chartData,
            isEmpty: false,
        };
    }, [dashboard, kpi]);

    if (loading) return <div className="flex items-center justify-center py-20 text-sm font-medium text-gray-400">Memuat dashboard...</div>;
    if (!dashboard) return <div className="flex items-center justify-center py-20 text-sm font-medium text-gray-400">Data tidak tersedia.</div>;

    return (
        <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6 bg-[#FAF8F5]/40 min-h-screen antialiased">
            
            {/* --- TOP HEADER SELECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2A2621] tracking-tight"></h1>
                    <p className="text-sm text-[#9C9487] mt-0.5"></p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative bg-white rounded-xl border border-[#EBE3D5] px-4 py-2 flex items-center gap-2 shadow-sm cursor-pointer">
                        <span className="text-[#9C9487] text-xs font-medium">Bulan Ini</span>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="text-xs font-bold text-[#2A2621] bg-transparent focus:outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* --- GRID KPI CARD UTAMA --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard type="properties" title="Total Properti Aktif" value={kpi.active_properties ?? 0}/>
                <DashboardCard type="views" title="Total Dilihat" value={(kpi.total_views ?? 0).toLocaleString('id')}/>
                <DashboardCard type="favorites" title="Total Favorit" value={favoriteStats.total.toLocaleString('id')}/>
                <DashboardCard type="contacts" title="Total Kontak Masuk" value={kpi.total_contacts ?? 0}/>
            </div>

            {/* --- GRAFIK ANALITIK UTAMA --- */}
            <div className="bg-[#FFFBF7] rounded-2xl p-8 border border-[#F4EFEA] shadow-[0_6px_20px_rgba(139,115,85,0.02)]">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-[18px] font-bold text-[#1F1B17]">Grafik Jumlah View Properti</h2>
                        <p className="text-[13px] text-[#7A7165] mt-1">Data harian selama bulan terpilih</p>
                    </div>
                    <div className="flex items-center gap-1.5 cursor-pointer text-[#8A6E3D] hover:text-[#735B32] transition-colors">
                        <span className="text-[14px] font-semibold">Periode Bulan</span>
                    </div>
                </div>
                
                {views_chart.length === 0 ? (
                    <p className="text-gray-400 text-center py-16 text-xs font-medium">Belum ada data views.</p>
                ) : (
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={views_chart} barCategoryGap={0} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontSize: 11, fill: '#3E3A34', fontWeight: 500 }} 
                                    dy={15} 
                                />
                                <YAxis hide={true} /> 
                                <Tooltip cursor={false} />
                                <Bar dataKey="count">
                                    {views_chart.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.count === maxViewValue && maxViewValue > 0 ? COLOR_GOLD : COLOR_BAR_BG} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* --- PANEL BAWAH --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* BLOK PERBANDINGAN FAVORIT PER-MINGGU (DONUT CHART) */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#F0E6D8] shadow-sm flex flex-col justify-between min-h-[420px]">
                    <div>
                        <h2 className="text-base font-bold text-[#2A2621]">Perbandingan Favorit</h2>
                        <p className="text-xs text-[#9C9487] mt-0.5">Distribusi favorit per minggu</p>
                    </div>

                    <div className="relative flex justify-center items-center h-48 my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={favoriteStats.chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={82}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="count"
                                >
                                    {favoriteStats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                {!favoriteStats.isEmpty && (
                                    <Tooltip
                                        formatter={(val, name, item) => [`${item.payload.count} Favorit`, name]}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-[#2A2621] leading-none">{favoriteStats.total}</span>
                            <span className="text-[10px] font-semibold text-[#9C9487] mt-1 uppercase tracking-wider">Favorit</span>
                        </div>
                    </div>

                    {/* LEGEND DISTRIBUSI MINGGUAN */}
                    <div className="space-y-2 border-t border-[#F5EFE4] pt-3 text-xs font-semibold">
                        {favoriteStats.isEmpty ? (
                            <p className="text-center text-[11px] text-gray-400 py-2">Belum ada favorit di bulan ini</p>
                        ) : (
                            favoriteStats.weeklyList.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[#6B6255]">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                    <span className="text-[#2A2621] font-bold shrink-0">{item.count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* TABEL LISTING DAN AKSI DETAIL (KANAN) */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#F0E6D8] shadow-sm min-h-[420px] flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <h2 className="text-base font-bold text-[#2A2621]">Performa Listing</h2>
                            <div className="relative w-full sm:w-60">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs"></span>
                                <input
                                    type="text"
                                    placeholder="Cari listing..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#FAF6F0] border border-[#EBE3D5] rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-[#2A2621] outline-none focus:ring-1 focus:ring-[#D4A44C]"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-[#9C9487] border-b border-[#F5EFE4] uppercase tracking-wider">
                                        <th className="pb-3 font-semibold">Properti</th>
                                        <th className="pb-3 font-semibold text-center">Views</th>
                                        <th className="pb-3 font-semibold text-center">Favorit</th>
                                        <th className="pb-3 font-semibold text-center">Status</th>
                                        
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-medium text-[#4A433A] divide-y divide-[#FAF6F0]">
                                    {filteredProperties.map((p) => (
                                        <tr key={p.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                                            <td className="py-3 flex items-center gap-3">
                                                <img
                                                    src={p.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=120"}
                                                    alt={p.title}
                                                    className="w-10 h-10 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-bold text-[#2A2621] truncate text-[13px]">{p.title}</div>
                                                    <div className="text-[#9C9487] text-[11px] mt-0.5">{p.city}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center font-bold text-[#4A433A]">{p.views_count}</td>
                                            <td className="py-3 text-center font-bold text-[#4A433A]">{p.favorites_count}</td>
                                            <td className="py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider inline-block ${
                                                    p.status === 'published' || p.status === 'aktif' ? 'bg-[#EAF6EB] text-[#2E7D32]' :
                                                    p.status === 'pending' ? 'bg-[#FFF3E0] text-[#E65100]' :
                                                    'bg-[#FFEBEE] text-[#C62828]'
                                                }`}>
                                                    {p.status === 'published' || p.status === 'aktif' ? 'AKTIF' :
                                                     p.status === 'pending' ? 'PENDING' : 'NONAKTIF'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProperties.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center text-xs text-[#9C9487]">
                                                Tidak ada properti untuk ditampilkan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-center border-t border-[#F5EFE4] pt-4 mt-2">
                        <button className="text-xs font-bold text-[#D4A44C] hover:text-[#C2933B] transition-colors inline-flex items-center gap-1 hover:underline">
                            Lihat Semua Properti
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StatsDashboard;
