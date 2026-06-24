import React from 'react';

const features = [
    { title: 'Pencarian Mudah', desc: 'Filter canggih untuk menemukan hunian yang sesuai kriteria Anda.' },
    { title: 'Properti Lengkap', desc: 'Ribuan pilihan properti dari apartemen hingga villa mewah.' },
    { title: 'Proses Cepat', desc: 'Hubungkan langsung dengan agen tanpa perantara rumit.' },
    { title: 'Aman & Terpercaya', desc: 'Setiap listing melalui proses verifikasi yang ketat.' },
];

const testimonials = [
    { nama: 'Budi Santoso', role: 'Pembeli Rumah Modern', teks: 'Proses pembelian sangat transparan dan dibantu oleh agen yang membawa dokumen secara lengkap. Sangat puas dengan layanan dari HousePoint!' },
    { nama: 'Siti Rahma', role: 'Investor Properti', teks: 'Sistem filter mempermudah saya memetakan aset potensial baru di daerah Sleman dengan akurat. Sangat direkomendasikan.' },
    { nama: 'Rian Wijaya', role: 'Penyewa Apartemen', teks: 'Sangat responsif dan amanah. Verifikasi keaslian propertinya membuat tenang bagi pencari properti luar kota seperti saya.' }
];

const FeaturesSection = () => {
    return (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-16 space-y-24">
            
            {/* SEKSI FITUR KEUNGGULAN */}
            <div className="text-center space-y-12">
                <div>
                    <h3 className="text-[24px] font-bold text-[#2c2c2c]">Mengapa Memilih Kami?</h3>
                    <p className="text-[12px] text-[#8b8478] mt-1 max-w-xl mx-auto">
                        HousePoint berkomitmen memberikan pengalaman pencarian properti yang modern, nyaman, dan terpercaya.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, index) => (
                        <div key={index} className="space-y-3">
                            <div className="w-14 h-14 mx-auto rounded-full bg-[#f2e6d1] flex items-center justify-center text-[#c08a2c] text-xl">
                                ✦
                            </div>
                            <h4 className="text-[16px] font-bold text-gray-800">{item.title}</h4>
                            <p className="text-[#7d766a] text-[13px] leading-relaxed px-2">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEKSI TESTIMONI "KATA MEREKA" */}
            <div className="space-y-10">
                <div className="text-center">
                    <h3 className="text-[24px] font-bold text-[#2c2c2c]">Kata Mereka</h3>
                    <p className="text-[12px] text-[#8b8478] mt-1">Kisah sukses para pencari properti yang telah menemukan rumah impian bersama kami</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testi, i) => (
                        <div key={i} className="bg-white border border-[#e5dfd3]/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                            <p className="text-[13px] italic text-gray-600 leading-relaxed">"{testi.teks}"</p>
                            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-50">
                                <div className="w-9 h-9 rounded-full bg-[#d49b37]/20 flex items-center justify-center text-xs font-bold text-[#d49b37]">
                                    👤
                                </div>
                                <div>
                                    <h5 className="text-[13px] font-bold text-gray-800 leading-none">{testi.nama}</h5>
                                    <span className="text-[11px] text-gray-400 mt-1 block">{testi.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;