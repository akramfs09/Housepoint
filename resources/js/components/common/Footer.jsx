import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#2d261d] text-white mt-8">
            <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                    <Link to="/" className="inline-flex items-center gap-2 mb-5 max-w-full">
                        <div className="w-10 h-10 rounded-full border border-[#8d7a5f] flex items-center justify-center text-[#d6b178] font-bold text-sm shrink-0">
                            HP
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold leading-none">
                                HOUSEPOINT
                            </h1>
                            <p className="text-[10px] tracking-[3px] sm:tracking-[4px] text-[#bca88b] mt-1">
                                PROPERTY
                            </p>
                        </div>
                    </Link>

                    <p className="text-[#c9bca8] leading-7 text-[14px] max-w-[260px]">
                        HousePoint adalah platform katalog properti modern untuk membantu
                        Anda menemukan properti terbaik dengan mudah dan aman.
                    </p>
                </div>

                <div>
                    <h5 className="font-semibold text-[18px] mb-5">Navigasi</h5>
                    <ul className="space-y-3 text-[#c9bca8] text-[14px]">
                        <li><Link to="/" className="hover:text-white transition">Beranda</Link></li>
                        <li><Link to="/properties" className="hover:text-white transition">Properti</Link></li>
                        <li><Link to="/about" className="hover:text-white transition">Tentang</Link></li>
                        <li><Link to="/contact" className="hover:text-white transition">Kontak</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-semibold text-[18px] mb-5">Layanan</h5>
                    <ul className="space-y-3 text-[#c9bca8] text-[14px]">
                        <li>Beli Properti</li>
                        <li>Jual Properti</li>
                        <li>Sewa Villa</li>
                        <li>Management Asset</li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-semibold text-[18px] mb-5">Hubungi Kami</h5>
                    <div className="space-y-4 text-[#c9bca8] text-[14px] leading-7">
                        <p>
                            Jl. Magelang Km 16, Surognatan, Mororejo Kidul, Tempel, Sleman
                        </p>
                        <p>+62 8185 1234</p>
                        <p>@housepoint.id</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#c1b39d]">
                    <p>© 2026 HousePoint. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <p>Privasi</p>
                        <p>Ketentuan</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
