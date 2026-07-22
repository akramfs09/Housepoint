import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Heart, UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';
import ProfileDropdown from './ProfileDropdown';
import NotificationBell from './NotificationBell';

const navItems = [
    { label: 'Beranda', path: '/' },
    { label: 'Cari Properti', path: '/properties' },
    { label: 'Tentang Kami', path: '/about' },
    { label: 'Kontak', path: '/contact' },
];

const Navbar = () => {
    const { user } = useAuth();
    const { content } = useWebsiteContent();
    const navigate = useNavigate();
    const location = useLocation();
    const brandLogo = content.branding?.header_logo_url || '/logo.png';
    const brandName = content.branding?.brand_name || 'HOUSEPOINT';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleJualProperti = () => {
        setMobileMenuOpen(false);
        if (!user) {
            navigate('/login');
        } else if (user.role === 'seller') {
            navigate('/seller/properties');
        } else if (user.role === 'customer') {
            navigate('/customer/become-seller');
        } else {
            navigate('/admin/dashboard');
        }
    };


    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 h-[84px] w-full border-b border-[#ebdcb9]/60 bg-[#fcf8f0]/95 shadow-sm backdrop-blur-lg transition-all duration-300">
            <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex min-w-[110px] sm:min-w-[150px] items-center gap-2 group">
                    <img
                        src={brandLogo}
                        alt={brandName}
                        className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                </Link>

                <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`py-2 text-[14px] font-bold tracking-wide transition-colors duration-300 ${
                                    active ? 'text-[#c49a4a]' : 'text-[#8b7e66] hover:text-[#c49a4a]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-3.5 sm:gap-5">
                    <div className="flex items-center gap-3.5 sm:gap-5">
                        <Link
                            to={user ? '/favorites' : '/login'}
                            className="text-[#5a5243] transition-colors hover:text-[#c49a4a]"
                            title="Properti Favorit"
                        >
                            <Heart className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2} />
                        </Link>

                        <button
                            type="button"
                            onClick={handleJualProperti}
                            className="hidden whitespace-nowrap text-[14px] font-bold text-[#c49a4a] transition-colors hover:text-[#a57f36] sm:block"
                        >
                            Jual Properti
                        </button>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-3 pl-1 sm:pl-2">
                            <NotificationBell />
                            <ProfileDropdown />
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 rounded-full border-[1.5px] border-[#5a5243]/20 bg-white px-4 py-1.5 sm:px-5 sm:py-2 text-[12px] sm:text-[13px] text-[#5a5243] shadow-sm transition-all hover:border-[#c49a4a] hover:text-[#c49a4a]"
                            title="Masuk atau Daftar"
                        >
                            <UserCircle className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]" strokeWidth={2} />
                            <span className="hidden text-[13px] font-bold sm:block">Login | Daftar</span>
                        </Link>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#ebdcb9]/40 bg-white/50 text-[#5a5243] hover:text-[#c49a4a] lg:hidden focus:outline-none transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2} />
                        ) : (
                            <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile/Tablet Menu Panel */}
            {mobileMenuOpen && (
                <div className="absolute top-[83px] left-0 w-full border-b border-[#ebdcb9]/60 bg-[#fcf8f0]/95 shadow-md backdrop-blur-lg px-6 py-5 lg:hidden transition-all duration-300">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`py-2.5 px-4 rounded-xl text-[15px] font-bold tracking-wide transition-all duration-300 ${
                                        active 
                                            ? 'text-[#c49a4a] bg-[#c49a4a]/10' 
                                            : 'text-[#8b7e66] hover:text-[#c49a4a] hover:bg-[#c49a4a]/5'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
