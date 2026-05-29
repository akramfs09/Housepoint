import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleJualProperti = () => {
        if (!user) {
            navigate('/login');
        } else if (user.role === 'seller') {
            navigate('/seller/dashboard');
        } else if (user.role === 'customer') {
            navigate('/customer/become-seller');
        } else {
            navigate('/admin/dashboard');
        }
    };

    return (
        <header className="w-full bg-[#f7f3eb] border-b border-[#e2d7c3]">
            <div className="max-w-[1180px] mx-auto flex items-center justify-between px-6 py-5">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-[#c7b79a] flex items-center justify-center text-[#8a6d3b] font-bold text-sm">
                        HP
                    </div>
                    <div>
                        <h1 className="text-[20px] font-bold tracking-wide leading-none text-[#2c2c2c]">
                            HOUSEPOINT
                        </h1>
                        <p className="text-[10px] tracking-[4px] text-[#8d8478] mt-1">
                            PROPERTY
                        </p>
                    </div>
                </Link>

                {/* Navigasi */}
                <nav className="flex items-center gap-10 text-[14px] font-medium">
                    <Link to="/" className="text-[#d49b37]">Beranda</Link>
                    <Link to="/properties" className="hover:text-[#d49b37] transition">Cari Properti</Link>
                    <Link to="/about" className="hover:text-[#d49b37] transition">Tentang Kami</Link>
                    <Link to="/contact" className="hover:text-[#d49b37] transition">Kontak</Link>
                </nav>

                {/* Aksi */}
                <div className="flex items-center gap-5">
                    {/* TODO: Favorit - Batch 5 */}
                    <button className="text-[22px]" title="Favorit (segera hadir)">♡</button>

                    <button
                        onClick={handleJualProperti}
                        className="text-[#d49b37] font-semibold text-[14px] hover:opacity-80 transition"
                    >
                        Jual Properti
                    </button>

                    {user ? (
                        <ProfileDropdown />
                    ) : (
                        <Link
                            to="/login"
                            className="border border-[#d7c8b1] rounded-full px-5 py-2 text-[13px] font-medium bg-white shadow-sm hover:bg-gray-50 transition"
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