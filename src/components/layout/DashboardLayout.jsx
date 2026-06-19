import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const titles = {
    '/': 'Overview',
    '/admins': 'Manage admins',
    '/banks': 'Banks',
    '/customers': 'Customers',
    '/transactions': 'Transactions',
    '/ai-risk-engine': 'AI risk engine',
};

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const title = titles[location.pathname] || 'Overview';

    return (
        <div className="dashboard-shell">
            <Sidebar user={user} />
            <div className="dashboard-main">
                <Topbar user={user} title={title} onLogout={handleLogout} />
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;