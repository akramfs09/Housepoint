import Navbar from '../../components/common/Navbar';
import MainContent from '../../components/common/MainContent';
import Footer from '../../components/common/Footer';
import { WebsiteContentProvider } from '../../hooks/useWebsiteContent';

const CustomerDashboard = () => {
    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />
            <WebsiteContentProvider>
                <MainContent />
                <Footer />
            </WebsiteContentProvider>
        </div>
    );
};

export default CustomerDashboard;
