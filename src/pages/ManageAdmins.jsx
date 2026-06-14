import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { createAdmin, getAdmins, deleteAdmin } from '../api/superAdmin';
import './ManageAdmins.css';

const statusVariant = {
    ACTIVE: 'success',
    PENDING: 'warning',
    INACTIVE: 'danger',
};

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchAdmins = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const { data } = await getAdmins();
            setAdmins(Array.isArray(data) ? data : data?.content || []);
        } catch (err) {
            setLoadError('Could not load admins. The admin list endpoint may not be available yet.');
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteError('');
        setInviteSuccess('');
        setInviteLoading(true);
        try {
            await createAdmin(inviteEmail);
            setInviteSuccess(`Invite sent to ${inviteEmail}.`);
            setInviteEmail('');
            fetchAdmins();
        } catch (err) {
            setInviteError(err?.response?.data?.message || 'Could not send the invite. Please try again.');
        } finally {
            setInviteLoading(false);
        }
    };

    const closeInviteModal = () => {
        setInviteOpen(false);
        setInviteError('');
        setInviteSuccess('');
        setInviteEmail('');
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteAdmin(deleteTarget.id);
            setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            setLoadError('Could not remove this admin. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="manage-admins">
            <div className="page-header">
                <div>
                    <h2>Admins</h2>
                    <p>Invite, review, and remove admin accounts for the SiGNA console.</p>
                </div>
                <Button onClick={() => setInviteOpen(true)} icon={(
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}>
                    Invite admin
                </Button>
            </div>

            <Card className="admins-card">
                {loading ? (
                    <div className="admins-empty">
                        <span className="loading-spinner" />
                        <p>Loading admins…</p>
                    </div>
                ) : loadError ? (
                    <div className="admins-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>{loadError}</p>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="admins-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>No admins yet. Invite one to get started.</p>
                    </div>
                ) : (
                    <table className="admins-table">
                        <thead>
                        <tr>
                            <th>Admin</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th aria-label="actions"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id}>
                                <td>
                                    <div className="admin-identity">
                                        <span className="admin-avatar">{(admin.username || admin.email || '?')[0].toUpperCase()}</span>
                                        <div className="admin-identity-text">
                                            <span className="admin-username">{admin.username || '— pending —'}</span>
                                            <span className="admin-id mono">{admin.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{admin.email}</td>
                                <td>
                                    <Badge variant={admin.role === 'SUPER_ADMIN' ? 'accent' : 'default'}>
                                        {admin.role?.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge variant={statusVariant[admin.status] || 'default'}>{admin.status}</Badge>
                                </td>
                                <td className="mono admin-date">
                                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                                </td>
                                <td>
                                    {admin.role !== 'SUPER_ADMIN' && (
                                        <button className="row-action" onClick={() => setDeleteTarget(admin)} aria-label="Remove admin">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <Modal open={inviteOpen} onClose={closeInviteModal} title="Invite a new admin">
                <form className="invite-form" onSubmit={handleInvite}>
                    <p className="invite-desc">
                        We'll send a registration link to this email. They'll choose a username and password to activate the account.
                    </p>

                    {inviteError && <div className="invite-message invite-message-error">{inviteError}</div>}
                    {inviteSuccess && <div className="invite-message invite-message-success">{inviteSuccess}</div>}

                    <Input
                        label="Email address"
                        type="email"
                        name="invite-email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="admin@bank.com"
                        required
                    />

                    <div className="invite-actions">
                        <Button type="button" variant="ghost" onClick={closeInviteModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={inviteLoading}>
                            Send invite
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove admin">
                <div className="delete-confirm">
                    <p>
                        Remove <strong>{deleteTarget?.username || deleteTarget?.email}</strong> from the console? They'll lose
                        access immediately.
                    </p>
                    <div className="invite-actions">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
                            Remove admin
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageAdmins;