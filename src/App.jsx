import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/Overview';
import ManageAdmins from './pages/ManageAdmins';
import Banks from './pages/Banks';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import AIRiskEngine from './pages/AIRiskEngine';

const LoginRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <Login />;
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginRoute />} />
                    <Route path="/admin-register" element={<Register />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Overview />} />
                        <Route
                            path="admins"
                            element={
                                <ProtectedRoute requireSuperAdmin>
                                    <ManageAdmins />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route path="banks" element={<Banks />}/>
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="ai-risk-engine" element={<AIRiskEngine />} />
                        <Route path="customers" element={<Customers />}/>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;