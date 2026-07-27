import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    identifier: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    const newErrors = { identifier: '', password: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (!identifier.trim()) {
      newErrors.identifier = "Please enter Email or Mobile Number";
      hasError = true;
    } else if (identifier.includes('@') || /[a-zA-Z]/.test(identifier)) {
      if (!emailRegex.test(identifier)) {
        newErrors.identifier = "Please enter a valid email address";
        hasError = true;
      }
    } else {
      if (!mobileRegex.test(identifier)) {
        newErrors.identifier = "Please enter a valid 10-digit mobile number";
        hasError = true;
      }
    }

    if (!password) {
      newErrors.password = "Please enter a password";
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    // Dummy login logic utilizing API structure
    if (identifier === '9912345678' && password === '123456') {
      authApi.login(identifier).then(() => {
        login('mock-jwt-token-123', 'Sai Kumar');
        navigate('/');
      });
    } else if (identifier === 'admin@assure.com' && password === '123456') {
      authApi.login(identifier).then(() => {
        login('mock-jwt-token-admin', 'Admin User');
        navigate('/');
      });
    } else {
      alert('Invalid credentials. For testing, use 9912345678 and 123456');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="auth-input-group">
            <input
              type="text"
              className={`auth-input ${errors.identifier ? 'input-error' : ''}`}
              placeholder="Email or Mobile"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrors({ ...errors, identifier: '' });
              }}
              required
            />
            {errors.identifier && <span className="error-text">{errors.identifier}</span>}
          </div>

          <div className="auth-input-group">
            <input
              type={showPassword ? "text" : "password"}
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
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
            {errors.password && <span className="error-text">{errors.password}</span>}
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
