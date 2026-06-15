import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import './AIRiskEngine.css';

/* ------------------------------------------------------------------ */
/* Static reference data                                               */
/* ------------------------------------------------------------------ */

const typeOptions = [
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'CARD_PURCHASE', label: 'Card purchase' },
];

const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'AZN', label: 'AZN' },
    { value: 'GBP', label: 'GBP' },
];

const channelOptions = [
    { value: 'MOBILE', label: 'Mobile app' },
    { value: 'WEB', label: 'Web banking' },
    { value: 'ATM', label: 'ATM' },
    { value: 'POS', label: 'Point of sale' },
    { value: 'API', label: 'Bank API' },
];

const pipelineStages = [
    {
        key: 'ingest',
        title: 'Ingestion',
        desc: 'Transaction is normalized, hashed, and matched against account graph.',
        ms: [120, 260],
    },
    {
        key: 'features',
        title: 'Feature extraction',
        desc: 'Velocity, geo, device, and behavioral features computed in real time.',
        ms: [180, 340],
    },
    {
        key: 'graph',
        title: 'Network graph lookup',
        desc: 'Cross-bank hashed identity graph checked for shared rings & mule patterns.',
        ms: [150, 300],
    },
    {
        key: 'model',
        title: 'Model inference',
        desc: 'Gradient-boosted ensemble + sequence model score the transaction.',
        ms: [80, 200],
    },
    {
        key: 'decision',
        title: 'Decision & routing',
        desc: 'Score thresholds map to approve / review / block, with reason codes.',
        ms: [40, 110],
    },
];

const reasonCodeBank = {
    low: [
        'Device and IP consistent with account history',
        'Amount within normal range for this account',
        'No shared-entity flags found in network graph',
        'Velocity within expected limits',
    ],
    medium: [
        'Transaction amount above 90th percentile for account',
        'New beneficiary added within last 24 hours',
        'Slight deviation from typical transaction time window',
        'Device fingerprint seen for the first time on this account',
    ],
    high: [
        'Receiver linked to entities flagged in 3+ member banks',
        'Velocity spike: 5x transactions in last 10 minutes',
        'Geo-impossible travel between last two transactions',
        'Amount structured just under reporting threshold',
        'Account opened less than 48 hours ago',
    ],
};

