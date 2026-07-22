import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, Star, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ReviewCard from '../../components/reviews/ReviewCard';
import { useAuth } from '../../hooks/useAuth';
import {
    deleteMyWebsiteReview,
    fetchMyWebsiteReview,
    fetchPublicWebsiteReviews,
    upsertWebsiteReview,
} from '../../services/api';

const emptyForm = {
    rating: 5,
    review: '',
    show_name: true,
};

const REVIEW_STATUS = {
    pending: {
        label: 'Menunggu Moderasi',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        note: 'Ulasan Anda sudah tersimpan dan menunggu pengecekan admin.',
    },
    approved: {
        label: 'Sudah Tampil',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        note: 'Ulasan Anda sudah tampil di homepage dan halaman ulasan.',
    },
    hidden: {
        label: 'Disembunyikan',
        className: 'border-gray-200 bg-gray-50 text-gray-600',
        note: 'Ulasan Anda sedang disembunyikan oleh admin.',
    },
};

const ReviewsPage = () => {
    const { user, isLoading } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasReview, setHasReview] = useState(false);
    const [myReview, setMyReview] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filters, setFilters] = useState({
        rating: '',
        sort: 'newest',
        date_from: '',
        date_to: '',
        page: 1,
    });

    const loadReviews = async () => {
        setLoading(true);
        try {
            const params = {
                per_page: 9,
                page: filters.page,
                sort: filters.sort,
            };

            if (filters.rating) params.rating = filters.rating;
            if (filters.date_from) params.date_from = filters.date_from;
            if (filters.date_to) params.date_to = filters.date_to;

            const { data } = await fetchPublicWebsiteReviews(params);
            setReviews(data.data?.data || []);
            setMeta(data.data || null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memuat ulasan.');
        } finally {
            setLoading(false);
        }
    };

    const loadMyReview = async () => {
        if (!user) {
            setHasReview(false);
            setForm(emptyForm);
            return;
        }

        try {
            const { data } = await fetchMyWebsiteReview();
            if (data.data) {
                setHasReview(true);
                setMyReview(data.data);
                setForm({
                    rating: data.data.rating || 5,
                    review: data.data.review || '',
                    show_name: data.data.show_name ?? true,
                });
            } else {
                setHasReview(false);
                setMyReview(null);
                setForm(emptyForm);
            }
        } catch {
            toast.error('Gagal memuat ulasan Anda.');
        }
    };

    useEffect(() => {
        loadReviews();
    }, [filters]);

    useEffect(() => {
        if (!isLoading) loadMyReview();
    }, [user, isLoading]);

    const setFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value, page: 1 }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            toast.error('Silakan login terlebih dahulu.');
            return;
        }

        setSubmitting(true);
        try {
            await upsertWebsiteReview(form);
            setHasReview(true);
            await loadMyReview();
            await loadReviews();
            toast.success(hasReview ? 'Ulasan berhasil diperbarui.' : 'Ulasan berhasil diupload.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan ulasan.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!hasReview || !window.confirm('Hapus ulasan Anda?')) return;

        setSubmitting(true);
        try {
            await deleteMyWebsiteReview();
            setHasReview(false);
            setMyReview(null);
            setForm(emptyForm);
            await loadReviews();
            toast.success('Ulasan berhasil dihapus.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus ulasan.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f0e4] text-[#2c2c2c]">
            <Navbar />

            <main className="mx-auto max-w-[1180px] px-5 py-12">
                <section className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49a4a]">
                        <MessageSquareText className="h-6 w-6" />
                    </div>
                    <h1 className="text-[36px] font-black tracking-tight text-[#2c241b]">Ulasan Pengguna</h1>
                    <p className="mx-auto mt-3 max-w-[680px] text-sm font-medium leading-7 text-[#746b5e]">
                        Lihat pengalaman pengguna HousePoint dan bagikan ulasan Anda untuk membantu kami berkembang.
                    </p>
                </section>

                <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
                    <section className="rounded-xl border border-[#eadcc4] bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-black text-[#2c241b]">{hasReview ? 'Edit Ulasan Anda' : 'Upload Ulasan'}</h2>
                        <p className="mt-1 text-xs font-medium leading-5 text-[#8b8478]">
                            Satu akun hanya memiliki satu ulasan. Ulasan baru atau perubahan akan langsung tampil.
                        </p>
                        {myReview && (
                            <div className={`mt-4 rounded-lg border px-4 py-3 text-xs font-bold leading-5 ${REVIEW_STATUS[myReview.status]?.className || REVIEW_STATUS.pending.className}`}>
                                <span className="block text-[11px] font-black uppercase">
                                    {REVIEW_STATUS[myReview.status]?.label || myReview.status}
                                </span>
                                <span className="mt-1 block font-medium">
                                    {REVIEW_STATUS[myReview.status]?.note || 'Status ulasan Anda sedang diproses.'}
                                </span>
                            </div>
                        )}

                        {!user && !isLoading ? (
                            <div className="mt-5 rounded-lg border border-[#eadcc4] bg-[#fffdfa] p-4 text-sm font-medium text-[#746b5e]">
                                Silakan <Link to="/login" className="font-black text-[#9b720f] hover:underline">login</Link> untuk mengupload ulasan.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-[#8a6400]">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => setForm((current) => ({ ...current, rating }))}
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${form.rating >= rating ? 'border-[#c49a4a] bg-[#fff4d9] text-[#c49a4a]' : 'border-[#eadcc4] text-[#b8aa92]'}`}
                                            >
                                                <Star className="h-5 w-5" fill={form.rating >= rating ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-[#8a6400]">Ulasan</label>
                                    <textarea
                                        value={form.review}
                                        onChange={(event) => setForm((current) => ({ ...current, review: event.target.value }))}
                                        maxLength={1500}
                                        rows={7}
                                        placeholder="Tulis pengalaman Anda menggunakan HousePoint."
                                        className="w-full resize-none rounded-lg border border-[#eadcc4] px-3 py-3 text-sm outline-none focus:border-[#c49a4a]"
                                        required
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-sm font-medium text-[#5f574c]">
                                    <input
                                        type="checkbox"
                                        checked={form.show_name}
                                        onChange={(event) => setForm((current) => ({ ...current, show_name: event.target.checked }))}
                                        className="h-4 w-4 rounded border-[#c49a4a] text-[#c49a4a]"
                                    />
                                    Tampilkan nama saya
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        disabled={submitting || !user}
                                        className="rounded-lg bg-[#c49a4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#9b720f] disabled:opacity-50"
                                    >
                                        {submitting ? 'Menyimpan...' : hasReview ? 'Update Ulasan' : 'Upload Ulasan'}
                                    </button>
                                    {hasReview && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={submitting}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus Ulasan
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </section>

                    <section>
                        <div className="mb-5 grid gap-3 rounded-xl border border-[#eadcc4] bg-white p-4 shadow-sm md:grid-cols-4">
                            <select
                                value={filters.rating}
                                onChange={(event) => setFilter('rating', event.target.value)}
                                className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm font-medium outline-none focus:border-[#c49a4a]"
                            >
                                <option value="">Semua Bintang</option>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <option key={rating} value={rating}>{rating} Bintang</option>
                                ))}
                            </select>
                            <select
                                value={filters.sort}
                                onChange={(event) => setFilter('sort', event.target.value)}
                                className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm font-medium outline-none focus:border-[#c49a4a]"
                            >
                                <option value="newest">Tanggal Terbaru</option>
                                <option value="oldest">Tanggal Terlama</option>
                            </select>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(event) => setFilter('date_from', event.target.value)}
                                className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm font-medium outline-none focus:border-[#c49a4a]"
                            />
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(event) => setFilter('date_to', event.target.value)}
                                className="h-11 rounded-lg border border-[#eadcc4] px-3 text-sm font-medium outline-none focus:border-[#c49a4a]"
                            />
                        </div>

                        {loading ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div key={item} className="h-[240px] animate-pulse rounded-xl border border-[#eadcc4] bg-white/70" />
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="rounded-xl border border-[#eadcc4] bg-white py-16 text-center text-sm font-medium text-[#8b8478]">
                                Belum ada ulasan yang sesuai filter.
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )}

                        {meta?.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    type="button"
                                    disabled={filters.page <= 1}
                                    onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                                    className="rounded-lg border border-[#eadcc4] bg-white px-4 py-2 text-sm font-bold text-[#746b5e] disabled:opacity-50"
                                >
                                    Sebelumnya
                                </button>
                                <span className="rounded-lg bg-[#c49a4a] px-4 py-2 text-sm font-black text-white">
                                    {filters.page}
                                </span>
                                <button
                                    type="button"
                                    disabled={filters.page >= meta.last_page}
                                    onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                                    className="rounded-lg border border-[#eadcc4] bg-white px-4 py-2 text-sm font-bold text-[#746b5e] disabled:opacity-50"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReviewsPage;
