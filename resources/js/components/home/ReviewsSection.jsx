import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import ReviewCard from '../reviews/ReviewCard';
import { fetchFeaturedWebsiteReviews } from '../../services/api';

const ReviewsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        fetchFeaturedWebsiteReviews()
            .then(({ data }) => {
                if (mounted) setReviews(data.data || []);
            })
            .catch(() => {
                if (mounted) setReviews([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section className="bg-[#FDF8E4] px-5 py-14">
            <div className="mx-auto max-w-[1180px]">
                <div className="mb-8 text-center">
                    <h2 className="text-[28px] font-black tracking-tight text-[#2c241b]">Kata Mereka</h2>
                    <p className="mt-2 text-sm font-medium text-[#746b5e]">
                        Kepuasan pelanggan adalah prioritas utama dalam setiap pengalaman pencarian properti.
                    </p>
                </div>

                {loading ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-[230px] animate-pulse rounded-xl border border-[#eadcc4] bg-white/70" />
                        ))}
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#eadcc4] bg-white py-12 text-center text-sm font-medium text-[#8b8478]">
                        Belum ada ulasan yang tampil.
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link
                        to="/reviews"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#c49a4a] bg-white px-5 py-3 text-sm font-black text-[#9b720f] shadow-sm transition hover:bg-[#fff4d9]"
                    >
                        <MessageSquareText className="h-4 w-4" />
                        Lihat Selengkapnya
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
