import { Star, ShieldCheck } from 'lucide-react';

const formatDate = (value) => {
    if (!value) return '';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
};

const ReviewCard = ({ review }) => {
    const name = review?.user?.name || 'Pengguna HousePoint';
    const initial = name.charAt(0).toUpperCase();
    const avatarUrl = review?.user?.avatar_url;
    const isSeller = review?.user?.role === 'seller' || Boolean(review?.user?.is_seller) || Boolean(review?.is_seller);

    return (
        <article className="flex h-full flex-col rounded-xl border border-[#eadcc4] bg-white p-5 shadow-[0_10px_28px_rgba(75,55,25,0.08)]">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff4d9] text-sm font-black text-[#9b720f]">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                        initial
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#2c241b]">{name}</h3>
                    <p className="text-xs font-medium text-[#8b8478]">{formatDate(review?.created_at)}</p>
                </div>
            </div>

            <div className="mt-4 flex gap-1 text-[#d4a44c]">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                        key={rating}
                        className="h-4 w-4"
                        fill={review?.rating >= rating ? 'currentColor' : 'none'}
                    />
                ))}
            </div>

            <p className="mt-4 line-clamp-5 flex-1 text-sm font-medium leading-7 text-[#5f574c]">
                "{review?.review}"
            </p>

            {isSeller && (
                <div className="mt-6 flex items-center justify-between border-t border-[#eadcc4]/60 pt-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#8b8478]">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Agen Terverifikasi
                    </span>
                </div>
            )}
        </article>
    );
};

export default ReviewCard;
