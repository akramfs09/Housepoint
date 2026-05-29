const stats = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 21H21M5 21V7L12 3L19 7V21M12 21V12" stroke="#C5A065" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="12" width="6" height="9" fill="#FDF8E4" stroke="#C5A065" strokeWidth="0.5" />
        <path d="M7 10H17" stroke="#C5A065" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    value: '1,200+',
    label: 'Properti Eksklusif',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3" stroke="#C5A065" strokeWidth="1.5" />
        <path d="M5 18V17C5 14.2386 7.23858 12 10 12H14C16.7614 12 19 14.2386 19 17V18" stroke="#C5A065" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M19 13V15" stroke="#C5A065" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 13V15" stroke="#C5A065" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    value: '4,500+',
    label: 'Pengguna Aktif',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C5A065" strokeWidth="1.5" />
        <path d="M12 6V12L16 14" stroke="#C5A065" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    value: '150+',
    label: 'Agen Berlisensi',
  },
];

const AuthStatsBar = () => (
  <div className="w-[25%] flex flex-col justify-center items-end gap-5 pr-2">
    {stats.map((stat, index) => (
      <div key={index} className="bg-white rounded-[12px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-4 w-[200px] flex items-center gap-4">
        <div className="w-[42px] h-[42px] rounded-full border border-[#C5A065] flex items-center justify-center flex-shrink-0">
          {stat.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[22px] font-bold text-black leading-none">{stat.value}</span>
          <span className="text-[10px] text-gray-500">{stat.label}</span>
        </div>
      </div>
    ))}
  </div>
);

export default AuthStatsBar;