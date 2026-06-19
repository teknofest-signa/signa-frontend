import { useEffect, useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { getBanks, createBank, deleteBank, uploadBankLogo } from '../api/banks';
import { cacheBankList } from '../api/bankCache';
import './Banks.css';

const Banks = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [createOpen, setCreateOpen] = useState(false);
    const [bankName, setBankName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fileInputRefs = useRef({});
    const [logoLoading, setLogoLoading] = useState({});
    const [logoMenuOpen, setLogoMenuOpen] = useState(null);
    const logoMenuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (logoMenuRef.current && !logoMenuRef.current.contains(e.target)) {
                setLogoMenuOpen(null);
            }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const handleLogoChange = async (bankId, e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setLogoMenuOpen(null);
        setLogoLoading((prev) => ({ ...prev, [bankId]: true }));
        try {
            await uploadBankLogo(bankId, file);
            fetchBanks();
        } catch (err) {
            setLoadError('Could not upload logo. Please try again.');
        } finally {
            setLogoLoading((prev) => ({ ...prev, [bankId]: false }));
        }
    };

    const handleLogoRemove = async (bankId) => {
        setLogoMenuOpen(null);
        setLogoLoading((prev) => ({ ...prev, [bankId]: true }));
        try {
            await uploadBankLogo(bankId, null);
            fetchBanks();
        } catch (err) {
            setLoadError('Could not remove logo. Please try again.');
        } finally {
            setLogoLoading((prev) => ({ ...prev, [bankId]: false }));
        }
    };

    const fetchBanks = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const { data } = await getBanks();
            const list = Array.isArray(data) ? data : data?.content || [];
            setBanks(list);
            cacheBankList(list);
        } catch (err) {
            setLoadError('Could not load banks. Please try again.');
            setBanks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const closeCreateModal = () => {
        setCreateOpen(false);
        setBankName('');
        setCreateError('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateError('');
        setCreateLoading(true);
        try {
            await createBank(bankName.trim());
            closeCreateModal();
            fetchBanks();
        } catch (err) {
            setCreateError(err?.response?.data?.message || 'Could not create this bank. Please try again.');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteBank(deleteTarget.id);
            setBanks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            setLoadError('Could not remove this bank. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="banks-page">
            <div className="page-header">
                <div>
                    <h2>Banks</h2>
                    <p>Member institutions connected to the SiGNA fraud-signal network.</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} icon={(
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}>
                    Add bank
                </Button>
            </div>

            {loading ? (
                <div className="banks-grid">
                    {[...Array(4)].map((_, i) => (
                        <Card className="bank-card bank-card-skeleton" key={i}>
                            <div className="skeleton skeleton-icon" />
                            <div className="bank-card-body">
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-id" />
                            </div>
                            <div className="bank-card-footer">
                                <div className="skeleton skeleton-date" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : loadError ? (
                <Card className="banks-empty-card">
                    <div className="banks-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>{loadError}</p>
                    </div>
                </Card>
            ) : banks.length === 0 ? (
                <Card className="banks-empty-card">
                    <div className="banks-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M3 10l9-6 9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 19h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>No banks yet. Add the first member institution to get started.</p>
                    </div>
                </Card>
            ) : (
                <div className="banks-grid">
                    {banks.map((bank) => (
                        <Card className="bank-card" key={bank.id}>
                            <div className="bank-card-header">
                                <div className="bank-card-icon">
                                    {bank.logo ? (
                                        <img src={`data:image/png;base64,${bank.logo}`} alt={`${bank.name} logo`} className="bank-logo-img" />
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 10l9-6 9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <div className="bank-card-body">
                                    <h4>{bank.name}</h4>
                                    <span className="bank-id mono">{bank.id}</span>
                                </div>

                                <div className="bank-logo-menu" ref={bank.id === logoMenuOpen ? logoMenuRef : null}>
                                    <button
                                        className="row-action"
                                        onClick={() => setLogoMenuOpen((prev) => (prev === bank.id ? null : bank.id))}
                                        aria-label="Logo options"
                                        disabled={logoLoading[bank.id]}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>

                                    {logoMenuOpen === bank.id && (
                                        <div className="bank-logo-dropdown">
                                            <button onClick={() => fileInputRefs.current[bank.id]?.click()} disabled={logoLoading[bank.id]}>
                                                {logoLoading[bank.id] ? 'Working…' : bank.logo ? 'Change logo' : 'Add logo'}
                                            </button>
                                            {bank.logo && (
                                                <button onClick={() => handleLogoRemove(bank.id)} disabled={logoLoading[bank.id]}>
                                                    Remove logo
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <input
                                        ref={(el) => (fileInputRefs.current[bank.id] = el)}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleLogoChange(bank.id, e)}
                                    />
                                </div>
                            </div>

                            <div className="bank-card-footer">
                                <span className="bank-date mono">
                                    {bank.createdAt ? new Date(bank.createdAt).toLocaleDateString() : '—'}
                                </span>
                                <button className="row-action row-action-danger" onClick={() => setDeleteTarget(bank)} aria-label="Remove bank">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={createOpen} onClose={closeCreateModal} title="Add a new bank">
                <form className="invite-form" onSubmit={handleCreate}>
                    <p className="invite-desc">
                        Register a new member bank in the SiGNA network.
                    </p>

                    {createError && <div className="invite-message invite-message-error">{createError}</div>}

                    <Input
                        label="Bank name"
                        type="text"
                        name="bank-name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Kapital Bank"
                        required
                    />

                    <div className="invite-actions">
                        <Button type="button" variant="ghost" onClick={closeCreateModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={createLoading}>
                            Add bank
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove bank">
                <div className="delete-confirm">
                    <p>
                        Remove <strong>{deleteTarget?.name}</strong> from the network? This cannot be undone.
                    </p>
                    <div className="invite-actions">
                        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>
                            Remove bank
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Banks;