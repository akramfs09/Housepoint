import Navbar from '../../components/common/Navbar';
import MainContent from '../../components/common/MainContent';
import Footer from '../../components/common/Footer';

const SellerDashboard = () => {
    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />
            <MainContent />
            <Footer />
        </div>
    );
};

export default SellerDashboard;