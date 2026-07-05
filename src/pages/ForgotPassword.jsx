import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Try again.');
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

                {sent ? (
                    <>
                        <div className="auth-heading">
                            <h2>Check your inbox</h2>
                            <p>
                                If an account exists for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>,
                                a reset link has been sent. It expires in 5 minutes.
                            </p>
                        </div>
                        <div className="auth-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Reset link sent
                        </div>
                        <Link to="/login" className="auth-back-link">← Back to sign in</Link>
                    </>
                ) : (
                    <>
                        <div className="auth-heading">
                            <h2>Reset password</h2>
                            <p>Enter your account email and we'll send you a reset link.</p>
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

                            <Button type="submit" fullWidth loading={loading} className="auth-submit">
                                Send reset link
                            </Button>
                        </form>

                        <Link to="/login" className="auth-back-link">← Back to sign in</Link>
                    </>
                )}

                <div className="auth-footer">SIGNA · HASHED IDENTITY NETWORK</div>
            </div>
        </div>
    );
};

export default ForgotPassword;