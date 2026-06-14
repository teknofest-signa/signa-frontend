import './Select.css';

const Select = ({ label, value, onChange, name, options, required = false }) => {
    return (
        <div className="field">
            {label && (
                <label className="field-label" htmlFor={name}>
                    {label}
                </label>
            )}
            <div className="select-wrapper">
                <select id={name} name={name} value={value} onChange={onChange} required={required} className="field-input field-select">
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="select-chevron">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};

export default Select;