function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="login-container">
      <h1>Subscription Manager</h1>
      <p className="login-subtitle">
        Automatically track your subscriptions by scanning your Gmail for renewal receipts.
      </p>
      <button className="login-button" onClick={handleLogin}>
        Connect with Google
      </button>
    </div>
  );
}

export default Login;