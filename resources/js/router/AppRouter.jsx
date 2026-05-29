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
import SellerDashboard from '../pages/Seller/SellerDashboard';
import PropertyList from '../pages/Seller/PropertyList';
import AdminDashboard from '../pages/Admin/Dashboard';
import SellerVerifications from '../pages/Admin/SellerVerifications';
import Forbidden from '../pages/Errors/Forbidden';
import NotFound from '../pages/Errors/NotFound';
import ManageAdmins from '../pages/Admin/ManageAdmins';
import InviteAdmin from '../pages/Admin/InviteAdmin';
import EditAdmin from '../pages/Admin/EditAdmin';
import ManageUsers from '../pages/Admin/ManageUsers';   
import ActivityLogs from '../pages/Admin/ActivityLogs'

const AppRouter = () => (
    <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Customer & Seller (halaman BecomeSeller juga bisa diakses seller) */}
        <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/become-seller" element={
            <ProtectedRoute allowedRoles={['customer', 'seller']}>
                <DashboardLayout pageTitle="Upgrade ke Seller" pageDescription="Verifikasi akun untuk mulai menjual properti">
                    <BecomeSeller />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* Seller */}
        <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/properties" element={<ProtectedRoute allowedRoles={['seller']}><DashboardLayout pageTitle="Properti Saya" pageDescription="Daftar properti yang Anda kelola"><PropertyList /></DashboardLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/seller-verifications" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><DashboardLayout pageTitle="✅ Verifikasi Seller" pageDescription="Approve atau tolak pengajuan seller"><SellerVerifications /></DashboardLayout></ProtectedRoute>} />

        {/* 🆕 Kelola User (Admin & Super Admin) */}
        <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="👥 Kelola User" pageDescription="Kelola semua pengguna HousePoint">
                    <ManageUsers />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* Super Admin */}
        <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={['super_admin']}><DashboardLayout pageTitle="👤 Kelola Admin Lain" pageDescription="Kelola semua admin HousePoint"><ManageAdmins /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/admins/invite" element={<ProtectedRoute allowedRoles={['super_admin']}><DashboardLayout pageTitle="Undang Admin Baru" pageDescription="Kirim undangan untuk admin baru"><InviteAdmin /></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/admins/:id/edit" element={<ProtectedRoute allowedRoles={['super_admin']}><DashboardLayout pageTitle="Edit Admin" pageDescription="Perbarui informasi admin"><EditAdmin /></DashboardLayout></ProtectedRoute>} />

        {/*Log Aktivitas -*/}
        <Route path="/admin/activity-logs" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <DashboardLayout pageTitle="📋 Log Aktivitas" pageDescription="Riwayat aktivitas admin">
                    <ActivityLogs />
                </DashboardLayout>
            </ProtectedRoute>
        } />

        {/* 404 Not Found — harus paling bawah */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRouter;