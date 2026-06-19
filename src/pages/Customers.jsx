import { useEffect, useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { getAllCustomers, createCustomer } from '../api/customers';
import { loadBankOptions } from '../api/bankCache';
import './Customers.css';

const statusVariant = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    BLOCKED: 'danger',
    SUSPENDED: 'warning',
};

const pageSizeOptions = [
    { value: '10', label: '10 / page' },
    { value: '20', label: '20 / page' },
    { value: '50', label: '50 / page' },
    { value: '100', label: '100 / page' },
];

const buildPageRange = (current, total) => {
    if (total <= 7) return [...Array(total).keys()];

    const pages = new Set([0, total - 1, current]);
    pages.add(Math.max(0, current - 1));
    pages.add(Math.min(total - 1, current + 1));

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
            result.push('…');
        }
        result.push(sorted[i]);
    }
    return result;
};

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [registerOpen, setRegisterOpen] = useState(false);
    const [registerName, setRegisterName] = useState('');
    const [registerFin, setRegisterFin] = useState('');
    const [registerBankId, setRegisterBankId] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    const [bankOptions, setBankOptions] = useState([]);
    const [bankOptionsLoading, setBankOptionsLoading] = useState(false);
    const [bankOptionsError, setBankOptionsError] = useState('');

    const fetchCustomers = async (targetPage, targetSize) => {
        setLoading(true);
        setLoadError('');
        try {
            const { data } = await getAllCustomers(targetPage, targetSize);
            const content = Array.isArray(data) ? data : data?.content || [];
            setCustomers(content);
            setTotalPages(data?.totalPages ?? (content.length < targetSize && targetPage === 0 ? 1 : targetPage + 1));
            setTotalElements(data?.totalElements ?? content.length);
        } catch (err) {
            setLoadError('Could not load customers. The customers endpoint may not be available yet.');
            setCustomers([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(page, pageSize);
    }, [page, pageSize]);

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(0);
    };

    const goToPage = (target) => {
        if (target < 0 || target > totalPages - 1 || target === page) return;
        setPage(target);
    };

    const rangeStart = totalElements === 0 ? 0 : page * pageSize + 1;
    const rangeEnd = Math.min(totalElements, page * pageSize + customers.length);
    const pageRange = buildPageRange(page, totalPages);

    const bankSelectOptions = useMemo(
        () => [
            { value: '', label: bankOptionsLoading ? 'Loading banks…' : 'Select a bank' },
            ...bankOptions.map((b) => ({ value: b.id, label: b.name })),
        ],
        [bankOptions, bankOptionsLoading]
    );

    const fetchBankOptions = async (forceRefresh = false) => {
        setBankOptionsLoading(true);
        setBankOptionsError('');
        try {
            const banks = await loadBankOptions({ forceRefresh });
            setBankOptions(banks);
        } catch (err) {
            setBankOptionsError('Could not load banks. Try refreshing the list.');
            setBankOptions([]);
        } finally {
            setBankOptionsLoading(false);
        }
    };

    const openRegisterModal = () => {
        setRegisterOpen(true);
        setRegisterName('');
        setRegisterFin('');
        setRegisterBankId('');
        setRegisterError('');
        fetchBankOptions();
    };

    const closeRegisterModal = () => {
        setRegisterOpen(false);
        setRegisterError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterLoading(true);
        try {
            await createCustomer({
                name: registerName.trim(),
                fin: registerFin.trim(),
                bankId: registerBankId,
            });
            closeRegisterModal();
            fetchCustomers(page, pageSize);
        } catch (err) {
            setRegisterError(err?.response?.data?.message || 'Could not register this customer. Please try again.');
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <div className="customers-page">
            <div className="page-header">
                <div>
                    <h2>Customers</h2>
                    <p>Customers registered across member banks, with status visibility into blocked accounts.</p>
                </div>
                <Button onClick={openRegisterModal} icon={(
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                )}>
                    Register customer
                </Button>
            </div>

            <Card className="customers-card">
                {loading ? (
                    <div className="customers-empty">
                        <span className="loading-spinner" />
                        <p>Loading customers…</p>
                    </div>
                ) : loadError ? (
                    <div className="customers-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>{loadError}</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="customers-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>No customers yet. Register one to get started.</p>
                    </div>
                ) : (
                    <table className="customers-table">
                        <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Bank</th>
                            <th>Status</th>
                            <th>Registered</th>
                        </tr>
                        </thead>
                        <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>
                                    <div className="customer-identity">
                                        <span className="customer-name">{customer.name}</span>
                                        <span className="customer-id mono">{customer.id}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="customer-bank">
                                        <span>{customer.bankName || '—'}</span>
                                        {customer.bankId && <span className="customer-bank-id mono">{customer.bankId}</span>}
                                    </div>
                                </td>
                                <td>
                                    <Badge variant={statusVariant[customer.customerStatus] || 'default'}>
                                        {customer.customerStatus?.replace(/_/g, ' ') || '—'}
                                    </Badge>
                                </td>
                                <td className="mono customer-date">
                                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {!loading && !loadError && customers.length > 0 && (
                    <div className="customers-pagination">
                        <div className="pagination-info">
                            Showing <strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of <strong>{totalElements}</strong>
                        </div>

                        <div className="pagination-controls">
                            <button className="pager-btn" onClick={() => goToPage(0)} disabled={page === 0} aria-label="First page">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="pager-btn" onClick={() => goToPage(page - 1)} disabled={page === 0} aria-label="Previous page">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 17l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <div className="pager-pages">
                                {pageRange.map((p, idx) =>
                                    p === '…' ? (
                                        <span className="pager-ellipsis" key={`ellipsis-${idx}`}>…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            className={`pager-page ${p === page ? 'pager-page-active' : ''}`}
                                            onClick={() => goToPage(p)}
                                        >
                                            {p + 1}
                                        </button>
                                    )
                                )}
                            </div>

                            <button className="pager-btn" onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1} aria-label="Next page">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="pager-btn" onClick={() => goToPage(totalPages - 1)} disabled={page >= totalPages - 1} aria-label="Last page">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 17l5-5-5-5M13 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="pagination-size">
                            <Select name="page-size" value={String(pageSize)} onChange={handlePageSizeChange} options={pageSizeOptions} />
                        </div>
                    </div>
                )}
            </Card>

            <Modal open={registerOpen} onClose={closeRegisterModal} title="Register a customer">
                <form className="invite-form" onSubmit={handleRegister}>
                    <p className="invite-desc">
                        Register a customer under a member bank. This calls a placeholder endpoint until the
                        customers API is available.
                    </p>

                    {registerError && <div className="invite-message invite-message-error">{registerError}</div>}
                    {bankOptionsError && <div className="invite-message invite-message-error">{bankOptionsError}</div>}

                    <Input
                        label="Full name"
                        type="text"
                        name="customer-name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Aysel Mammadova"
                        required
                    />

                    <Input
                        label="FIN code"
                        type="text"
                        name="customer-fin"
                        value={registerFin}
                        onChange={(e) => setRegisterFin(e.target.value.toUpperCase())}
                        placeholder="7XJ4ABC"
                        required
                    />

                    <div className="bank-select-row">
                        <Select
                            label="Bank"
                            name="customer-bank"
                            value={registerBankId}
                            onChange={(e) => setRegisterBankId(e.target.value)}
                            options={bankSelectOptions}
                            required
                        />
                        <button
                            type="button"
                            className="bank-refresh"
                            onClick={() => fetchBankOptions(true)}
                            disabled={bankOptionsLoading}
                            aria-label="Refresh bank list"
                            title="Refresh bank list"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M3 12a9 9 0 0115.4-6.4M21 12a9 9 0 01-15.4 6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18 3v5h-5M6 21v-5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="invite-actions">
                        <Button type="button" variant="ghost" onClick={closeRegisterModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={registerLoading}>
                            Register customer
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;