import Navbar from '../components/common/Navbar';
import MainContent from '../components/common/MainContent';
import Footer from '../components/common/Footer';
import { WebsiteContentProvider } from '../hooks/useWebsiteContent';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#FDF8E4] text-[#1F1B15] font-sans selection:bg-[#D4A44C]/30">
            <Navbar />
            <WebsiteContentProvider>
                <MainContent />
                <Footer />
            </WebsiteContentProvider>
        </div>
    );
};

export default HomePage;
