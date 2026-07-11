import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function getUrgencyClass(dateStr) {
  if (!dateStr) return '';
  const daysLeft = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 3) return 'urgency-danger';
  if (daysLeft <= 7) return 'urgency-warning';
  return '';
}

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/subscriptions', { withCredentials: true })
      .then(res => {
        setSubscriptions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load subscriptions. Please log in again.');
        setLoading(false);
      });
  }, []);

  const totalMonthly = subscriptions
    .filter(s => s.amount)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Your Subscriptions</h1>
        <p className="dashboard-summary">
          Total tracked monthly spend: <strong>${totalMonthly.toFixed(2)}</strong>
        </p>

        {loading && <p>Loading your subscriptions...</p>}
        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
        {!loading && !error && subscriptions.length === 0 && (
          <p>No subscriptions found yet — we'll scan your inbox shortly.</p>
        )}

        <div className="subscription-list">
          {subscriptions.map(sub => (
            <div key={sub._id} className={`subscription-card ${getUrgencyClass(sub.nextRenewalDate)}`}>
              <div>
                <div className="subscription-name">{sub.serviceName}</div>
                <div className="subscription-meta">
                  {sub.amount ? `$${sub.amount}` : 'Amount unknown'}
                  {sub.nextRenewalDate ? ` · renews ${new Date(sub.nextRenewalDate).toDateString()}` : ''}
                </div>
              </div>
              <span className={`status-badge ${sub.status}`}>{sub.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;