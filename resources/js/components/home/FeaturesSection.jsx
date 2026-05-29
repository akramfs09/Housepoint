const features = [
    {
        title: 'Pencarian Mudah',
        desc: 'Filter canggih untuk menemukan hunian yang sesuai kriteria Anda.',
    },
    {
        title: 'Properti Lengkap',
        desc: 'Ribuan pilihan properti dari apartemen hingga villa mewah.',
    },
    {
        title: 'Proses Cepat',
        desc: 'Hubungkan langsung dengan agen tanpa perantara rumit.',
    },
    {
        title: 'Aman & Terpercaya',
        desc: 'Setiap listing melalui proses verifikasi yang ketat.',
    },
];

const FeaturesSection = () => {
    return (
        <section className="max-w-[1180px] mx-auto px-6 py-16">
            <div className="grid grid-cols-4 gap-10 text-center">
                {features.map((feature, index) => (
                    <div key={index}>
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#f2e6d1] flex items-center justify-center text-[#c08a2c] text-2xl mb-5">
                            ✦
                        </div>
                        <h4 className="text-[24px] font-bold mb-3">{feature.title}</h4>
                        <p className="text-[#7d766a] leading-7 text-[15px]">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;