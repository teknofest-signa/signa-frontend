import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
    {
        section: 'Overview',
        items: [{ to: '/', label: 'Dashboard', icon: 'grid' }],
    },
    {
        section: 'Network',
        items: [
            { to: '/banks', label: 'Banks', icon: 'bank' },
            { to: '/transactions', label: 'Transactions', icon: 'pulse' },
        ],
    },
    {
        section: 'Access control',
        items: [{ to: '/admins', label: 'Manage admins', icon: 'users', requireSuperAdmin: true }],
    },
    {
        section: 'Coming soon',
        items: [
            { to: '#', label: 'AI risk engine', icon: 'shield', disabled: true },
            { to: '#', label: 'Blocked users', icon: 'lock', disabled: true },
        ],
    },
];

const icons = {
    grid: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    ),
    users: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M15.5 13.2c2.6.3 4.5 2.5 4.5 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    ),
    bank: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 10l9-6 9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    pulse: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    shield: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    lock: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    ),
};

const Sidebar = ({ user }) => {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-mark">
                    <span className="brand-ring" />
                    <span className="brand-dot" />
                </div>
                <div className="brand-text">
                    <span className="brand-name">SiGNA</span>
                    <span className="brand-tag">console</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((group) => {
                    const visibleItems = group.items.filter((item) => !item.requireSuperAdmin || isSuperAdmin);
                    if (visibleItems.length === 0) return null;

                    return (
                        <div className="nav-group" key={group.section}>
                            <span className="nav-group-label">{group.section}</span>
                            {visibleItems.map((item) =>
                                    item.disabled ? (
                                        <span className="nav-item nav-item-disabled" key={item.label}>
                    <span className="nav-icon">{icons[item.icon]}</span>
                                            {item.label}
                                            <span className="nav-soon">soon</span>
                  </span>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            key={item.label}
                                            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                                            end
                                        >
                                            <span className="nav-icon">{icons[item.icon]}</span>
                                            {item.label}
                                        </NavLink>
                                    )
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="status-pill">
                    <span className="status-dot" />
                    API hashes only · no raw PII
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;