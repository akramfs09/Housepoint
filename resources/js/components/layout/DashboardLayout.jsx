import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, pageTitle, pageDescription }) => {
    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />
            <div className="max-w-[1340px] mx-auto flex gap-0 px-4 py-8">
                <aside className="w-[280px] flex-shrink-0">
                    <Sidebar />
                </aside>
                <main className="flex-1 min-w-0 pl-8">
                    {(pageTitle || pageDescription) && (
                        <div className="mb-8">
                            {pageTitle && <h1 className="text-2xl font-bold text-[#2c2c2c]">{pageTitle}</h1>}
                            {pageDescription && <p className="text-[#8b8478] text-sm mt-1">{pageDescription}</p>}
                        </div>
                    )}
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardLayout;