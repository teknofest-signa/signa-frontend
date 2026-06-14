import './Button.css';

const Button = ({
                    children,
                    variant = 'primary',
                    size = 'md',
                    type = 'button',
                    disabled = false,
                    loading = false,
                    onClick,
                    icon,
                    fullWidth = false,
                    className = '',
                }) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className="btn-spinner" />
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;