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
  
  const [otp, setOtp] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
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
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="auth-input-group">
              <input
                type="text"
                name="fullName"
                className="auth-input"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="register-row">
              <div className="auth-input-group">
                <input
                  type="tel"
                  name="mobileNumber"
                  className="auth-input"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="auth-input-group">
                <input
                  type="email"
                  name="emailAddress"
                  className="auth-input"
                  placeholder="Email Address"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                name="fullAddress"
                className="auth-input"
                placeholder="Full Address"
                value={formData.fullAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                name="pincode"
                className="auth-input"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="register-row">
              <div className="auth-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="auth-input"
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
              </div>

              <div className="auth-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="auth-input"
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
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Register
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
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
