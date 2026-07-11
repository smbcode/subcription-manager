import { useEffect, useState } from 'react';
import axios from 'axios';

function Navbar() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/user/me', { withCredentials: true })
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