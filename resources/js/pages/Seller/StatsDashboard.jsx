import { useState, useEffect, useMemo } from 'react';
import { fetchSellerDashboard } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const DONUT_COLORS = [
    '#d49b37', '#e6d7c4', '#b8860b', '#8b7355', '#cd853f',
    '#f4a460', '#daa520', '#bdb76b', '#bc8f8f', '#a0522d'
];

const DashboardCard = ({ title, value, subtitle, icon }) => (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-[#e5d8c0] flex flex-col">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <span>{icon}</span>
            <span>{title}</span>
        </div>
        <div className="text-2xl font-bold text-[#2c2c2c]">{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
);

const StatsDashboard = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [startMonth, setStartMonth] = useState(currentMonth);
    const [endMonth, setEndMonth] = useState(currentMonth);

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchSellerDashboard({
                    start_month: startMonth,
                    end_month: endMonth,
                });
                setDashboard(data.data);
            } catch (err) {
                toast.error('Gagal memuat dashboard.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [startMonth, endMonth]);

    // Semua pemrosesan data dilakukan di sini, sebelum return awal
    const properties = dashboard?.properties || [];
    const filteredProperties = useMemo(() => {
        if (!searchTerm.trim()) return properties;
        const term = searchTerm.toLowerCase();
        return properties.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.city.toLowerCase().includes(term)
        );
    }, [properties, searchTerm]);

    // Data untuk donut chart
    const favorites_chart = dashboard?.favorites_chart || [];
    const pieData = useMemo(() =>
        favorites_chart.map(item => ({
            name: item.week,
            value: item.count,
        })),
    [favorites_chart]);

    // Views chart
    const views_chart = dashboard?.views_chart || [];
    const kpi = dashboard?.kpi || {};

    if (loading) return <div className="flex items-center justify-center py-20"><p>Memuat dashboard...</p></div>;
    if (!dashboard) return <div className="flex items-center justify-center py-20"><p>Data tidak tersedia.</p></div>;

    return (
        <div className="space-y-8">
            {/* Header dengan pemilih bulan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2c2c2c]">Statistik Properti</h1>
                    <p className="text-sm text-gray-500">Pantau performa properti Anda</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-[#e5d8c0] px-4 py-2">
                    <input
                        type="month"
                        value={startMonth}
                        onChange={(e) => setStartMonth(e.target.value)}
                        className="text-sm bg-transparent focus:outline-none text-[#2c2c2c]"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                        type="month"
                        value={endMonth}
                        onChange={(e) => setEndMonth(e.target.value)}
                        className="text-sm bg-transparent focus:outline-none text-[#2c2c2c]"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard icon="🏠" title="Total Properti Aktif" value={kpi.active_properties ?? 0} />
                <DashboardCard icon="👁️" title="Total Dilihat" value={(kpi.total_views ?? 0).toLocaleString('id')} />
                <DashboardCard icon="❤️" title="Total Favorit" value={kpi.total_favorites ?? 0} />
                <DashboardCard icon="💬" title="Total Kontak Masuk" value={kpi.total_contacts ?? 0} />
            </div>

            {/* Grafik Views Harian */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#e5d8c0]">
                <h2 className="text-lg font-bold mb-4">Grafik Jumlah View Properti</h2>
                {views_chart.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Belum ada data views.</p>
                ) : (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <div style={{ width: views_chart.length * 40, minWidth: '100%' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={views_chart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#d49b37" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Baris Bawah: Donut Chart Favorit per Minggu + Tabel Performa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart Favorit per Minggu */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-[#e5d8c0]">
                    <h2 className="text-lg font-bold mb-4">Distribusi Favorit per Minggu</h2>
                    {pieData.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada data favorit.</p>
                    ) : (
                        <div className="flex flex-col items-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <p className="text-sm text-gray-500 mt-2">
                                Total {favorites_chart.length} minggu
                            </p>
                        </div>
                    )}
                </div>

                {/* Tabel Performa Listing */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-[#e5d8c0]">
                    <h2 className="text-lg font-bold mb-4">Performa Listing</h2>
                    <input
                        type="text"
                        placeholder="Cari listing..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-2">Properti</th>
                                    <th className="pb-2">Views</th>
                                    <th className="pb-2">Favorit</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProperties.map((p) => (
                                    <tr key={p.id} className="border-b last:border-b-0">
                                        <td className="py-2">
                                            <div className="font-medium">{p.title}</div>
                                            <div className="text-xs text-gray-400">{p.city}</div>
                                        </td>
                                        <td className="py-2">{p.views_count}</td>
                                        <td className="py-2">{p.favorites_count}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                p.status === 'published' ? 'bg-green-100 text-green-700' :
                                                p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {p.status === 'published' ? 'AKTIF' : p.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProperties.length === 0 && (
                        <p className="text-gray-400 text-center py-4">
                            {properties.length === 0 ? 'Belum ada properti.' : 'Tidak ada properti yang cocok.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;