import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireSuperAdmin && user?.role !== 'SUPER_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;