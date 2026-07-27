import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/worker-dashboard"
                        element={
                            <ProtectedRoute role="worker">
                                <WorkerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/manager-dashboard"
                        element={<ManagerDashboard />}
                    />
                    <Route path="/" element={<Navigate to="/manager-dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
