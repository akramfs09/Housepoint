---
name: housepoint-context
description: Konteks lengkap repositori HousePoint — platform properti Laravel + React. Aktifkan skill ini saat mengerjakan fitur, debugging, atau menjawab pertanyaan teknis tentang proyek HousePoint.
---

# HousePoint — Repository Context

> Platform jual-beli properti berbasis Laravel (backend API) + React (frontend SPA).
> Proyek Akhir D3 Ilmu Komputer.

---

## 1. Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Backend Framework | Laravel | 13.x |
| PHP | PHP | 8.3+ |
| Frontend Framework | React | 19.x |
| Bundler | Vite | 8.x |
| CSS | Tailwind CSS | 4.x |
| Routing (FE) | React Router DOM | 7.x |
| Auth | Laravel Sanctum | 4.x (SPA cookie-based) |
| Real-time | Laravel Reverb + Pusher JS | WebSocket |
| Storage | Cloudflare R2 (S3-compatible) | Public + Private disk |
| Payment Gateway | Midtrans Snap | Sandbox mode |
| Charts | Recharts | 3.x |
| Icons | Lucide React | |
| Toast | React Hot Toast | |
| Queue | Database driver | |
| Hashing | Argon2id | |
| Mail | SMTP (dev: Mailpit port 1025) | |

### Dev Environment
- **Laragon** on Windows
- Database: MySQL (`property` database, root tanpa password)
- Dev command: `composer run dev` → menjalankan Laravel server + Queue listener + Vite concurrently
- Stateful domains: `localhost:8000` (Laravel), `localhost:5173` (Vite)

---

## 2. Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────┐
│                   React SPA (Vite)                   │
│  BrowserRouter → AuthProvider → AppRouter → Pages   │
│  services/api.js (axios) ↔ Laravel API              │
│  echo.js (Laravel Echo) ↔ Reverb WebSocket          │
└────────────────────────┬────────────────────────────┘
                         │ HTTP (REST API) + WebSocket
