import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getUrgencyClass(dateStr) {
  if (!dateStr) return '';
  const daysLeft = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  if (daysLeft < 0) return 'urgency-overdue';
  if (daysLeft <= 3) return 'urgency-danger';
  if (daysLeft <= 7) return 'urgency-warning';
  return '';
}

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/subscriptions`, { withCredentials: true })
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

  const handleCancel = (id) => {
    axios.patch(`${API_URL}/api/subscriptions/${id}/cancel`, {}, { withCredentials: true })
      .then(res => {
        setSubscriptions(prev => prev.map(s => (s._id === id ? res.data : s)));
      })
      .catch(err => console.error('Cancel failed:', err));
  };

  const totalMonthly = subscriptions
    .filter(s => s.amount && s.status !== 'cancelled')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>Your Subscriptions</h1>
        <p className="dashboard-summary">
          Total tracked monthly spend: <strong>${totalMonthly.toFixed(2)}</strong>
        </p>
        <p className="dashboard-about">
          This dashboard automatically scans your Gmail for subscription receipts, extracts pricing and renewal dates, and alerts you by email before anything renews. No manual entry required.
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
                    {sub.nextRenewalDate && new Date(sub.nextRenewalDate) < new Date()
                        ? ' · no recent update — may be inactive'
                        : sub.nextRenewalDate
                            ? ` · renews ${new Date(sub.nextRenewalDate).toDateString()}`
                            : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`status-badge ${sub.status}`}>{sub.status}</span>
                {sub.status !== 'cancelled' && (
                  <button className="cancel-button" onClick={() => handleCancel(sub._id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;