const futureApis = [
    {
        name: 'POST /ai/score',
        desc: 'Synchronous scoring endpoint — submit a transaction payload and receive a fraud score, decision, and reason codes within ~150ms.',
        status: 'planned',
    },
    {
        name: 'GET /ai/models',
        desc: 'List active model versions, training date, and current performance metrics per model.',
        status: 'planned',
    },
    {
        name: 'GET /ai/models/{id}/metrics',
        desc: 'Detailed precision, recall, ROC-AUC, and drift metrics for a specific model version.',
        status: 'planned',
    },
    {
        name: 'POST /ai/feedback',
        desc: 'Send confirmed fraud/legit labels back to the engine for continuous learning and model retraining.',
        status: 'planned',
    },
    {
        name: 'GET /ai/explain/{transactionId}',
        desc: 'Returns SHAP-style feature contribution breakdown for a scored transaction (explainability).',
        status: 'planned',
    },
    {
        name: 'GET /ai/network-graph',
        desc: 'Query the cross-bank hashed identity graph for shared devices, accounts, or beneficiaries.',
        status: 'planned',
    },
    {
        name: 'GET /ai/alerts/stream',
        desc: 'WebSocket / SSE stream of high-risk transactions as they are scored across the network.',
        status: 'planned',
    },
    {
        name: 'POST /ai/rules',
        desc: 'Manage rule-based overrides that sit alongside the ML model (allow-lists, hard blocks, thresholds).',
        status: 'planned',
    },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const seededRandom = (seed) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const formatScore = (score) => score.toFixed(2);

const decisionForScore = (score) => {
    if (score >= 0.75) return { label: 'BLOCK', variant: 'danger' };
    if (score >= 0.4) return { label: 'REVIEW', variant: 'warning' };
    return { label: 'APPROVE', variant: 'success' };
};

const riskBand = (score) => {
    if (score >= 0.75) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
};

const pickReasonCodes = (band, rng) => {
    const pool = reasonCodeBank[band];
    const count = band === 'low' ? 2 : band === 'medium' ? 2 : 3;
    const shuffled = [...pool].sort(() => rng() - 0.5);
    return shuffled.slice(0, count);
};

/* Deterministic-ish "model" — combines simple heuristics on the inputs
   with randomness so repeated runs vary slightly, like a real model. */
const computeFraudScore = (form, rng) => {
    let score = 0.05;

    const amount = Number(form.amount) || 0;
    if (amount > 10000) score += 0.35;
    else if (amount > 3000) score += 0.18;
    else if (amount > 800) score += 0.06;

    if (form.newBeneficiary) score += 0.18;
    if (form.channel === 'API') score += 0.05;
    if (form.channel === 'ATM' && amount > 2000) score += 0.1;

    const hour = Number(form.hour);
    if (hour >= 0 && hour <= 5) score += 0.12;

    if (form.crossBorder) score += 0.15;

    if (form.transactionType === 'WITHDRAWAL' && amount > 5000) score += 0.1;
    if (form.transactionType === 'CARD_PURCHASE' && form.crossBorder) score += 0.08;

    // model "noise"
    score += (rng() - 0.5) * 0.12;

    return clamp(score, 0.01, 0.99);
};

const buildScoreHistory = (rng, n = 24) => {
    const points = [];
    for (let i = 0; i < n; i++) {
        const base = 0.18 + Math.sin(i / 3) * 0.08;
        const spike = rng() > 0.86 ? rng() * 0.5 : 0;
        points.push(clamp(base + rng() * 0.12 + spike, 0.02, 0.97));
    }
    return points;
};

const buildDistribution = (rng) => {
    // 10 buckets from 0 to 1
    const buckets = new Array(10).fill(0);
    for (let i = 0; i < 400; i++) {
        let v;
        const r = rng();
        if (r < 0.78) v = rng() * 0.4; // mostly low risk
        else if (r < 0.95) v = 0.4 + rng() * 0.35; // medium
        else v = 0.75 + rng() * 0.25; // high
        const idx = clamp(Math.floor(v * 10), 0, 9);
        buckets[idx]++;
    }
    return buckets;
};

const initialFormState = {
    transactionType: 'TRANSFER',
    amount: '2500',
    currency: 'USD',
    channel: 'MOBILE',
    hour: '14',
    fromAccountId: 'acc_4f21a8',
    toAccountId: 'acc_9d03e1',
    newBeneficiary: false,
    crossBorder: false,
};

/* ------------------------------------------------------------------ */
/* Sub components                                                       */
/* ------------------------------------------------------------------ */

const ScoreGauge = ({ score }) => {
    const angle = -90 + clamp(score, 0, 1) * 180;
    const decision = decisionForScore(score);
    const color =
        decision.variant === 'danger' ? 'var(--danger)' : decision.variant === 'warning' ? 'var(--warning)' : 'var(--success)';

    return (
        <svg viewBox="0 0 220 130" width="220" height="130" className="score-gauge">
            <path d="M20 110 A 90 90 0 0 1 200 110" fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round" />
            <path
                d="M20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="var(--accent-dim)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 * (1 - clamp(score, 0, 1))}
                opacity="0.0"
            />
            {/* colored arc segments */}
            <path d="M20 110 A 90 90 0 0 1 75 31.5" fill="none" stroke="var(--success)" strokeWidth="14" strokeLinecap="round" opacity="0.55" />
            <path d="M75 31.5 A 90 90 0 0 1 145 31.5" fill="none" stroke="var(--warning)" strokeWidth="14" opacity="0.5" />
            <path d="M145 31.5 A 90 90 0 0 1 200 110" fill="none" stroke="var(--danger)" strokeWidth="14" strokeLinecap="round" opacity="0.55" />

            <g transform={`rotate(${angle} 110 110)`} style={{ transition: 'transform 0.6s cubic-bezier(.4,1.4,.4,1)' }}>
                <line x1="110" y1="110" x2="110" y2="34" stroke={color} strokeWidth="3" strokeLinecap="round" />
                <circle cx="110" cy="110" r="6" fill={color} />
            </g>

            <text x="110" y="100" textAnchor="middle" className="gauge-score mono" fill="var(--text-primary)">
                {formatScore(score)}
            </text>
        </svg>
    );
};

