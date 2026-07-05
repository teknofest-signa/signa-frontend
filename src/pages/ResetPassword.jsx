import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    if (!token) {
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
                        <h2>Invalid link</h2>
                        <p>This reset link is missing its token. Request a new one below.</p>
                    </div>
                    <Link to="/forgot-password" className="auth-back-link">Request a new reset link</Link>
                    <div className="auth-footer">SIGNA · HASHED IDENTITY NETWORK</div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err?.response?.data?.message || 'This link is invalid or has expired.');
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

                {done ? (
                    <>
                        <div className="auth-heading">
                            <h2>Password updated</h2>
                            <p>Your password has been changed. Redirecting you to sign in…</p>
                        </div>
                        <div className="auth-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Password reset successful
                        </div>
                    </>
                ) : (
                    <>
                        <div className="auth-heading">
                            <h2>New password</h2>
                            <p>Choose a new password for your SiGNA account.</p>
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
                                label="New password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a new password"
                                autoComplete="new-password"
                                required
                            />

                            <Input
                                label="Confirm new password"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                            />

                            <Button type="submit" fullWidth loading={loading} className="auth-submit">
                                Update password
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

export default ResetPassword;