import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  // 1: Enter Email/Mobile
  // 2: Enter OTP
  // 3: Enter New Password

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
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    const newErrors = { ...errors, identifier: '' };

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

    setErrors(newErrors);

    if (hasError) return;

    // Simulate sending OTP
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp === '123456') {
      setStep(3);
    } else {
      setErrors({ ...errors, otp: 'Invalid OTP. Please enter 123456' });
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    const newErrors = { ...errors, newPassword: '', confirmPassword: '' };

    if (!newPassword) {
      newErrors.newPassword = "Please enter a password";
      hasError = true;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    alert('Password reset successfully!');
    navigate('/login');
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
            <h2 className="auth-title">Verify OTP</h2>
            <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
              <p className="otp-message">
                Please enter the OTP sent to <strong>{identifier}</strong>
              </p>

              <div className="auth-input-group">
                <input
                  type="text"
                  className={`auth-input ${errors.otp ? 'input-error' : ''}`}
                  placeholder="Enter OTP (Use 123456)"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    clearError('otp');
                  }}
                  required
                />
                {errors.otp && <span className="error-text">{errors.otp}</span>}
              </div>

              <button type="submit" className="auth-submit-btn">
                Verify OTP
              </button>

              <div className="auth-resend">
                Didn't receive code? 
                <button type="button" onClick={() => alert('OTP Resent! (Use 123456)')}>
                  Resend OTP
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <form className="auth-form" onSubmit={handleResetPassword} noValidate>
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
