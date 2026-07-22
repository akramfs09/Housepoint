import { Home, Search, ShieldCheck, Zap } from 'lucide-react';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';

const ICONS = {
    search: Search,
    home: Home,
    zap: Zap,
    shield: ShieldCheck,
};

const FeaturesSection = () => {
    const { content } = useWebsiteContent();
    const about = content.about;
    const features = about.features || [];

    return (
        <section className="mx-auto max-w-[1180px] px-4 pb-20 pt-14 sm:px-6">
            <div className="text-center">
                <h3 className="text-[28px] font-black tracking-tight text-[#2c241b]">
                    Mengapa Memilih Kami?
                </h3>
                <p className="mx-auto mt-2 max-w-[760px] text-[14px] font-medium leading-6 text-[#6f665a]">
                    HousePoint menghadirkan pengalaman pencarian properti yang modern, nyaman, dan terpercaya.
                </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
                {features.slice(0, 4).map(({ title, desc, icon }) => {
                    const Icon = ICONS[icon] || Search;

                    return (
                        <div key={title} className="text-center">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-[#d49b37] text-[#c49a4a] bg-white/50">
                                <Icon className="h-12 w-12" strokeWidth={1.5} />
                            </div>
                            <h4 className="mt-5 text-[18px] font-black leading-tight text-[#2c241b]">
                                {title}
                            </h4>
                            <p className="mx-auto mt-2 max-w-[240px] text-[13px] font-medium leading-6 text-[#7b7164]">
                                {desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default FeaturesSection;
