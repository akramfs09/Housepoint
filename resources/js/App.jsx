import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './router/AppRouter';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ErrorBoundary>
                    <AppRouter />
                </ErrorBoundary>
            </AuthProvider>
        </Router>
    );
}

export default App;