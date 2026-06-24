import React from 'react';

const stats = [
    { value: '1,200+', label: 'Properti Pilihan' },
    { value: '4,500+', label: 'Pengguna Aktif' },
    { value: '150+', label: 'Agen Berlisensi' },
];

const StatsBar = () => {
    return (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-12 md:pt-16 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-[860px] mx-auto">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white/40 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] px-6 py-4 flex items-center gap-4 border border-white/60"
                    >
                        <div className="w-11 h-11 rounded-xl bg-[#f2e6d1]/80 flex items-center justify-center text-[#c08a2c] text-base font-bold shrink-0 shadow-sm">
                            💼
                        </div>
                        <div>
                            <h3 className="text-[24px] sm:text-[26px] font-extrabold text-[#2c2c2c] leading-tight">
                                {item.value}
                            </h3>
                            <p className="text-[12px] text-[#8b8478] font-medium tracking-wide mt-0.5">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsBar;