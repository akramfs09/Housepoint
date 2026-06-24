import Navbar from '../components/common/Navbar';
import MainContent from '../components/common/MainContent';
import Footer from '../components/common/Footer';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#FDF8E4] text-[#1F1B15] font-sans selection:bg-[#D4A44C]/30">
            <Navbar />
            <MainContent />
            <Footer />
        </div>
    );
};

export default HomePage;