const Sparkline = ({ data, danger }) => {
    const w = 100;
    const h = 32;
    const max = Math.max(...data, 0.01);
    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - (v / max) * (h - 4) - 2;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="sparkline">
            <polyline points={points} fill="none" stroke={danger ? 'var(--danger)' : 'var(--accent)'} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
};

const ScoreHistoryChart = ({ data }) => {
    const w = 600;
    const h = 180;
    const padding = { top: 16, right: 12, bottom: 26, left: 36 };
    const innerW = w - padding.left - padding.right;
    const innerH = h - padding.top - padding.bottom;

    const points = data.map((v, i) => {
        const x = padding.left + (i / (data.length - 1)) * innerW;
        const y = padding.top + (1 - v) * innerH;
        return [x, y, v];
    });

    const linePoints = points.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPoints = `${padding.left},${padding.top + innerH} ${linePoints} ${padding.left + innerW},${padding.top + innerH}`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="history-chart" preserveAspectRatio="xMidYMid meet">
            {/* threshold bands */}
            <rect x={padding.left} y={padding.top} width={innerW} height={innerH * 0.25} fill="var(--danger)" opacity="0.06" />
            <rect x={padding.left} y={padding.top + innerH * 0.25} width={innerW} height={innerH * 0.35} fill="var(--warning)" opacity="0.05" />
            <rect x={padding.left} y={padding.top + innerH * 0.6} width={innerW} height={innerH * 0.4} fill="var(--success)" opacity="0.05" />

            {gridLines.map((g) => {
                const y = padding.top + (1 - g) * innerH;
                return (
                    <g key={g}>
                        <line x1={padding.left} y1={y} x2={padding.left + innerW} y2={y} stroke="var(--border-soft)" strokeWidth="1" />
                        <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                            {g.toFixed(2)}
                        </text>
                    </g>
                );
            })}

            <polygon points={areaPoints} fill="var(--accent)" opacity="0.08" />
            <polyline points={linePoints} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

            {points.map(([x, y, v], i) => (
                <circle key={i} cx={x} cy={y} r={v >= 0.75 ? 3.5 : 2.5} fill={v >= 0.75 ? 'var(--danger)' : 'var(--accent)'} stroke="var(--surface)" strokeWidth="1.5" />
            ))}

            <line x1="0.75" y1={padding.top + innerH * 0.25} x2={w} y2={padding.top + innerH * 0.25} stroke="transparent" />
            <text x={padding.left + innerW} y={padding.top + innerH * 0.25 - 4} textAnchor="end" fontSize="9" fill="var(--danger)" fontFamily="var(--font-mono)" opacity="0.8">
                block threshold
            </text>
        </svg>
    );
};

const DistributionChart = ({ buckets }) => {
    const w = 600;
    const h = 160;
    const padding = { top: 12, right: 12, bottom: 28, left: 12 };
    const innerW = w - padding.left - padding.right;
    const innerH = h - padding.top - padding.bottom;
    const max = Math.max(...buckets, 1);
    const barW = innerW / buckets.length;

    const colorFor = (i) => (i >= 8 ? 'var(--danger)' : i >= 4 ? 'var(--warning)' : 'var(--accent)');

    return (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="distribution-chart" preserveAspectRatio="xMidYMid meet">
            {buckets.map((v, i) => {
                const barH = (v / max) * innerH;
                const x = padding.left + i * barW;
                const y = padding.top + innerH - barH;
                return (
                    <g key={i}>
                        <rect x={x + 3} y={y} width={barW - 6} height={barH} rx="3" fill={colorFor(i)} opacity="0.7" />
                        <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                            {(i / 10).toFixed(1)}
                        </text>
                    </g>
                );
            })}
            <line x1={padding.left} y1={padding.top + innerH} x2={w - padding.right} y2={padding.top + innerH} stroke="var(--border-soft)" strokeWidth="1" />
        </svg>
    );
};