┌────────────────────────▼────────────────────────────┐
│               Laravel 13 Backend                     │
│  routes/api.php → Controllers → Services → Models   │
│  Middleware: auth:sanctum, banned, role, approved    │
│  Events/Notifications → Broadcasting (Reverb)       │
│  Jobs → Queue (database)                            │
│  Storage → Cloudflare R2 (public & private)         │
│  Payment → Midtrans Snap (webhook)                  │
└─────────────────────────────────────────────────────┘
```

### Pola Arsitektur Backend
- **Controller → Service pattern**: Business logic di `app/Services/`, controller hanya orchestration
- **Form Request validation**: `app/Http/Requests/` untuk validasi input
- **API Resource**: `app/Http/Resources/` untuk transformasi response JSON
- **Trait**: `ApiResponse` trait untuk standar format response
- **Policy**: Authorization via `app/Policies/`
- **Enum**: `app/Enums/` untuk status constants (PropertyStatus, SellerStatus, ReportStatus)
- **SoftDeletes**: Digunakan pada User dan Property

### Pola Arsitektur Frontend
- **SPA dengan React Router**: Semua route ditangkap oleh Laravel `/{any?}` → render `welcome` blade → React SPA
- **Context API**: `AuthContext` untuk state management autentikasi
- **Custom Hooks**: `useAuth`, `useWebsiteContent`
- **Centralized API**: `services/api.js` — satu file axios instance untuk semua API calls
- **Component Structure**: `components/` (reusable), `pages/` (route-level), `router/` (routing)
- **DashboardLayout**: Wrapper layout untuk halaman yang membutuhkan sidebar/header

---

## 3. Peran Pengguna (Roles)

| Role | Slug | Akses |
|------|------|-------|
| Customer | `customer` | Browse, favorit, chat, laporan, ulasan, riwayat pencarian, upgrade ke seller |
| Seller (Agen) | `seller` | Semua akses customer + dashboard, kelola properti, pembayaran, profil agen |
| Admin | `admin` | Verifikasi seller, moderasi properti, kelola user, laporan, payment history |
| Super Admin | `super_admin` | Semua akses admin + kelola admin lain, settings website, branding, review KTP |

> **Catatan**: Di UI, "Seller" ditampilkan sebagai **"Agen"**.

---

## 4. Database Schema (26 Models, 46 Migrations)

### Core Models
| Model | Tabel | Keterangan |
|-------|-------|-----------|
| `User` | users | SoftDeletes, Sanctum, Notifiable. Relasi: role, customerProfile, sellerProfile, adminProfile, favorites, conversations, searchHistories, reports, websiteReview |
| `Role` | roles | customer, seller, admin, super_admin |
| `Property` | properties | SoftDeletes. Relasi: sellerProfile, images, provinceRelation, cityRelation, favoritedByUsers, conversations, featuredListings |
| `PropertyImage` | property_images | Multi-image dengan ordering |
| `SellerProfile` | seller_profiles | KTP path, selfie path, foto_agen, nama_agen, deskripsi, status verifikasi |
| `CustomerProfile` | customer_profiles | foto_profil, telepon, alamat |
| `AdminProfile` | admin_profiles | foto_profil |

### Feature Models
| Model | Tabel | Keterangan |
|-------|-------|-----------|
| `Conversation` | conversations | Chat container (property_id based) |
| `Participant` | participants | User ↔ Conversation pivot, archived_at |
| `Message` | messages | Chat messages per conversation |
| `Transaction` | transactions | Payment records |
| `PaymentHistory` | payment_histories | Detailed payment tracking |
| `FeaturedListing` | featured_listings | Properti unggulan (paid → active → expired) |
| `Otp` | otps | OTP untuk verifikasi email |
| `SearchHistory` | search_histories | Riwayat pencarian user |
| `UserReport` | user_reports | Laporan pengguna ke admin |
| `UserReportMessage` | user_report_messages | Thread balasan pada laporan |
| `WebsiteReview` | website_reviews | Ulasan website oleh user |
| `WebsiteContent` | website_contents | CMS: hero, about, contact, footer, branding |
| `Province` | provinces | Master data provinsi |
| `City` | cities | Master data kota |
| `PropertyView` | property_views | Tracking view count |
| `AdminActionLog` | admin_action_logs | Audit trail admin |
| `SellerAppeal` | seller_appeals | Banding seller yang ditolak |
| `SellerRejectionLog` | seller_rejection_logs | Log penolakan seller |
| `UserBanLog` | user_ban_logs | Log ban/unban user |
| `FeaturedListing` | featured_listings | Status: pending, paid, active, expired, cancelled |

### Seeders
| Seeder | Fungsi |
|--------|--------|
| `RoleSeeder` | Seed 4 roles |
| `SuperAdminSeeder` | Buat akun super admin (password dari env) |
| `LocationSeeder` | Seed provinsi & kota Indonesia |
| `DummySellerSeeder` | Data dummy seller |
| `DummyPropertySeeder` | Data dummy properti |

---

## 5. API Routes (routes/api.php)

### Public (Tanpa Auth)
| Method | Endpoint | Controller | Keterangan |
|--------|----------|------------|-----------|
| GET | `/locations/provinces` | LocationController | Autocomplete provinsi |
| GET | `/locations/cities` | LocationController | Autocomplete kota |
| GET | `/website-content` | WebsiteContentController | CMS content |
| GET | `/midtrans/config` | MidtransConfigController | Client key Midtrans |
| GET | `/reviews` | ContactFeedbackController | Ulasan publik |
| GET | `/reviews/featured` | ContactFeedbackController | Ulasan unggulan |
| GET | `/agen/{seller}` | AgenController | Halaman profil agen |
| GET | `/properties/featured` | PublicPropertyController | Properti unggulan |
| GET | `/properties` | PublicPropertyController | Katalog properti |
| GET | `/properties/{slug}` | PublicPropertyController | Detail properti |
| POST | `/payment/notify` | PaymentController | Webhook Midtrans |

### Auth
| Method | Endpoint | Middleware |
|--------|----------|-----------|
| POST | `/auth/register` | throttle:register |
| POST | `/auth/verify-otp` | throttle:verify-otp |
| POST | `/auth/login` | throttle:login |
| POST | `/auth/logout` | auth:sanctum |
| POST | `/auth/forgot-password` | throttle |
| POST | `/auth/reset-password` | throttle |
| POST | `/auth/resend-otp` | throttle |
| PATCH | `/auth/password` | auth:sanctum |
| GET | `/auth/google/redirect` | Redirect login Google |
| GET | `/auth/google/callback` | Callback login Google |
| GET | `/user` | auth:sanctum (current user) |

### Customer & Seller (auth + role:customer,seller)
- Favorit: `POST /properties/{property}/favorite`, `GET /favorites`
- Search History: CRUD `/search-history`
- Chat: `/chat/start`, `/chat/conversations`, messages, read, archive
- Contact: `/contact/reports` (CRUD), `/contact/review` (upsert)
- Notifikasi: `/notifications` (index, mark read, unread count)
- Profil Customer: `GET/POST /customer/profile`
- Profil Seller: `GET/POST /seller/profile`, `/seller/agen`

### Seller (auth + role:seller + approved_seller)
- Dashboard: `GET /seller/dashboard`
- Properties: CRUD `/seller/properties`, submit moderasi, toggle status jual (`PATCH /seller/properties/{id}/toggle-status-jual`)
- Payment: `POST /seller/properties/{property}/pay`, publish
- Featured: initiate, publish, cancel featured payment
- Featured queue ETA: `GET /seller/featured-queue/eta`

### Admin & Super Admin (auth + role:admin,super_admin)
- Seller verifications: list, show, approve, reject
- Property moderation: list pending, approve, reject, all properties
- User management: list, ban, unban
- Seller appeals: list, approve, reject
- Reports & Reviews: admin CRUD
- Payment history: list, show
- Activity logs: `GET /admin/activity-logs`
- KTP reviews (super_admin only): confirm access, list

### Super Admin Only
- Admin management: CRUD `/admin/admins`, stats, audit logs
- Website content: `GET/POST /admin/website-content`

---

## 6. Backend Services (app/Services/)

| Service | Size | Tanggung Jawab |
|---------|------|---------------|
| `AuthService` | 7.4KB | Register, OTP, login, logout, forgot/reset password |
| `PropertyService` | 14.5KB | CRUD properti, upload image/video, moderasi, submit |
| `PaymentService` | 18.5KB | Midtrans Snap, webhook handler, payment history |
| `SellerService` | 10.1KB | Register seller, verifikasi KTP, appeal, dashboard stats |
| `AdminManagementService` | 6.4KB | CRUD admin, audit logs |
| `FeaturedListingService` | 1.6KB | Logika featured listing (queue, expiry) |
| `UserService` | 3.3KB | Ban/unban user |

---

## 7. Middleware

| Middleware | File | Fungsi |
|-----------|------|--------|
| `CheckRole` | CheckRole.php | Validasi role user (multi-role: `role:customer,seller`) |
| `CheckBanned` | CheckBanned.php | Blokir user yang di-ban |
| `ApprovedSeller` | ApprovedSeller.php | Hanya seller yang sudah approved |

---

## 8. Event & Notification System

### Events (Broadcasting via Reverb)
| Event | Channel | Keterangan |
|-------|---------|-----------|
| `MessageSent` | Private user channel | Chat message baru |
| `MessageRead` | Private user channel | Read receipt |
| `NewMessageNotification` | Private user channel | Notification bell |

### Notifications (8 Notification Classes)
- `ChatMessageNotification` — Pesan chat baru
- `SellerVerificationNotification` — Status verifikasi seller
- `PropertyModerationNotification` — Approve/reject properti
- `AppealNotification` — Status banding seller
- `PaymentSuccessNotification` — Pembayaran berhasil
- `NewSellerApplication` — Notif admin: seller baru
- `NewPropertySubmission` — Notif admin: properti baru disubmit
- `NewAppealNotification` — Notif admin: banding baru

### Frontend Real-time (App.jsx)
- Echo subscribe ke `user.{id}` private channel
- Notification listener dengan switch-case per type
- Custom event `new-notification` dispatched ke window untuk badge update

---

## 9. Storage Architecture

| Disk | Driver | Root | Kegunaan |
|------|--------|------|---------|
| `r2_public` | S3 (Cloudflare R2) | `properties/` | Gambar properti, foto profil, foto agen, branding |
| `r2_private` | S3 (Cloudflare R2) | `private/` | KTP, selfie (akses via signed URL) |
| `local` | Local | `storage/app/private` | File lokal |

- Proxy route: `GET /storage/public/{path}` → stream dari R2 public
- Support class: `PublicStorageUrl` untuk generate URL

---

## 10. Frontend Pages & Routes

### Public Pages
| Route | Component | Keterangan |
|-------|-----------|-----------|
| `/` | HomePage | Landing page |
| `/login` | LoginPage | Login form |
| `/register` | RegisterPage | Register + OTP flow |
| `/verify-otp` | VerifyOTPPage | Verifikasi OTP |
| `/forgot-password` | ForgotPasswordPage | Forgot password |
| `/reset-password` | ResetPasswordPage | Reset password |
| `/properties` | PropertyCatalog | Katalog properti + filter |
| `/property/:slug` | PropertyDetail | Detail properti (gambar, video, maps) |
| `/agen/:sellerId` | AgenPage | Halaman profil agen publik |
| `/about` | AboutPage | Halaman about |
| `/contact` | ContactPage | Laporan + ulasan |
| `/reviews` | ReviewsPage | Ulasan website |

### Customer Pages (role: customer)
| Route | Component |
|-------|-----------|
| `/customer/dashboard` | CustomerDashboard |
| `/customer/profile` | CustomerProfile |
| `/customer/become-seller` | BecomeSeller (upgrade ke agen) |

### Seller Pages (role: seller)
| Route | Component |
|-------|-----------|
| `/seller/dashboard` | SellerDashboard |
| `/seller/profile` | SellerProfile |
| `/seller/agen` | SellerAgen (profil agen) |
| `/seller/stats` | StatsDashboard |
| `/seller/properties` | PropertyList (CRUD properti) |
| `/seller/properties/:id/pay` | PaymentPage |

### Admin Pages (role: admin, super_admin)
| Route | Component |
|-------|-----------|
| `/admin/dashboard` | AdminDashboard |
| `/admin/seller-verifications` | SellerVerifications |
| `/admin/properties` | PropertyVerifications (moderasi) |
| `/admin/all-properties` | AllProperties |
| `/admin/users` | ManageUsers |
| `/admin/activity-logs` | ActivityLogs |
| `/admin/reports` | Reports |
| `/admin/payment-histories` | PaymentHistory |

### Super Admin Only
| Route | Component |
|-------|-----------|
| `/admin/admins` | ManageAdmins |
| `/admin/admins/invite` | InviteAdmin |
| `/admin/admins/:id/edit` | EditAdmin |
| `/admin/settings` | Settings (CMS website) |
| `/admin/ktp-reviews` | KtpReviews |

### Shared Pages (multi-role)
| Route | Roles | Component |
|-------|-------|-----------|
| `/favorites` | customer, seller | Favorites |
| `/history` | customer, seller | SearchHistory |
| `/notifications` | all logged-in | Notifications |
| `/chat` | customer, seller | ChatPage |

---

## 11. File Penting

### Backend
| File | Path | Keterangan |
|------|------|-----------|
| API Routes | `routes/api.php` | Semua endpoint REST API (252 baris) |
| Web Routes | `routes/web.php` | Proxy R2 + SPA catch-all |
| Enums | `app/Enums/` | PropertyStatus, SellerStatus, ReportStatus |
| Providers | `app/Providers/` | Service provider registration |
| Config Midtrans | `config/midtrans.php` | Payment gateway config |
| Config Filesystems | `config/filesystems.php` | R2 public & private disks |
| Config Reverb | `config/reverb.php` | WebSocket config |
| Broadcasting | `routes/channels.php` | Private channel authorization |

### Frontend
| File | Path | Keterangan |
|------|------|-----------|
| Entry Point | `resources/js/main.jsx` | ReactDOM render |
| App | `resources/js/App.jsx` | Router + Auth + Echo setup |
| Router | `resources/js/router/AppRouter.jsx` | Semua route definitions |
| API Client | `resources/js/services/api.js` | Axios instance + semua API functions |
| Auth Context | `resources/js/context/AuthContext.jsx` | Auth state management |
| Echo Setup | `resources/js/echo.js` | Laravel Echo + Reverb config |

---

## 12. Alur Bisnis Utama

### Alur Registrasi & Verifikasi
1. Customer register → OTP dikirim via email → Verifikasi OTP → Akun aktif

### Alur Upgrade ke Seller (Agen)
1. Customer upload KTP + selfie → Admin review → Approve/Reject
2. Jika ditolak → Customer bisa appeal → Admin review appeal

### Alur Properti
1. Seller buat properti (draft) → Submit moderasi → Admin approve/reject
2. Jika approved → Seller bayar (Midtrans Snap) → Properti published
3. Seller bisa request featured listing → Bayar → Properti tampil di unggulan

### Alur Pembayaran (Midtrans)
1. Seller initiate payment → Backend create Snap token → Frontend redirect ke Midtrans
2. Midtrans webhook → `POST /payment/notify` → Update status
3. Dua jenis pembayaran: listing (upload) dan featured (unggulan)

### Alur Chat
1. Customer/Seller start conversation (terkait properti)
2. Real-time messaging via Reverb WebSocket
3. Read receipts, archive/unarchive

---

## 13. Testing

- Framework: PHPUnit 12.x
- Lokasi: `tests/Feature/`, `tests/Unit/`
- Black box testing document: `BlackBoxTesting_HousePoint_Lengkap.docx`
- Run: `php artisan test`
