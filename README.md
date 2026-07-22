# HousePoint

HousePoint adalah platform properti berbasis Laravel + React yang mendukung pencarian, detail properti, chat antara customer dan seller, verifikasi seller, moderasi properti, pembayaran Midtrans, notifikasi real-time, laporan pengguna, ulasan website, riwayat pencarian, dan pengelolaan konten website oleh superadmin.

## Tech Stack

- Backend: Laravel 13, PHP 8.3
- Frontend: React 19, Vite, React Router
- Styling: Tailwind CSS
- Auth: Laravel Sanctum
- Real-time: Laravel Reverb, Pusher
- Storage: Cloudflare R2 public/private
- Payment: Midtrans Snap
- Charts/UI support: Recharts, Lucide React, React Hot Toast

## Fitur Utama

- Autentikasi login, register, OTP, reset password
- Pencarian properti dengan filter
- Detail properti lengkap dengan gambar, video, dan Google Maps
- Favorit properti dan riwayat pencarian
- Chat customer dan seller
- Upgrade seller dengan verifikasi KTP
- Kelola properti seller: draft, edit, submit moderasi, hapus
- Moderasi properti oleh admin dan superadmin
- Pembayaran listing dan unggulan
- Notifikasi untuk user, seller, admin, dan superadmin
- Laporan pengguna dengan thread balasan
- Ulasan website oleh user
- Kelola data website oleh superadmin: hero section, about, contact, footer, branding logo, dan lokasi
- Kelola seller, user, admin, payment history, dan audit logs

## Peran Pengguna

- Customer
- Seller
- Admin
- Superadmin

## Instalasi

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Atur koneksi database, storage R2, Midtrans, dan Reverb di `.env` lalu jalankan:

```bash
php artisan migrate --force
php artisan db:seed --force
```

## Menjalankan Project

### Development

```bash
composer run dev
```

Perintah ini akan menjalankan:

- Laravel server
- queue listener
- Vite dev server

### Build Frontend

```bash
npm run build
```

## Struktur Akses Fitur

- Public: home, katalog properti, detail properti, halaman agen, about, contact, reviews
- Customer: favorites, riwayat pencarian, laporan pengguna, ulasan website, chat
- Seller: dashboard, profil agen, kelola properti, pembayaran, chat, notifikasi
- Admin: verifikasi seller, moderasi properti, kelola user, laporan, payment history
- Superadmin: semua akses admin ditambah settings website, branding, review KTP, dan kontrol penuh data sistem

## Catatan Implementasi

- Identitas seller di UI dan API diarahkan ke istilah **Agen**
- Media publik disimpan di R2 public
- Dokumen sensitif seperti KTP disimpan di R2 private
- Detail properti dapat menampilkan gambar, video, dan lokasi Google Maps
- Halaman publik agen memakai route `/agen/{sellerId}`

## Testing

```bash
php artisan test
```

## License

MIT