const FeatureImportanceChart = ({ features }) => {
    const max = Math.max(...features.map((f) => f.value));
    return (
        <div className="feature-bars">
            {features.map((f) => (
                <div className="feature-bar-row" key={f.label}>
                    <span className="feature-bar-label">{f.label}</span>
                    <div className="feature-bar-track">
                        <div className="feature-bar-fill" style={{ width: `${(f.value / max) * 100}%` }} />
                    </div>
                    <span className="feature-bar-value mono">{f.value.toFixed(2)}</span>
                </div>
            ))}
        </div>
    );
};

const ArchitectureDiagram = () => (
    <svg viewBox="0 0 920 360" width="100%" height="100%" className="architecture-diagram" preserveAspectRatio="xMidYMid meet">
        <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-dim)" />
            </marker>
        </defs>

        {/* lanes background labels */}
        <text x="20" y="28" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)" letterSpacing="0.1em">DATA SOURCES</text>
        <text x="320" y="28" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)" letterSpacing="0.1em">REAL-TIME PIPELINE</text>
        <text x="700" y="28" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)" letterSpacing="0.1em">OUTPUTS</text>

        {/* Data source nodes */}
        {[
            { y: 60, label: 'Member bank A', sub: 'transactions' },
            { y: 140, label: 'Member bank B', sub: 'transactions' },
            { y: 220, label: 'Member bank C', sub: 'transactions' },
            { y: 300, label: 'Hashed identity graph', sub: 'shared signals' },
        ].map((n) => (
            <g key={n.label}>
                <rect x="20" y={n.y} width="190" height="56" rx="10" fill="var(--surface-raised)" stroke="var(--border)" />
                <text x="40" y={n.y + 24} fontSize="13" fill="var(--text-primary)" fontFamily="var(--font-display)">{n.label}</text>
                <text x="40" y={n.y + 42} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">{n.sub}</text>
                <line x1="210" y1={n.y + 28} x2="320" y2="180" stroke="var(--accent-dim)" strokeWidth="1.4" markerEnd="url(#arrow)" opacity="0.6" />
            </g>
        ))}

        {/* Pipeline nodes */}
        <rect x="320" y="40" width="220" height="280" rx="14" fill="var(--accent-glow)" stroke="var(--accent-dim)" strokeDasharray="4 4" />
        <text x="340" y="64" fontSize="12" fill="var(--accent)" fontFamily="var(--font-mono)" letterSpacing="0.08em">AI RISK ENGINE</text>

        {[
            { y: 80, label: 'Feature store', sub: 'velocity · geo · device' },
            { y: 150, label: 'Ensemble model', sub: 'GBM + sequence net' },
            { y: 220, label: 'Graph scoring', sub: 'ring & mule detection' },
            { y: 280, label: 'Decision layer', sub: 'thresholds + rules' },
        ].map((n, i) => (
            <g key={n.label}>
                <rect x="345" y={n.y} width="170" height="48" rx="10" fill="var(--surface)" stroke="var(--accent-dim)" />
                <text x="360" y={n.y + 20} fontSize="12.5" fill="var(--text-primary)" fontFamily="var(--font-display)">{n.label}</text>
                <text x="360" y={n.y + 37} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{n.sub}</text>
                {i < 3 && (
                    <line x1="430" y1={n.y + 48} x2="430" y2={n.y + 70} stroke="var(--accent-dim)" strokeWidth="1.4" markerEnd="url(#arrow)" />
                )}
            </g>
        ))}

        {/* Output nodes */}
        {[
            { y: 60, label: 'Approve', variant: 'success' },
            { y: 140, label: 'Review queue', variant: 'warning' },
            { y: 220, label: 'Block / hold', variant: 'danger' },
            { y: 300, label: 'Feedback loop → retraining', variant: 'accent' },
        ].map((n) => (
            <g key={n.label}>
                <line x1="540" y1="180" x2="690" y2={n.y + 28} stroke="var(--accent-dim)" strokeWidth="1.4" markerEnd="url(#arrow)" opacity="0.6" />
                <rect
                    x="690"
                    y={n.y}
                    width="210"
                    height="56"
                    rx="10"
                    fill="var(--surface-raised)"
                    stroke={n.variant === 'accent' ? 'var(--accent-dim)' : `var(--${n.variant})`}
                    strokeOpacity={n.variant === 'accent' ? 1 : 0.4}
                />
                <circle cx="710" cy={n.y + 28} r="5" fill={n.variant === 'accent' ? 'var(--accent)' : `var(--${n.variant})`} />
                <text x="726" y={n.y + 32} fontSize="13" fill="var(--text-primary)" fontFamily="var(--font-display)">{n.label}</text>
            </g>
        ))}

        {/* feedback loop curve */}
        <path d="M795 356 C 600 400, 430 400, 430 320" fill="none" stroke="var(--accent-dim)" strokeWidth="1.4" strokeDasharray="3 5" markerEnd="url(#arrow)" opacity="0.5" />
    </svg>
);

