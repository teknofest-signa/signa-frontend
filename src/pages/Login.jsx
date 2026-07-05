import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid email or password.');
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
                    <h2>Sign in</h2>
                    <p>Access the SiGNA admin console.</p>
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
                        label="Email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@signa.com"
                        autoComplete="email"
                        required
                    />

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                        <Link to="/forgot-password" className="auth-forgot-link">
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" fullWidth loading={loading} className="auth-submit">
                        Sign In
                    </Button>
                </form>

                <div className="auth-footer">SIGNA · HASHED IDENTITY NETWORK</div>
            </div>
        </div>
    );
};

export default Login;