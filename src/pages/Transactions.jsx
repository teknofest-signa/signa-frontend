import { useEffect, useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { getAllTransactions } from '../api/transactions';
import './Transactions.css';

const statusVariant = {
    SUCCESS: 'success',
    COMPLETED: 'success',
    APPROVED: 'success',
    PENDING: 'warning',
    PROCESSING: 'warning',
    REVIEW: 'warning',
    FAILED: 'danger',
    REJECTED: 'danger',
    BLOCKED: 'danger',
    CANCELLED: 'default',
};

const typeOptions = [{ value: '', label: 'All types' }];
const statusOptions = [{ value: '', label: 'All statuses' }];
const currencyOptions = [{ value: '', label: 'All currencies' }];

const formatAmount = (amount, currency) => {
    if (amount === null || amount === undefined) return '—';
    const num = Number(amount);
    if (Number.isNaN(num)) return `${amount} ${currency || ''}`.trim();
    return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ''}`.trim();
};

const formatFraudScore = (score) => {
    if (score === null || score === undefined) return '—';
    const num = Number(score);
    if (Number.isNaN(num)) return String(score);
    return num.toFixed(2);
};

const fraudVariant = (score) => {
    if (score === null || score === undefined) return 'default';
    const num = Number(score);
    if (Number.isNaN(num)) return 'default';
    if (num >= 0.75) return 'danger';
    if (num >= 0.4) return 'warning';
    return 'success';
};

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('');

    const [detailTarget, setDetailTarget] = useState(null);

    const fetchTransactions = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const { data } = await getAllTransactions();
            setTransactions(Array.isArray(data) ? data : data?.content || []);
        } catch (err) {
            setLoadError('Could not load transactions. Please try again.');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const typeChoices = useMemo(() => {
        const values = new Set(transactions.map((t) => t.transactionType).filter(Boolean));
        return [...typeOptions, ...[...values].sort().map((v) => ({ value: v, label: v.replace(/_/g, ' ') }))];
    }, [transactions]);

    const statusChoices = useMemo(() => {
        const values = new Set(transactions.map((t) => t.transactionStatus).filter(Boolean));
        return [...statusOptions, ...[...values].sort().map((v) => ({ value: v, label: v.replace(/_/g, ' ') }))];
    }, [transactions]);

    const currencyChoices = useMemo(() => {
        const values = new Set(transactions.map((t) => t.currency).filter(Boolean));
        return [...currencyOptions, ...[...values].sort().map((v) => ({ value: v, label: v }))];
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();
        return transactions.filter((tx) => {
            if (typeFilter && tx.transactionType !== typeFilter) return false;
            if (statusFilter && tx.transactionStatus !== statusFilter) return false;
            if (currencyFilter && tx.currency !== currencyFilter) return false;

            if (!query) return true;
            const haystack = [tx.id, tx.senderId, tx.receiverId, tx.referenceId, tx.description]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase());
            return haystack.some((v) => v.includes(query));
        });
    }, [transactions, search, typeFilter, statusFilter, currencyFilter]);

    const hasActiveFilters = search || typeFilter || statusFilter || currencyFilter;

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        setCurrencyFilter('');
    };

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h2>Transactions</h2>
                    <p>All transactions flowing through the SiGNA network, with fraud signal context.</p>
                </div>
            </div>

            <Card className="transactions-toolbar">
                <div className="transactions-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by transaction ID, sender, receiver, reference, or description"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="transactions-filters">
                    <Select
                        name="type-filter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        options={typeChoices}
                    />
                    <Select
                        name="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={statusChoices}
                    />
                    <Select
                        name="currency-filter"
                        value={currencyFilter}
                        onChange={(e) => setCurrencyFilter(e.target.value)}
                        options={currencyChoices}
                    />
                    {hasActiveFilters && (
                        <button className="filters-clear" onClick={clearFilters}>
                            Clear
                        </button>
                    )}
                </div>
            </Card>

            <Card className="transactions-card">
                {loading ? (
                    <div className="transactions-empty">
                        <span className="loading-spinner" />
                        <p>Loading transactions…</p>
                    </div>
                ) : loadError ? (
                    <div className="transactions-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>{loadError}</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="transactions-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p>{transactions.length === 0 ? 'No transactions yet.' : 'No transactions match your search and filters.'}</p>
                    </div>
                ) : (
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Type</th>
                            <th>Sender → Receiver</th>
                            <th>Amount</th>
                            <th>Fraud score</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th aria-label="actions"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>
                                    <div className="tx-identity">
                                        <span className="tx-id mono">{tx.id}</span>
                                        {tx.referenceId && <span className="tx-reference mono">{tx.referenceId}</span>}
                                    </div>
                                </td>
                                <td>
                                    <Badge variant="default">{tx.transactionType?.replace(/_/g, ' ') || '—'}</Badge>
                                </td>
                                <td>
                                    <div className="tx-parties">
                                        <span className="mono">{tx.senderId || '—'}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="tx-arrow">
                                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="mono">{tx.receiverId || '—'}</span>
                                    </div>
                                </td>
                                <td className="tx-amount mono">{formatAmount(tx.amount, tx.currency)}</td>
                                <td>
                                    <Badge variant={fraudVariant(tx.fraudScore)}>{formatFraudScore(tx.fraudScore)}</Badge>
                                </td>
                                <td>
                                    <Badge variant={statusVariant[tx.transactionStatus] || 'default'}>
                                        {tx.transactionStatus?.replace(/_/g, ' ') || '—'}
                                    </Badge>
                                </td>
                                <td className="mono tx-date">
                                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button className="row-action" onClick={() => setDetailTarget(tx)} aria-label="View transaction info">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                                                <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title="Transaction details">
                {detailTarget && (
                    <div className="tx-detail">
                        <div className="tx-detail-header">
                            <Badge variant="default">{detailTarget.transactionType?.replace(/_/g, ' ') || '—'}</Badge>
                            <Badge variant={statusVariant[detailTarget.transactionStatus] || 'default'}>
                                {detailTarget.transactionStatus?.replace(/_/g, ' ') || '—'}
                            </Badge>
                            <Badge variant={fraudVariant(detailTarget.fraudScore)}>
                                Fraud score: {formatFraudScore(detailTarget.fraudScore)}
                            </Badge>
                        </div>

                        <div className="tx-detail-grid">
                            <div className="tx-detail-item">
                                <span className="meta-label">Transaction ID</span>
                                <span className="mono tx-detail-value">{detailTarget.id}</span>
                            </div>
                            <div className="tx-detail-item">
                                <span className="meta-label">Reference ID</span>
                                <span className="mono tx-detail-value">{detailTarget.referenceId || '—'}</span>
                            </div>
                            <div className="tx-detail-item">
                                <span className="meta-label">Sender ID</span>
                                <span className="mono tx-detail-value">{detailTarget.senderId || '—'}</span>
                            </div>
                            <div className="tx-detail-item">
                                <span className="meta-label">Receiver ID</span>
                                <span className="mono tx-detail-value">{detailTarget.receiverId || '—'}</span>
                            </div>
                            <div className="tx-detail-item">
                                <span className="meta-label">Amount</span>
                                <span className="tx-detail-value">{formatAmount(detailTarget.amount, detailTarget.currency)}</span>
                            </div>
                            <div className="tx-detail-item">
                                <span className="meta-label">Created</span>
                                <span className="tx-detail-value">
                                    {detailTarget.createdAt ? new Date(detailTarget.createdAt).toLocaleString() : '—'}
                                </span>
                            </div>
                            <div className="tx-detail-item">
                                <span className="meta-label">Updated</span>
                                <span className="tx-detail-value">
                                    {detailTarget.updatedAt ? new Date(detailTarget.updatedAt).toLocaleString() : '—'}
                                </span>
                            </div>
                            {detailTarget.description && (
                                <div className="tx-detail-item tx-detail-item-full">
                                    <span className="meta-label">Description</span>
                                    <span className="tx-detail-value">{detailTarget.description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Transactions;