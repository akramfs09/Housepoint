import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import VerifyOTPPage from '../pages/Auth/VerifyOTPPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';
import BecomeSeller from '../pages/Customer/BecomeSeller';
import CustomerDashboard from '../pages/Customer/Dashboard';
import CustomerProfile from '../pages/Customer/Profile';            // ✅ profil customer
import SellerDashboard from '../pages/Seller/SellerDashboard';
import SellerProfile from '../pages/Seller/Profile';               // ✅ profil pribadi seller
import SellerAgen from '../pages/Seller/Agen';                   // ✅ profil agen seller
import PropertyList from '../pages/Seller/PropertyList';
import PaymentPage from '../pages/Seller/PaymentPage';
import StatsDashboard from '../pages/Seller/StatsDashboard';
import PropertyCatalog from '../pages/Public/PropertyCatalog';
import PropertyDetail from '../pages/Public/PropertyDetail';
import AgenPage from '../pages/Public/AgenPage';                 // ✅ halaman agen publik
import Favorites from '../pages/Public/Favorites';
import SearchHistory from '../pages/Public/SearchHistory';
import AboutPage from '../pages/Public/AboutPage';
import ContactPage from '../pages/Public/ContactPage';
import ReviewsPage from '../pages/Public/ReviewsPage';
import AdminDashboard from '../pages/Admin/Dashboard';
import SellerVerifications from '../pages/Admin/SellerVerifications';
import PropertyVerifications from '../pages/Admin/PropertyVerifications';
import Forbidden from '../pages/Errors/Forbidden';
import NotFound from '../pages/Errors/NotFound';
import ManageAdmins from '../pages/Admin/ManageAdmins';
import InviteAdmin from '../pages/Admin/InviteAdmin';
import EditAdmin from '../pages/Admin/EditAdmin';
import ManageUsers from '../pages/Admin/ManageUsers';   
import AllProperties from '../pages/Admin/AllProperties';
import ActivityLogs from '../pages/Admin/ActivityLogs';
import Settings from '../pages/Admin/Settings';
import Reports from '../pages/Admin/Reports';
import PaymentHistory from '../pages/Admin/PaymentHistory';
import KtpReviews from '../pages/Admin/KtpReviews';
import ChatPage from '../pages/Chat/ChatPage';
import Notifications from '../pages/Notifications/Notifications';
import SettingsPage from '../pages/Common/SettingsPage';
import GoogleCallback from '../pages/Auth/GoogleCallback';

const AppRouter = () => (
    <Routes>
        {/* ========================================== */}
        {/* Public */}
        {/* ========================================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />

        {/* Katalog Publik */}
        <Route path="/properties" element={<PropertyCatalog />} />
        <Route path="/property/:slug" element={<PropertyDetail />} />

        {/* Halaman Agen Seller (Publik) */}
        <Route path="/agen/:sellerId" element={<AgenPage />} />

        {/* Favorit (Customer & Seller) */}

        <Route path="/favorites" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <DashboardLayout pageTitle="Favorites" pageDescription="Favorites Anda">
                    <Favorites />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        <Route path="/history" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <DashboardLayout pageTitle="Riwayat Pencarian" pageDescription="Lihat kembali pencarian properti yang pernah Anda lakukan">
                    <SearchHistory />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* Notifikasi (Semua Role Login) */}
     
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'super_admin']}>
                <DashboardLayout pageTitle="Notifications" pageDescription="Notifications">
                    <Notifications />
                </DashboardLayout>
            </ProtectedRoute>
        } />


        {/* ========================================== */}
        {/* Customer */}
        {/* ========================================== */}
        <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
            </ProtectedRoute>
        } />
        <Route path="/customer/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout pageTitle="Profil Saya" pageDescription="Kelola informasi akun Anda">
                    <CustomerProfile />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/customer/become-seller" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <DashboardLayout pageTitle="Upgrade ke Agen" pageDescription="Verifikasi akun untuk mulai menjadi agen properti">
                    <BecomeSeller />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* ========================================== */}
        {/* Seller */}
        {/* ========================================== */}
        <Route path="/seller/dashboard" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
            </ProtectedRoute>
        } />
        <Route path="/seller/profile" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Profil Saya" pageDescription="Kelola informasi pribadi Anda">
                    <SellerProfile />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/seller/agen" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Profil Agen" pageDescription="Kelola informasi agen Anda">
                    <SellerAgen />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/seller/stats" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Statistik Properti" pageDescription="Pantau performa properti Anda">
                    <StatsDashboard />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/seller/properties" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Kelola Properti" pageDescription="Daftar dan upload properti Anda">
                    <PropertyList />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/seller/properties/:id/edit" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Edit Properti" pageDescription="Perbarui detail properti">
                    <PropertyList />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/seller/properties/:id/pay" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Pembayaran" pageDescription="Selesaikan pembayaran upload properti">
                    <PaymentPage />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* ========================================== */}
        {/* Admin & Super Admin */}
        {/* ========================================== */}
        <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
            </ProtectedRoute>
        } />
        <Route path="/admin/seller-verifications" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="✅ Verifikasi Seller" pageDescription="Approve atau tolak pengajuan seller">
                    <SellerVerifications />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/properties" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="🏠 Moderasi Properti" pageDescription="Setujui atau tolak properti yang diajukan">
                    <PropertyVerifications />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="👥 Kelola User" pageDescription="Kelola semua pengguna HousePoint">
                    <ManageUsers />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/all-properties" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="Data Properti" pageDescription="Kelola data properti yang terdaftar di HousePoint">
                    <AllProperties />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/activity-logs" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="📋 Log Aktivitas" pageDescription="Riwayat aktivitas admin">
                    <ActivityLogs />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="Kelola Laporan" pageDescription="Tinjau laporan pengguna dan ulasan website">
                    <Reports />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/payment-histories" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="Histori Pembayaran" pageDescription="Pantau transaksi listing dan unggulan">
                    <PaymentHistory />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* ========================================== */}
        {/* Super Admin Only */}
        {/* ========================================== */}
        <Route path="/admin/admins" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout pageTitle="👤 Kelola Admin Lain" pageDescription="Kelola semua admin HousePoint">
                    <ManageAdmins />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/admins/invite" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout pageTitle="Undang Admin Baru" pageDescription="Kirim undangan untuk admin baru">
                    <InviteAdmin />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/admins/:id/edit" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout pageTitle="Edit Admin" pageDescription="Perbarui informasi admin">
                    <EditAdmin />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout pageTitle="Pengaturan" pageDescription="Kelola konten website HousePoint">
                    <Settings />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/ktp-reviews" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout pageTitle="Review KTP Seller" pageDescription="Verifikasi tambahan sebelum membuka dokumen KTP">
                    <KtpReviews />
                </DashboardLayout>
            </ProtectedRoute>
        } />
        
        {/* ========================================== */}
        {/* Chat */}
        {/* ========================================== */}
        <Route path="/chat" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <DashboardLayout pageTitle="Pesan Saya" pageDescription="Komunikasi Anda dengan agen properti.">
                    <ChatPage />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* ========================================== */}
        {/* Settings */}
        {/* ========================================== */}
        <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <DashboardLayout pageTitle="Pengaturan Akun" pageDescription="Kelola preferensi dan keamanan akun Anda">
                    <SettingsPage />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* ========================================== */}
        {/* 404 Not Found */}
        {/* ========================================== */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRouter;