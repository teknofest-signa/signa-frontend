import { useState, useRef, useEffect } from 'react';
import './Topbar.css';

const Topbar = ({ user, title, onLogout }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const initial = user?.username?.[0]?.toUpperCase() || '?';

    return (
        <header className="topbar">
            <div className="topbar-title">
                <h1>{title}</h1>
            </div>

            <div className="topbar-actions" ref={ref}>
                <button className="user-chip" onClick={() => setOpen((v) => !v)}>
                    <span className="user-avatar">{initial}</span>
                    <span className="user-meta">
            <span className="user-name">{user?.username || '—'}</span>
            <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`chevron ${open ? 'chevron-open' : ''}`}>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {open && (
                    <div className="user-dropdown">
                        <div className="user-dropdown-info">
                            <span className="user-dropdown-email">{user?.email}</span>
                            <span className="user-dropdown-id mono">{user?.id}</span>
                        </div>
                        <button className="user-dropdown-item" onClick={onLogout}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M16 17l5-5-5-5M21 12H9M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Topbar;