// resources/js/components/common/ShareModal.jsx
import { useState } from 'react';
import { 
    X, 
    Copy, 
    Check, 
    MapPin, 
    Share2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// SVG Brand Icons
const IconWhatsApp = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.001 3.66 3.744-.993z"/>
    </svg>
);

const IconFacebook = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const IconTwitterX = () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const IconTelegram = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.752-.168.706-.428.943-.679.965-.547.05-1.006-.361-1.536-.708-.829-.543-1.298-.881-2.103-1.411-.93-.613-.327-.95.203-1.501.139-.144 2.55-2.337 2.597-2.537.006-.025.011-.121-.046-.172s-.144-.034-.206-.02c-.088.02-1.493.95-4.214 2.788-.399.274-.76.409-1.084.402-.358-.008-1.047-.203-1.559-.369-.628-.204-1.127-.313-1.083-.661.023-.182.274-.368.752-.559 2.946-1.284 4.912-2.13 5.9-2.538 2.819-1.168 3.406-1.371 3.788-1.378.084-.001.272.02.395.12.104.085.133.201.147.283.014.082.032.268.018.423z"/>
    </svg>
);

const ShareModal = ({ isOpen, onClose, property }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !property) return null;

    const shareUrl = window.location.href;

    const formatPrice = (price) => {
        const numericPrice = Number(price);
        if (!Number.isNaN(numericPrice)) {
            return `Rp ${numericPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
        }
        return price || '';
    };

    const locationText = [property.city || property.location, property.province].filter(Boolean).join(', ');
    const formattedPrice = formatPrice(property.price);
    const shareText = `Halo! Cek properti "${property.title}" (${formattedPrice}) di HousePoint:`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Tautan berhasil disalin!');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error('Gagal menyalin tautan.');
        }
    };

    const socialPlatforms = [
        {
            name: 'WhatsApp',
            icon: IconWhatsApp,
            color: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
            url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
        },
        {
            name: 'Facebook',
            icon: IconFacebook,
            color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'X (Twitter)',
            icon: IconTwitterX,
            color: 'bg-stone-900 hover:bg-black text-white shadow-stone-900/20',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'Telegram',
            icon: IconTelegram,
            color: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        },
    ];

    const imageUrl = property.image_main || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154526-990dced4db42?q=80&w=1200';

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Modal Box */}
            <div 
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e6dac7] overflow-hidden transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0ebe1] bg-[#FAF6F0]/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#d49b37]/15 flex items-center justify-center text-[#d49b37]">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-[#1F1B15]">Bagikan Properti</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Preview Card Properti */}
                    <div className="flex gap-4 p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#EBE3D5]">
                        <img 
                            src={imageUrl} 
                            alt={property.title} 
                            className="w-20 h-20 object-cover rounded-xl shrink-0 border border-amber-900/10 shadow-sm"
                        />
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-xs font-bold text-[#c08a2c] mb-0.5">{formattedPrice}</p>
                            <h4 className="text-xs font-bold text-[#1F1B15] truncate leading-snug">{property.title}</h4>
                            {locationText && (
                                <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 text-[#c08a2c] shrink-0" />
                                    <span className="truncate">{locationText}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Social Icons Grid */}
                    <div>
                        <p className="text-xs font-semibold text-[#78716C] mb-3">Bagikan langsung ke:</p>
                        <div className="grid grid-cols-4 gap-3">
                            {socialPlatforms.map((platform) => {
                                const IconComp = platform.icon;
                                return (
                                    <a
                                        key={platform.name}
                                        href={platform.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 ${platform.color}`}>
                                            <IconComp />
                                        </div>
                                        <span className="text-[11px] font-semibold text-[#4A433A] group-hover:text-[#1F1B15]">
                                            {platform.name}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Copy Link Input Bar */}
                    <div>
                        <p className="text-xs font-semibold text-[#78716C] mb-2">Atau salin tautan:</p>
                        <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#EBE3D5] p-1.5 rounded-2xl">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="w-full bg-transparent px-3 text-xs font-medium text-[#2C241B] outline-none truncate"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shrink-0 ${
                                    copied 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'bg-[#d49b37] hover:bg-[#c08a2c] text-white shadow-sm'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
