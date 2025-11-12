import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const activeItem =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.path)) ?? NAV_ITEMS[0];

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <header className="topbar">
      <div className="topbar-tabs">
        <span className="topbar-tab topbar-tab-active">{activeItem.label}</span>
      </div>
      <div className="topbar-actions">
        <span className="topbar-greeting">Hello, {user?.fullName ?? 'there'}</span>
        <button type="button" className="btn-primary btn-compact" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
};

export default TopBar;