const PipelineRunner = ({ running, activeStage, results }) => (
    <div className="pipeline-runner">
        {pipelineStages.map((stage, i) => {
            const status = !running && results === null ? 'idle' : i < activeStage || results ? 'done' : i === activeStage ? 'active' : 'pending';
            return (
                <div className={`pipeline-step pipeline-step-${status}`} key={stage.key}>
                    <div className="pipeline-step-marker">
                        {status === 'done' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : status === 'active' ? (
                            <span className="pipeline-spinner" />
                        ) : (
                            <span className="pipeline-dot" />
                        )}
                    </div>
                    <div className="pipeline-step-body">
                        <div className="pipeline-step-title">{stage.title}</div>
                        <div className="pipeline-step-desc">{stage.desc}</div>
                    </div>
                    {i < pipelineStages.length - 1 && <div className="pipeline-connector" />}
                </div>
            );
        })}
    </div>
);

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */

const AIRiskEngine = () => {
    const [form, setForm] = useState(initialFormState);
    const [running, setRunning] = useState(false);
    const [activeStage, setActiveStage] = useState(-1);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [feed, setFeed] = useState([]);

    const rngRef = useRef(seededRandom(20260615));
    const timersRef = useRef([]);

    useEffect(() => {
        const rng = rngRef.current;
        setHistory(buildScoreHistory(rng));
        const seedFeed = Array.from({ length: 6 }, (_, i) => {
            const score = clamp(0.05 + rng() * (rng() > 0.85 ? 0.9 : 0.4), 0.01, 0.98);
            return {
                id: `sim_${Date.now() - i * 90000}_${i}`,
                type: typeOptions[Math.floor(rng() * typeOptions.length)].label,
                amount: Math.round(50 + rng() * 9000),
                currency: 'USD',
                score,
                decision: decisionForScore(score),
                time: new Date(Date.now() - i * 90000),
            };
        });
        setFeed(seedFeed);

        return () => timersRef.current.forEach((t) => clearTimeout(t));
    }, []);

    const distribution = useMemo(() => buildDistribution(seededRandom(7321)), []);

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleRandomize = () => {
        const rng = rngRef.current;
        setForm({
            transactionType: typeOptions[Math.floor(rng() * typeOptions.length)].value,
            amount: String(Math.round(20 + rng() * 14000)),
            currency: currencyOptions[Math.floor(rng() * currencyOptions.length)].value,
            channel: channelOptions[Math.floor(rng() * channelOptions.length)].value,
            hour: String(Math.floor(rng() * 24)),
            fromAccountId: `acc_${Math.random().toString(16).slice(2, 8)}`,
            toAccountId: `acc_${Math.random().toString(16).slice(2, 8)}`,
            newBeneficiary: rng() > 0.6,
            crossBorder: rng() > 0.75,
        });
    };

    const runSimulation = () => {
        if (running) return;
        timersRef.current.forEach((t) => clearTimeout(t));
        timersRef.current = [];

        setRunning(true);
        setResult(null);
        setActiveStage(0);

        let elapsed = 0;
        pipelineStages.forEach((stage, i) => {
            const duration = stage.ms[0] + rngRef.current() * (stage.ms[1] - stage.ms[0]);
            elapsed += duration;
            const t = setTimeout(() => {
                if (i < pipelineStages.length - 1) {
                    setActiveStage(i + 1);
                } else {
                    finishSimulation();
                }
            }, elapsed);
            timersRef.current.push(t);
        });
    };

    const finishSimulation = () => {
        const rng = rngRef.current;
        const score = computeFraudScore(form, rng);
        const decision = decisionForScore(score);
        const band = riskBand(score);
        const reasons = pickReasonCodes(band, rng);

        const features = [
            { label: 'Amount vs. account baseline', value: clamp(0.1 + Number(form.amount) / 20000, 0.05, 0.95) },
            { label: 'Beneficiary novelty', value: form.newBeneficiary ? 0.7 + rng() * 0.2 : 0.1 + rng() * 0.15 },
            { label: 'Time-of-day anomaly', value: Number(form.hour) <= 5 ? 0.6 + rng() * 0.25 : 0.1 + rng() * 0.2 },
            { label: 'Cross-border risk', value: form.crossBorder ? 0.65 + rng() * 0.25 : 0.08 + rng() * 0.1 },
            { label: 'Network graph similarity', value: 0.1 + rng() * (band === 'high' ? 0.7 : 0.3) },
            { label: 'Channel risk profile', value: form.channel === 'ATM' || form.channel === 'API' ? 0.35 + rng() * 0.2 : 0.1 + rng() * 0.15 },
        ].sort((a, b) => b.value - a.value);

        const newResult = {
            score,
            decision,
            band,
            reasons,
            features,
            latencyMs: Math.round(pipelineStages.reduce((acc, s) => acc + (s.ms[0] + s.ms[1]) / 2, 0)),
            timestamp: new Date(),
        };

        setResult(newResult);
        setRunning(false);
        setActiveStage(pipelineStages.length);

        setHistory((prev) => [...prev.slice(1), score]);
        setFeed((prev) => [
            {
                id: `sim_${Date.now()}`,
                type: typeOptions.find((t) => t.value === form.transactionType)?.label || form.transactionType,
                amount: Number(form.amount) || 0,
                currency: form.currency,
                score,
                decision,
                time: new Date(),
            },
            ...prev,
        ].slice(0, 8));
    };

    const totalLatency = useMemo(() => Math.round(pipelineStages.reduce((acc, s) => acc + (s.ms[0] + s.ms[1]) / 2, 0)), []);

    return (
        <div className="ai-engine-page">
            <div className="page-header">
                <div>
                    <h2>AI risk engine</h2>
                    <p>Real-time fraud scoring across the SiGNA network — simulate transactions and explore how the model decides.</p>
                </div>
                <Badge variant="accent">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.4" />
                    </svg>
                    Simulation mode
                </Badge>
            </div>

            {/* Top stat cards */}
            <div className="ai-stats-grid">
                <Card className="ai-stat-card">
                    <span className="ai-stat-label">Model accuracy</span>
                    <span className="ai-stat-value mono">96.4%</span>
                    <Sparkline data={[0.92, 0.93, 0.94, 0.95, 0.94, 0.96, 0.964]} />
                    <span className="ai-stat-foot">Validated on last 30 days of labeled data</span>
                </Card>
                <Card className="ai-stat-card">
                    <span className="ai-stat-label">Avg. scoring latency</span>
                    <span className="ai-stat-value mono">{totalLatency} ms</span>
                    <Sparkline data={[640, 610, 590, 605, 580, 575, totalLatency]} />
                    <span className="ai-stat-foot">End-to-end, ingestion to decision</span>
                </Card>
                <Card className="ai-stat-card">
                    <span className="ai-stat-label">Flagged this session</span>
                    <span className="ai-stat-value mono">{feed.filter((f) => f.decision.label !== 'APPROVE').length}</span>
                    <Sparkline data={[1, 2, 1, 3, 2, 2, feed.filter((f) => f.decision.label !== 'APPROVE').length || 1]} danger />
                    <span className="ai-stat-foot">Review + block decisions in simulator</span>
                </Card>
                <Card className="ai-stat-card">
                    <span className="ai-stat-label">Active model version</span>
                    <span className="ai-stat-value mono">v2.3.1</span>
                    <div className="ai-model-tags">
                        <Badge variant="default">GBM ensemble</Badge>
                        <Badge variant="default">Sequence net</Badge>
                    </div>
                    <span className="ai-stat-foot">Trained on cross-bank dataset · updated weekly</span>
                </Card>
            </div>

            {/* Simulator */}
            <div className="section-heading">
                <h3>Transaction simulator</h3>
                <p>Enter a hypothetical transaction and run it through the AI risk pipeline to see how it would be scored.</p>
            </div>

            <div className="simulator-grid">
                <Card className="simulator-form">
                    <div className="simulator-form-header">
                        <h4>Transaction details</h4>
                        <button className="link-btn mono" onClick={handleRandomize} type="button">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M3 12a9 9 0 0115-6.7M21 12a9 9 0 01-15 6.7M3 5v4h4M21 19v-4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Randomize
                        </button>
                    </div>

                    <div className="simulator-fields">
                        <Select label="Transaction type" name="transactionType" value={form.transactionType} onChange={handleChange('transactionType')} options={typeOptions} />
                        <div className="simulator-row">
                            <Input label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange('amount')} />
                            <Select label="Currency" name="currency" value={form.currency} onChange={handleChange('currency')} options={currencyOptions} />
                        </div>
                        <div className="simulator-row">
                            <Input label="Sender account" name="fromAccountId" value={form.fromAccountId} onChange={handleChange('fromAccountId')} />
                            <Input label="Receiver account" name="toAccountId" value={form.toAccountId} onChange={handleChange('toAccountId')} />
                        </div>
                        <div className="simulator-row">
                            <Select label="Channel" name="channel" value={form.channel} onChange={handleChange('channel')} options={channelOptions} />
                            <Input label="Hour of day (0–23)" name="hour" type="number" value={form.hour} onChange={handleChange('hour')} />
                        </div>

                        <div className="simulator-toggles">
                            <label className="toggle-row">
                                <input type="checkbox" checked={form.newBeneficiary} onChange={handleChange('newBeneficiary')} />
                                <span>New beneficiary (first transaction to this receiver)</span>
                            </label>
                            <label className="toggle-row">
                                <input type="checkbox" checked={form.crossBorder} onChange={handleChange('crossBorder')} />
                                <span>Cross-border transaction</span>
                            </label>
                        </div>
                    </div>

                    <Button onClick={runSimulation} loading={running} fullWidth icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                        </svg>
                    }>
                        {running ? 'Scoring transaction…' : 'Run simulation'}
                    </Button>
                </Card>

                <Card className="simulator-pipeline">
                    <h4>Live pipeline</h4>
                    <PipelineRunner running={running} activeStage={activeStage} results={result} />
                </Card>

                <Card className="simulator-result">
                    <h4>Result</h4>
                    {!result ? (
                        <div className="result-empty">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>Run a simulation to see the fraud score, decision, and contributing factors.</p>
                        </div>
                    ) : (
                        <div className="result-content">
                            <div className="result-gauge-wrap">
                                <ScoreGauge score={result.score} />
                                <Badge variant={result.decision.variant}>{result.decision.label}</Badge>
                            </div>
                            <div className="result-meta">
                                <div className="result-meta-item">
                                    <span className="meta-label">Scoring latency</span>
                                    <span className="mono meta-value">{result.latencyMs} ms</span>
                                </div>
                                <div className="result-meta-item">
                                    <span className="meta-label">Scored at</span>
                                    <span className="mono meta-value">{result.timestamp.toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="result-reasons">
                                <span className="meta-label">Reason codes</span>
                                <ul>
                                    {result.reasons.map((r) => (
                                        <li key={r}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {result && (
                <Card className="feature-importance-card">
                    <h4>Feature contribution for this transaction</h4>
                    <p className="card-subtitle">Relative influence of each signal on the final fraud score (simulated explainability output).</p>
                    <FeatureImportanceChart features={result.features} />
                </Card>
            )}

            {/* Charts row */}
            <div className="section-heading">
                <h3>Network signal overview</h3>
                <p>Aggregate view of fraud scores across recent simulated activity.</p>
            </div>

            <div className="charts-grid">
                <Card className="chart-card chart-card-wide">
                    <div className="chart-card-header">
                        <h4>Fraud score over time</h4>
                        <span className="card-subtitle">Last 24 scored transactions</span>
                    </div>
                    <ScoreHistoryChart data={history} />
                </Card>
                <Card className="chart-card">
                    <div className="chart-card-header">
                        <h4>Score distribution</h4>
                        <span className="card-subtitle">Across recent network volume</span>
                    </div>
                    <DistributionChart buckets={distribution} />
                </Card>
            </div>

            {/* Architecture */}
            <div className="section-heading">
                <h3>How the engine works</h3>
                <p>A simplified view of the architecture connecting member banks to the shared AI risk engine.</p>
            </div>

            <Card className="architecture-card">
                <ArchitectureDiagram />
                <div className="architecture-legend">
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: 'var(--accent)' }} />
                        Each member bank streams hashed transaction events — no raw PII leaves the bank's environment.
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: 'var(--accent)' }} />
                        The feature store and ensemble model score transactions in real time using shared, anonymized signals.
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: 'var(--accent)' }} />
                        Decisions route to approve, review, or block — with confirmed outcomes feeding back into retraining.
                    </div>
                </div>
            </Card>

            {/* Recent simulated activity */}
            <div className="section-heading">
                <h3>Recent simulated transactions</h3>
                <p>Results from this session, most recent first.</p>
            </div>

            <Card className="feed-card">
                {feed.length === 0 ? (
                    <div className="result-empty">
                        <p>No simulations run yet this session.</p>
                    </div>
                ) : (
                    <table className="feed-table">
                        <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Fraud score</th>
                            <th>Decision</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {feed.map((f) => (
                            <tr key={f.id}>
                                <td className="mono">{f.id}</td>
                                <td><Badge variant="default">{f.type}</Badge></td>
                                <td className="mono">{f.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {f.currency}</td>
                                <td><Badge variant={riskBand(f.score) === 'high' ? 'danger' : riskBand(f.score) === 'medium' ? 'warning' : 'success'}>{formatScore(f.score)}</Badge></td>
                                <td><Badge variant={f.decision.variant}>{f.decision.label}</Badge></td>
                                <td className="mono">{f.time.toLocaleTimeString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {/* Future APIs */}
            <div className="section-heading">
                <h3>Planned API endpoints</h3>
                <p>These endpoints will connect the AI risk engine to live bank systems. Not yet available — for reference only.</p>
            </div>

            <div className="api-grid">
                {futureApis.map((api) => (
                    <Card className="api-card" key={api.name}>
                        <div className="api-card-header">
                            <span className="mono api-name">{api.name}</span>
                            <Badge variant="default">planned</Badge>
                        </div>
                        <p>{api.desc}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AIRiskEngine;