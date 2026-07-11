import { useEffect, useState } from 'react';
import axios from 'axios';

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

  if (loading) return <p style={{ padding: '40px' }}>Loading your subscriptions...</p>;
  if (error) return <p style={{ padding: '40px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Your Subscriptions</h1>
      <p style={{ fontSize: '18px', color: '#555' }}>
        Total tracked monthly spend: <strong>${totalMonthly.toFixed(2)}</strong>
      </p>

      {subscriptions.length === 0 && (
        <p>No subscriptions found yet — we'll scan your inbox shortly.</p>
      )}

      <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
        {subscriptions.map(sub => (
          <div key={sub._id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <strong>{sub.serviceName}</strong>
              <div style={{ fontSize: '14px', color: '#777' }}>
                {sub.amount ? `$${sub.amount}` : 'Amount unknown'}
                {sub.nextRenewalDate ? ` · renews ${new Date(sub.nextRenewalDate).toDateString()}` : ''}
              </div>
            </div>
            <span style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              backgroundColor: sub.status === 'needs_review' ? '#fff3cd' : '#d4edda',
              color: sub.status === 'needs_review' ? '#856404' : '#155724',
            }}>
              {sub.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;