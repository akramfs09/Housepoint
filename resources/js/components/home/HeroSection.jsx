const HeroSection = () => {
    return (
        <section className="relative min-h-[620px] md:h-[560px] overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1600&auto=format&fit=crop"
                alt="hero"
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 max-w-[1180px] mx-auto px-4 sm:px-6 pt-16 md:pt-24">
                <div className="max-w-[520px] text-white">
                    <h2 className="text-[38px] sm:text-[48px] md:text-[58px] leading-[1.15] font-bold">
                        Temukan Rumah <br /> Impian Anda
                    </h2>
                    <p className="mt-5 text-[16px] leading-7 text-white/90 max-w-[450px]">
                        Jelajahi ribuan properti eksklusif dari berbagai kota di Indonesia
                        dengan proses cepat, aman, dan terpercaya.
                    </p>
                </div>

                <div className="mt-10 md:mt-16 bg-white rounded-2xl shadow-2xl p-5 flex flex-col md:flex-row md:items-end gap-4 max-w-[980px]">
                    <div className="w-full md:flex-1">
                        <label className="block text-[12px] font-semibold text-[#8c8577] mb-2">
                            Lokasi
                        </label>
                        <div className="border border-[#e5dfd3] rounded-xl px-4 h-[52px] flex items-center text-[14px] text-[#8a847a]">
                            Cari kota, area...
                        </div>
                    </div>

                    <div className="w-full md:w-[220px]">
                        <label className="block text-[12px] font-semibold text-[#8c8577] mb-2">
                            Tipe Properti
                        </label>
                        <div className="border border-[#e5dfd3] rounded-xl px-4 h-[52px] flex items-center justify-between text-[14px] text-[#5a554c]">
                            Semua Tipe
                            <span>⌄</span>
                        </div>
                    </div>

                    <div className="w-full md:w-[220px]">
                        <label className="block text-[12px] font-semibold text-[#8c8577] mb-2">
                            Harga
                        </label>
                        <div className="border border-[#e5dfd3] rounded-xl px-4 h-[52px] flex items-center justify-between text-[14px] text-[#5a554c]">
                            Berapapun
                            <span>⌄</span>
                        </div>
                    </div>

                    <button
                        className="h-[52px] w-full md:w-auto px-8 rounded-xl bg-[#d49b37] text-white font-semibold text-[14px] shadow-lg hover:opacity-95 transition cursor-not-allowed"
                        title="Fitur pencarian akan hadir di Batch 3"
                    >
                        Cari Sekarang
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
