import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';

const Footer = () => {
    const { content } = useWebsiteContent();
    const footer = content.footer;
    const brand = content.branding || {};
    const footerLogo = brand.footer_logo_url || brand.header_logo_url || '/logo.png';
    const brandName = brand.brand_name || 'HOUSEPOINT';

    return (
        <footer className="bg-[#2c241b] text-white">
            <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 px-5 py-9 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.5fr] lg:gap-14">
                <div>
                    <Link to="/" className="mb-4 inline-flex items-center gap-2">
                        <img src={footerLogo} alt={brandName} className="h-10 w-auto max-w-[170px] object-contain" />
                    </Link>

                    <p className="max-w-[260px] text-[10px] font-medium leading-5 text-[#b9aa90]">
                        {footer.description}
                    </p>
                </div>

                <div>
                    <h5 className="mb-4 text-[12px] font-semibold text-[#d8c8a8]">Navigasi</h5>
                    <ul className="space-y-2.5 text-[10px] font-medium text-[#a99573]">
                        <li><Link to="/" className="transition hover:text-white">Beranda</Link></li>
                        <li><Link to="/properties" className="transition hover:text-white">Properti</Link></li>
                        <li><Link to="/about" className="transition hover:text-white">Tentang</Link></li>
                        <li><Link to="/contact" className="transition hover:text-white">Kontak</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="mb-4 text-[12px] font-semibold text-[#d8c8a8]">Layanan</h5>
                    <ul className="space-y-2.5 text-[10px] font-medium text-[#a99573]">
                        {footer.services.map((service, index) => (
                            <li key={`${service}-${index}`}>{service}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h5 className="mb-4 text-[12px] font-semibold text-[#d8c8a8]">Hubungi Kami</h5>
                    <div className="space-y-2.5 text-[10px] font-medium leading-5 text-[#a99573]">
                        <p className="flex gap-2">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#c49a4a]" />
                            <span>{footer.address}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-[#c49a4a]" />
                            <span>{footer.phone}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-[#c49a4a]" />
                            <span>{footer.email}</span>
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-[#a99573]">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#a99573] text-[8px] font-bold">ig</span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#a99573] text-[8px] font-bold">f</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[720px] border-t border-[#8e7d60]/40" />

            <div className="mx-auto flex max-w-[1120px] items-center justify-center px-5 py-3 text-[9px] font-medium text-[#9c8b70]">
                <p>© 2026 HousePoint. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
