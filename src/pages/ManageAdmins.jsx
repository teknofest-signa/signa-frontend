import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Avatar from '../components/ui/Avatar';
import { createAdmin, getAdmins, getAdmin, updateAdmin, deleteAdmin } from '../api/superAdmin';
import './ManageAdmins.css';

const statusVariant = {
    ACTIVE: 'success',
    PENDING: 'warning',
    INACTIVE: 'danger',
};

const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    const [editTarget, setEditTarget] = useState(null);
    const [editEmail, setEditEmail] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editStatus, setEditStatus] = useState('ACTIVE');
    const [editPassword, setEditPassword] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [detailTarget, setDetailTarget] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

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

    const openEditModal = (admin) => {
        setEditTarget(admin);
        setEditEmail(admin.email || '');
        setEditUsername(admin.username || '');
        setEditStatus(admin.status || 'ACTIVE');
        setEditPassword('');
        setEditError('');
    };

    const closeEditModal = () => {
        setEditTarget(null);
        setEditError('');
        setEditPassword('');
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editTarget) return;
        setEditError('');
        setEditLoading(true);
        try {
            const payload = {
                email: editEmail,
                username: editUsername,
                status: editStatus,
            };
            if (editPassword.trim()) {
                payload.password = editPassword;
            }
            await updateAdmin(editTarget.id, payload);
            closeEditModal();
            fetchAdmins();
        } catch (err) {
            setEditError(err?.response?.data?.message || 'Could not update this admin. Please try again.');
        } finally {
            setEditLoading(false);
        }
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

    const openDetailModal = async (admin) => {
        setDetailTarget(admin);
        setDetailData(null);
        setDetailError('');
        setDetailLoading(true);
        try {
            const { data } = await getAdmin(admin.id);
            setDetailData(data);
        } catch (err) {
            setDetailError('Could not load admin details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        setDetailTarget(null);
        setDetailData(null);
        setDetailError('');
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
                                        <Avatar photo={admin.profilePhoto} name={admin.username || admin.email} size="md" />
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
                                    <div className="row-actions">
                                        <button className="row-action" onClick={() => openDetailModal(admin)} aria-label="View admin info">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                                                <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        {admin.role !== 'SUPER_ADMIN' && (
                                            <>
                                                <button className="row-action" onClick={() => openEditModal(admin)} aria-label="Edit admin">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button className="row-action row-action-danger" onClick={() => setDeleteTarget(admin)} aria-label="Remove admin">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
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

            <Modal open={!!editTarget} onClose={closeEditModal} title="Edit admin">
                <form className="invite-form" onSubmit={handleEdit}>
                    <p className="invite-desc">
                        Update <strong>{editTarget?.username || editTarget?.email}</strong>'s account details and access status.
                    </p>

                    {editError && <div className="invite-message invite-message-error">{editError}</div>}

                    <Input
                        label="Email address"
                        type="email"
                        name="edit-email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="admin@bank.com"
                        required
                    />

                    <Input
                        label="Username"
                        type="text"
                        name="edit-username"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />

                    <Select
                        label="Status"
                        name="edit-status"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        options={statusOptions}
                        required
                    />

                    <Input
                        label="New password (optional)"
                        type="password"
                        name="edit-password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        autoComplete="new-password"
                    />

                    <div className="invite-actions">
                        <Button type="button" variant="ghost" onClick={closeEditModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={editLoading}>
                            Save changes
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

            <Modal open={!!detailTarget} onClose={closeDetailModal} title="Admin details">
                {detailLoading ? (
                    <div className="admins-empty">
                        <span className="loading-spinner" />
                        <p>Loading details…</p>
                    </div>
                ) : detailError ? (
                    <div className="admins-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>{detailError}</p>
                    </div>
                ) : detailData ? (
                    <div className="admin-detail">
                        <div className="admin-detail-header">
                            <Avatar photo={detailData.profilePhoto} name={detailData.username || detailData.email} size="xl" />
                            <div className="admin-detail-heading">
                                <h3>{detailData.username || '— pending —'}</h3>
                                <span className="admin-detail-email">{detailData.email}</span>
                                <div className="admin-detail-badges">
                                    <Badge variant={detailData.role === 'SUPER_ADMIN' ? 'accent' : 'default'}>
                                        {detailData.role?.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant={statusVariant[detailData.status] || 'default'}>{detailData.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="admin-detail-grid">
                            <div className="admin-detail-item">
                                <span className="meta-label">Admin ID</span>
                                <span className="mono admin-detail-value">{detailData.id}</span>
                            </div>
                            <div className="admin-detail-item">
                                <span className="meta-label">Created</span>
                                <span className="admin-detail-value">
                  {detailData.createdAt ? new Date(detailData.createdAt).toLocaleString() : '—'}
                </span>
                            </div>
                            <div className="admin-detail-item">
                                <span className="meta-label">Last updated</span>
                                <span className="admin-detail-value">
                  {detailData.updatedAt ? new Date(detailData.updatedAt).toLocaleString() : '—'}
                </span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default ManageAdmins;