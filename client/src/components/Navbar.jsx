import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">UstaTop.uz</Link>
        <nav>
          <Link className="nav-link" to="/">Bosh sahifa</Link>
          {!user && <Link className="nav-link" to="/login">Kirish</Link>}
          {!user && <Link className="nav-link" to="/register">Ro'yxatdan o'tish</Link>}
          {user?.role === 'provider' && <Link className="nav-link" to="/dashboard">Usta kabineti</Link>}
          {user && <button onClick={logout}>Chiqish</button>}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
