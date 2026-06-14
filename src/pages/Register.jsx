import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Register = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('This invite link is missing its token. Ask your super admin for a new link.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await register(token, username, password);
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || 'This invite link is invalid or has expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-mark">
                        <span className="auth-brand-ring" />
                        <span className="auth-brand-dot" />
                    </div>
                    <div className="auth-brand-text">
                        <span className="auth-brand-name">SiGNA</span>
                        <span className="auth-brand-tag">console</span>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Welcome to SiGNA</h2>
                    <p>You've been invited as an admin. Set up your account to continue.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <Input
                        label="Username"
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        autoComplete="username"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        required
                    />

                    <Input
                        label="Confirm password"
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        required
                    />

                    <Button type="submit" fullWidth loading={loading} className="auth-submit">
                        Activate account
                    </Button>
                </form>

                <div className="auth-footer">SIGNA · HASHED IDENTITY NETWORK</div>
            </div>
        </div>
    );
};

export default Register;