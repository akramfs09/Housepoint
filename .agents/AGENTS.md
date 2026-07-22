# HousePoint — Project Rules

## Konteks Proyek
HousePoint adalah platform properti (Proyek Akhir D3 Ilmu Komputer) berbasis **Laravel 13 + React 19 SPA**.
Dokumentasi lengkap arsitektur, schema, routes, dan patterns ada di skill `housepoint-context`.

## Aturan Penting

### Jangan Analisis Ulang
- **JANGAN** menganalisis ulang struktur repositori dari awal di setiap prompt.
- Gunakan skill `housepoint-context` sebagai referensi utama.
- Hanya baca file spesifik jika diminta atau diperlukan untuk task tertentu.

### Konvensi Kode

#### Backend (Laravel/PHP)
- Gunakan **Controller → Service pattern** (logic di `app/Services/`)
- Validasi input via **Form Request** (`app/Http/Requests/`)
- Response format via **API Resource** (`app/Http/Resources/`)
- Semua response menggunakan trait `ApiResponse` untuk format konsisten
- Gunakan **Enum** untuk status constants (`app/Enums/`)
- Route baru ditambahkan di `routes/api.php` dengan grouping yang sesuai

#### Frontend (React)
- Semua API call melalui `resources/js/services/api.js`
- State auth global via `AuthContext` + `useAuth` hook
- Halaman baru dibuat di `resources/js/pages/{Role}/`
- Komponen reusable di `resources/js/components/`
- Route baru didaftarkan di `resources/js/router/AppRouter.jsx`
- Styling menggunakan **Tailwind CSS v4**
- Icons menggunakan **Lucide React**

### Terminologi
- "Seller" di kode backend = **"Agen"** di UI/frontend
- `seller_profiles.foto_agen` = foto profil agen (bukan foto toko)
- `seller_profiles.nama_agen` = nama agen (bukan nama toko)

### Storage
- Media publik (gambar properti, foto profil) → disk `r2_public`
- Dokumen sensitif (KTP, selfie) → disk `r2_private`
- URL helper: `PublicStorageUrl::make($path)`

### Environment
- Dev server: `composer run dev` (Laravel + Queue + Vite)
- Database: MySQL `property`, root tanpa password
- Timezone: `Asia/Jakarta`
- Locale: `id` (Indonesia)
