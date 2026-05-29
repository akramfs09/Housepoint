import Navbar from '../components/common/Navbar';
import HeroSection from '../components/home/HeroSection';
import StatsBar from '../components/home/StatsBar';
import FeaturedProperties from '../components/home/FeaturedProperties';
import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/common/Footer';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#efe6d5] text-[#2c2c2c] font-sans">
            <Navbar />
            <HeroSection />
            <StatsBar />
            <FeaturedProperties />
            <FeaturesSection />
            <Footer />
        </div>
    );
};

export default HomePage;