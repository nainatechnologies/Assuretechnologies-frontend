import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '../services/api';
import { loginUser } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Either mobile or email is required').refine(val => {
    const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
    const isMobile = /^[6-9]\d{9}$/.test(val);
    return isEmail || isMobile;
  }, 'Please provide a valid email address or a 10-digit mobile number'),
  password: z.string().min(1, 'Please provide your password')
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    
    // Determine if identifier is email or mobile
    const payload = data.identifier.includes('@') 
      ? { email: data.identifier, password: data.password } 
      : { mobile: data.identifier, password: data.password };

    try {
      const res = await API.post('/auth/customer/login', payload);
      if (res.data.success) {
        loginUser(res.data.data.user);
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
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach((e: any) => {
          if (e.field === 'email' || e.field === 'mobile') {
            setError('identifier', { type: 'server', message: e.message });
          }
          if (e.field === 'password') {
            setError('password', { type: 'server', message: e.message });
          }
        });
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Action Required: Please check your login details.',
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
    } finally {
      setLoading(false);
    }
  };

  const onError = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Action Required: Please check your login details.',
      showConfirmButton: false,
      timer: 3000
    });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        
        <form className="auth-form" onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <div className="auth-input-group">
            <input
              type="text"
              className={`auth-input ${errors.identifier ? 'input-error' : ''}`}
              placeholder="Email or Mobile"
              {...register('identifier')}
            />
            {errors.identifier && <span className="error-text">{errors.identifier.message}</span>}
          </div>

          <div className="auth-input-group">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className={`auth-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Password"
                {...register('password')}
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
            {errors.password && <span className="error-text">{errors.password.message}</span>}
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
