import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Navbar() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/user/me`, { withCredentials: true })
      .then(res => setEmail(res.data.email))
      .catch(() => setEmail(''));
  }, []);

  const initial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div className="navbar">
      <div className="navbar-brand">Subscription Manager</div>
      {email && (
        <div className="navbar-profile">
          <span className="profile-email">{email}</span>
          <div className="profile-avatar">{initial}</div>
        </div>
      )}
    </div>
  );
}

export default Navbar;