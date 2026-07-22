import React from 'react';
import { Home, Users, Medal } from 'lucide-react';

const stats = [
    { value: '1,200+', label: 'Properti Terjual', icon: Home },
    { value: '4,500+', label: 'Pengguna Aktif', icon: Users },
    { value: '150+', label: 'Agen Berkualitas', icon: Medal },
];

const StatsBar = () => {
    return (
        <div className="relative md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2 w-full max-w-[1100px] px-4 sm:px-6 z-20 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-[30px] py-8 md:py-0 bg-[#2c241b] md:bg-transparent">
            {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        className="group flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 rounded-2xl border border-white/30 bg-white/10 md:bg-white/20 px-8 md:px-[50px] lg:px-[80px] py-4 md:py-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:border-white/50 w-full max-w-[280px] sm:max-w-[320px] md:w-auto"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fcf8f0] text-[#c49a4a] shadow-sm">
                            <Icon className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-[22px] font-black text-white sm:text-[26px] leading-tight">
                                {item.value}
                            </h3>
                            <p className="text-[12px] font-medium text-white/90 sm:text-[14px]">
                                {item.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsBar;