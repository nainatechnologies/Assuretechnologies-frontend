import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import API from '../services/api';
import { loginUser } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    identifier: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { identifier: '', password: '' };
    setErrors(newErrors);

    setLoading(true);
    
    // Determine if identifier is email or mobile
    const payload = identifier.includes('@') 
      ? { email: identifier, password } 
      : { mobile: identifier, password };

    API.post('/auth/customer/login', payload)
      .then((res) => {
        if (res.data.success) {
          loginUser(res.data.data.user);
          // Optional: still call your React context if it relies on something
          login('auth-cookie-set', res.data.data.user.full_name || 'Customer');
          
          Swal.fire({
            title: 'Success!',
            text: 'Logged in successfully!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/');
          });
        }
      })
      .catch((err) => {
        console.error('Login Error:', err);
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          const serverErrors = { identifier: '', password: '' };
          err.response.data.errors.forEach((e: any) => {
            if (e.field === 'email' || e.field === 'mobile') serverErrors.identifier = e.message;
            if (e.field === 'password') serverErrors.password = e.message;
          });
          setErrors(serverErrors);
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Please fix the errors below',
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          Swal.fire({
            title: 'Login Failed',
            text: err.response?.data?.message || 'Invalid credentials',
            icon: 'error',
            confirmButtonColor: '#EF4444'
          });
        }
      })
      .finally(() => setLoading(false));
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

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register Now</Link>
        </div>
      </div>
    </div>
  );
}

