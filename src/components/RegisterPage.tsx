import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css'; // Reuse auth styles
import './RegisterPage.css';

export function RegisterPage({ setIsLoggedIn }: { setIsLoggedIn?: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    fullAddress: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    fullAddress: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });
  
  const [otp, setOtp] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when typing
    setErrors({
      ...errors,
      [e.target.name]: ''
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      fullName: '',
      mobileNumber: '',
      emailAddress: '',
      fullAddress: '',
      pincode: '',
      password: '',
      confirmPassword: ''
    };
    let hasError = false;

    if (!/^[a-zA-Z\s]{5,50}$/.test(formData.fullName.trim())) {
      newErrors.fullName = "Letters and spaces only (5-50 chars)";
      hasError = true;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Must be a valid 10-digit number";
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      newErrors.emailAddress = "Please enter a valid email address";
      hasError = true;
    }

    if (formData.fullAddress.trim().length < 5) {
      newErrors.fullAddress = "Address must be at least 5 characters long";
      hasError = true;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Must be a 6-digit Pincode";
      hasError = true;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Must be at least 6 characters long";
      hasError = true;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    // Move to OTP step
    setStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      alert('Registration successful!');
      if (setIsLoggedIn) setIsLoggedIn(true);
      navigate('/profile');
    } else {
      alert('Invalid OTP. Please enter 123456');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">{step === 1 ? 'Register' : 'Verify Mobile Number'}</h2>
        
        {step === 1 && (
          <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
            <div className="auth-input-group">
              <input
                type="text"
                name="fullName"
                className={`auth-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                maxLength={50}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>
            
            <div className="register-row">
              <div className="auth-input-group">
                <input
                  type="tel"
                  name="mobileNumber"
                  className={`auth-input ${errors.mobileNumber ? 'input-error' : ''}`}
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                />
                {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
              </div>
              <div className="auth-input-group">
                <input
                  type="email"
                  name="emailAddress"
                  className={`auth-input ${errors.emailAddress ? 'input-error' : ''}`}
                  placeholder="Email Address"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  required
                />
                {errors.emailAddress && <span className="error-text">{errors.emailAddress}</span>}
              </div>
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                name="fullAddress"
                className={`auth-input ${errors.fullAddress ? 'input-error' : ''}`}
                placeholder="Full Address"
                value={formData.fullAddress}
                onChange={handleInputChange}
                required
                minLength={5}
                maxLength={200}
              />
              {errors.fullAddress && <span className="error-text">{errors.fullAddress}</span>}
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                name="pincode"
                className={`auth-input ${errors.pincode ? 'input-error' : ''}`}
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                maxLength={6}
              />
              {errors.pincode && <span className="error-text">{errors.pincode}</span>}
            </div>

            <div className="register-row">
              <div className="auth-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`auth-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="auth-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`auth-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
            </div>

            <button type="submit" className="auth-submit-btn">
              Register
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
            <p className="otp-message">
              Please enter the OTP sent to <strong>{formData.mobileNumber}</strong>
            </p>

            <div className="auth-input-group">
              <input
                type="text"
                className="auth-input"
                placeholder="Enter OTP (Use 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Verify & Register
            </button>

            <div className="auth-resend">
              Didn't receive code? 
              <button type="button" onClick={() => alert('OTP Resent! (Use 123456)')}>
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
