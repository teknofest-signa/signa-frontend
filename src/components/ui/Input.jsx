import './Input.css';

const Input = ({
                   label,
                   type = 'text',
                   value,
                   onChange,
                   placeholder,
                   error,
                   name,
                   required = false,
                   autoComplete,
               }) => {
    return (
        <div className="field">
            {label && (
                <label className="field-label" htmlFor={name}>
                    {label}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                className={`field-input ${error ? 'field-input-error' : ''}`}
            />
            {error && <span className="field-error">{error}</span>}
        </div>
    );
};

export default Input;