const stats = [
    ['1,200+', 'Properti Eksklusif'],
    ['4,500+', 'Pengguna Aktif'],
    ['150+', 'Agen Berlisensi'],
];

const StatsBar = () => {
    return (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 -mt-10 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#f7f3eb] rounded-2xl shadow-md px-5 sm:px-8 py-5 sm:py-6 flex items-center gap-4 sm:gap-5 border border-[#e5d8c0]"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#f2e6d1] flex items-center justify-center text-[#c08a2c] text-xl shrink-0">
                            ✦
                        </div>
                        <div>
                            <h3 className="text-[26px] sm:text-[30px] font-bold leading-none">
                                {item[0]}
                            </h3>
                            <p className="text-[14px] text-[#8b8478] mt-2">{item[1]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsBar;
