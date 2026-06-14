import './Avatar.css';

const Avatar = ({ photo, name, size = 'md' }) => {
    const initial = (name || '?')[0]?.toUpperCase() || '?';
    const src = photo ? `data:image/jpeg;base64,${photo}` : null;

    return (
        <span className={`avatar avatar-${size}`}>
      {src ? <img src={src} alt={name || 'Profile'} className="avatar-img" /> : initial}
    </span>
    );
};

export default Avatar;