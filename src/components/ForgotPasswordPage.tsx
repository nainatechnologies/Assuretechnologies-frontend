import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import API from '../services/api';
import { Toast } from '../utils/errorHandler';
import './LoginPage.css';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { ...errors, identifier: '' };
    setErrors(newErrors);

    const isMobile = /^\d+$/.test(identifier);
    const payload = isMobile ? { mobile: identifier } : { email: identifier };

    API.post('/auth/customer/forgot-password', payload)
      .then((res) => {
        if (res.data.success) {
          Swal.fire({
            title: 'OTP Sent',
            text: res.data.message || 'Please check your mobile.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            setStep(2);
          });
        }
      })
      .catch((err) => {
        console.error('Forgot Password Error:', err);
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          const serverErrors = { ...errors, identifier: '' };
          err.response.data.errors.forEach((e: any) => {
            if (e.field === 'email' || e.field === 'mobile') serverErrors.identifier = e.message;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ ...errors, identifier: err.response?.data?.message || 'Error sending OTP' });
        }
      });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors, newPassword: '', confirmPassword: '', otp: '' };

    if (!otp || otp.length < 5) {
      newErrors.otp = 'Please enter a valid OTP';
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const isMobile = /^\d+$/.test(identifier);
    const payload = isMobile ? { mobile: identifier, otp, newPassword } : { email: identifier, otp, newPassword };

    API.post('/auth/customer/reset-password', payload)
      .then((res) => {
        if (res.data.success) {
          Swal.fire({
            title: 'Success!',
            text: 'Password reset successfully!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/login');
          });
        }
      })
      .catch((err) => {
        console.error('Reset Password Error:', err);
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          const serverErrors = { ...errors, newPassword: '', otp: '' };
          err.response.data.errors.forEach((e: any) => {
            if (e.field === 'newPassword') serverErrors.newPassword = e.message;
            if (e.field === 'otp') serverErrors.otp = e.message;
          });
          setErrors(serverErrors);
        } else {
          Swal.fire({
            title: 'Reset Failed',
            text: err.response?.data?.message || 'Failed to reset password',
            icon: 'error',
            confirmButtonColor: '#EF4444'
          });
        }
      });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">

        {step === 1 && (
          <>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="otp-message">
              Enter your mobile number or email address to receive an OTP.
            </p>
            <form className="auth-form" onSubmit={handleSendOtp} noValidate>
              <div className="auth-input-group">
                <input
                  type="text"
                  className={`auth-input ${errors.identifier ? 'input-error' : ''}`}
                  placeholder="Email or Mobile"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearError('identifier');
                  }}
                  required
                />
                {errors.identifier && <span className="error-text">{errors.identifier}</span>}
              </div>

              <button type="submit" className="auth-submit-btn">
                Send OTP
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <form className="auth-form" onSubmit={handleResetPassword} noValidate>

              <div className="auth-input-group">
                <input
                  type="text"
                  className={`auth-input ${errors.otp ? 'input-error' : ''}`}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    clearError('otp');
                  }}
                  required
                />
                {errors.otp && <span className="error-text">{errors.otp}</span>}
              </div>

              <div className="auth-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`auth-input ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearError('newPassword');
                  }}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
              </div>

              <div className="auth-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`auth-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="auth-submit-btn">
                Reset Password
              </button>

              <div className="auth-resend">
                Didn't receive code?
                <button type="button" onClick={() => Toast.fire({ icon: 'info', title: 'OTP Resent!' })}>
                  Resend OTP
                </button>
              </div>

            </form>
          </>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
