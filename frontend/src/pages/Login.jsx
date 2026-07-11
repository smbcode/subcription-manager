function Login() {
    const handleLogin = ()=>{
        window.location.href= 'http://localhost:5000/auth/google';
    };
    return (
        <div style={{textAlign: 'center',marginTop: '100px'}}>
            <h1>Subscription Manager</h1>
            <p>Track your subscriptions automatically from your Gmail</p>
            <button onClick={handleLogin} style={{padding: '12px 24px',fontsize: '16px', cursor: 'pointer'}}>
                Connect with Google, to start!
            </button>
        </div>
    );
}

export default Login;