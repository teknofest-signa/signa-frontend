import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import './Overview.css';

const statusVariant = {
    ACTIVE: 'success',
    PENDING: 'warning',
    INACTIVE: 'danger',
};

const comingSoonModules = [
    { name: 'Banks', desc: 'Connected institutions and their network status.', icon: 'bank', to: '/banks' },
    { name: 'Transactions', desc: 'Live stream of transactions analyzed by the engine.', icon: 'pulse', to: '/transactions' },
    { name: 'AI risk engine', desc: 'Fraud scoring, model performance, and alerts.', icon: 'shield', to: '/ai-risk-engine' },
    { name: 'Customers', desc: 'Cross-bank hashed user blocklist and history.', icon: 'lock', to: '/customers'},
];

const moduleIcons = {
    bank: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 10l9-6 9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    pulse: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    shield: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    lock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    ),
};

const Overview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="overview">
            <Card className="welcome-card">
                <div className="welcome-content">
                    <span className="welcome-eyebrow mono">SESSION ESTABLISHED</span>
                    <h2>Welcome back, {user?.username || 'admin'}.</h2>
                    <div className="welcome-meta">
                        <div className="welcome-meta-item">
                            <span className="meta-label">Account status</span>
                            <Badge variant={statusVariant[user?.status] || 'default'}>{user?.status || 'UNKNOWN'}</Badge>
                        </div>
                        <div className="welcome-meta-item">
                            <span className="meta-label">User ID</span>
                            <span className="mono meta-value">{user?.id || '—'}</span>
                        </div>
                        <div className="welcome-meta-item">
                            <span className="meta-label">Email</span>
                            <span className="meta-value">{user?.email || '—'}</span>
                        </div>
                    </div>
                </div>
                <div className="welcome-visual" aria-hidden="true">
                    <svg viewBox="0 0 200 200" width="180" height="180">
                        <circle cx="100" cy="100" r="30" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
                        <circle cx="100" cy="100" r="55" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.15" />
                        <circle cx="100" cy="100" r="6" fill="var(--accent)" />
                        <circle cx="160" cy="70" r="3" fill="var(--accent)" opacity="0.7" />
                        <circle cx="40" cy="140" r="3" fill="var(--accent)" opacity="0.7" />
                        <circle cx="150" cy="150" r="3" fill="var(--accent)" opacity="0.5" />
                        <line x1="100" y1="100" x2="160" y2="70" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
                        <line x1="100" y1="100" x2="40" y2="140" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
                        <line x1="100" y1="100" x2="150" y2="150" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
                    </svg>
                </div>
            </Card>

            <div className="section-heading">
                <h3>Network modules</h3>
                <p>The shared fraud-signal infrastructure that connects member banks.</p>
            </div>

            <div className="modules-grid">
                {comingSoonModules.map((mod) => (
                    <Card
                        className={`module-card${mod.to ? ' module-card-link' : ''}`}
                        key={mod.name}
                        onClick={mod.to ? () => navigate(mod.to) : undefined}
                        role={mod.to ? 'button' : undefined}
                        tabIndex={mod.to ? 0 : undefined}
                        onKeyDown={mod.to ? (e) => e.key === 'Enter' && navigate(mod.to) : undefined}
                    >
                        <div className="module-icon">{moduleIcons[mod.icon]}</div>
                        <div className="module-text">
                            <h4>{mod.name}</h4>
                            <p>{mod.desc}</p>
                        </div>
                        {mod.to ? (
                            <span className="module-badge module-badge-active mono">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                open
                            </span>
                        ) : (
                            <span className="module-badge mono">coming soon</span>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Overview;