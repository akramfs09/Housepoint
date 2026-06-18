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
import SellerStore from '../pages/Seller/Store';                   // ✅ profil toko seller
import PropertyList from '../pages/Seller/PropertyList';
import PaymentPage from '../pages/Seller/PaymentPage';
import StatsDashboard from '../pages/Seller/StatsDashboard';
import PropertyCatalog from '../pages/Public/PropertyCatalog';
import PropertyDetail from '../pages/Public/PropertyDetail';
import StorePage from '../pages/Public/StorePage';                 // ✅ halaman toko publik
import Favorites from '../pages/Public/Favorites';
import AdminDashboard from '../pages/Admin/Dashboard';
import SellerVerifications from '../pages/Admin/SellerVerifications';
import PropertyVerifications from '../pages/Admin/PropertyVerifications';
import Forbidden from '../pages/Errors/Forbidden';
import NotFound from '../pages/Errors/NotFound';
import ManageAdmins from '../pages/Admin/ManageAdmins';
import InviteAdmin from '../pages/Admin/InviteAdmin';
import EditAdmin from '../pages/Admin/EditAdmin';
import ManageUsers from '../pages/Admin/ManageUsers';   
import ActivityLogs from '../pages/Admin/ActivityLogs';
import ChatPage from '../pages/Chat/ChatPage';
import Notifications from '../pages/Notifications/Notifications';

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
        <Route path="/403" element={<Forbidden />} />

        {/* Katalog Publik */}
        <Route path="/properties" element={<PropertyCatalog />} />
        <Route path="/property/:slug" element={<PropertyDetail />} />

        {/* Halaman Toko Seller (Publik) */}
        <Route path="/store/:sellerId" element={<StorePage />} />

        {/* Favorit (Customer & Seller) */}
        <Route path="/favorites" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <Favorites />
            </ProtectedRoute>
        } />

        {/* Notifikasi (Semua Role Login) */}
        <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'super_admin']}>
                <Notifications />
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
                <DashboardLayout pageTitle="Upgrade ke Seller" pageDescription="Verifikasi akun untuk mulai menjual properti">
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
        <Route path="/seller/store" element={
            <ProtectedRoute allowedRoles={['seller']}>
                <DashboardLayout pageTitle="Profil Toko" pageDescription="Kelola informasi toko Anda">
                    <SellerStore />
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
        <Route path="/admin/activity-logs" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="📋 Log Aktivitas" pageDescription="Riwayat aktivitas admin">
                    <ActivityLogs />
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
        
        {/* ========================================== */}
        {/* Chat */}
        {/* ========================================== */}
        <Route path="/chat" element={<ProtectedRoute allowedRoles={['customer', 'seller']}><ChatPage /></ProtectedRoute>} />

        {/* ========================================== */}
        {/* 404 Not Found */}
        {/* ========================================== */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRouter;