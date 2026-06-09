import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './router/AppRouter';
import { useAuth } from './hooks/useAuth';      // ✅ perbaiki di sini
import echo from './echo';
import { toast } from 'react-hot-toast';

// Komponen dalam yang bisa mengakses AuthContext
function AppInner() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const channel = echo.private(`user.${user.id}`);

        channel.listen('.new.message', (data) => {
            toast.success(`📬 ${data.sender_name}: ${data.body}`);
        });

        return () => {
            echo.leaveChannel(`user.${user.id}`);
        };
    }, [user]);

    return (
        <ErrorBoundary>
            <AppRouter />
        </ErrorBoundary>
    );
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppInner />
            </AuthProvider>
        </Router>
    );
}