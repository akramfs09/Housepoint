import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProfileDropdown from './ProfileDropdown';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleJualProperti = () => {
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

    return (
        <header className="w-full bg-[#f7f3eb] border-b border-[#e2d7c3]">
            <div className="max-w-[1180px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5">
                <Link to="/" className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-[#c7b79a] flex items-center justify-center text-[#8a6d3b] font-bold text-sm shrink-0">
                        HP
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-[16px] sm:text-[20px] font-bold tracking-wide leading-none text-[#2c2c2c]">
                            HOUSEPOINT
                        </h1>
                        <p className="text-[9px] sm:text-[10px] tracking-[3px] sm:tracking-[4px] text-[#8d8478] mt-1">
                            PROPERTY
                        </p>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-10 text-[14px] font-medium">
                    <Link to="/" className="text-[#d49b37] hover:text-[#d49b37] transition">Beranda</Link>
                    <Link to="/properties" className="hover:text-[#d49b37] transition">Cari Properti</Link>
                    <Link to="/about" className="hover:text-[#d49b37] transition">Tentang Kami</Link>
                    <Link to="/contact" className="hover:text-[#d49b37] transition">Kontak</Link>
                </nav>

                <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
                    <button className="hidden sm:block text-[22px] cursor-not-allowed" title="Favorit (segera hadir)">♡</button>

                    <button
                        onClick={handleJualProperti}
                        className="hidden sm:block text-[#d49b37] font-semibold text-[14px] hover:opacity-80 transition whitespace-nowrap"
                    >
                        Jual Properti
                    </button>

                    {user ? (
                        <>
                            <NotificationBell />
                            <ProfileDropdown />
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="border border-[#d7c8b1] rounded-full px-3 sm:px-5 py-2 text-[12px] sm:text-[13px] font-medium bg-white shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
                        >
                            Login / Daftar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
