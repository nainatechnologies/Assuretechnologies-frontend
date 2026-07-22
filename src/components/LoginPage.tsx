import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

export function LoginPage({ setIsLoggedIn }: { setIsLoggedIn?: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('9912345678');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login logic
    if (identifier === '9912345678' && password === '123456') {
      if (setIsLoggedIn) setIsLoggedIn(true);
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-input-group">
            <input
              type="text"
              className="auth-input"
              placeholder="Email or Mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="auth-forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="auth-submit-btn">
            Login
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register Now</Link>
        </div>
      </div>
    </div>
  );
}
