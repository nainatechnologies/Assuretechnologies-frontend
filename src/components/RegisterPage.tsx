import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import API from '../services/api';
import { loginUser } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css'; // Reuse auth styles
import './RegisterPage.css';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    fullAddress: '',
    pincode: '',
    stateName: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    fullAddress: '',
    pincode: '',
    stateName: '',
    password: '',
    confirmPassword: '',
    termsAccepted: ''
  });
  
  const [otp, setOtp] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData({
      ...formData,
      [name]: isCheckbox ? checked : value
    });
    // Clear error for this field when typing
    setErrors({
      ...errors,
      [name]: ''
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
      stateName: '',
      password: '',
      confirmPassword: '',
      termsAccepted: ''
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

    if (!formData.stateName) {
      newErrors.stateName = "Please select a state";
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

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "Please accept the terms and conditions to register";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    setLoading(true);

    const payload = {
      full_name: formData.fullName,
      mobile: formData.mobileNumber,
      email: formData.emailAddress,
      full_address: formData.fullAddress,
      pincode: formData.pincode,
      state_name: formData.stateName,
      password: formData.password
    };

    API.post('/auth/customer/register', payload)
      .then((res) => {
        if (res.data.success) {
          // Backend returned success and customerId, time for OTP
          Swal.fire({
            title: 'OTP Sent',
            text: res.data.message || 'Please check your mobile for OTP.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            setStep(2); // Switch to OTP step
          });
        }
      })
      .catch((err) => {
        console.error('Register Error:', err);
        
        // Handle field-level validation errors from backend
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          const serverErrors = { ...newErrors }; // start with empty errors
          err.response.data.errors.forEach((e: any) => {
            if (e.field === 'mobile') serverErrors.mobileNumber = e.message;
            if (e.field === 'email') serverErrors.emailAddress = e.message;
            if (e.field === 'full_name') serverErrors.fullName = e.message;
            if (e.field === 'full_address') serverErrors.fullAddress = e.message;
            if (e.field === 'pincode') serverErrors.pincode = e.message;
            if (e.field === 'state_name') serverErrors.stateName = e.message;
            if (e.field === 'password') serverErrors.password = e.message;
          });
          setErrors(serverErrors);
          
          // Show a quick toast or let the inline errors do the talking
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Please fix the errors below',
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          // Fallback to standard popup for other server errors
          Swal.fire({
            title: 'Registration Failed',
            text: err.response?.data?.message || 'Server error',
            icon: 'error',
            confirmButtonColor: '#EF4444'
          });
        }
      })
      .finally(() => setLoading(false));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert('Invalid OTP format. Please enter a 6-digit OTP.');
      return;
    }
    
    API.post('/auth/customer/verify-otp', { mobile: formData.mobileNumber, otp })
      .then((res) => {
        if (res.data.success) {
          loginUser(res.data.data.user);
          login('auth-cookie-set', res.data.data.user.full_name || 'Customer');
          
          Swal.fire({
            title: 'Registration Complete!',
            text: 'You are now logged in.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/');
          });
        }
      })
      .catch((err) => {
        Swal.fire({
          title: 'OTP Verification Failed',
          text: err.response?.data?.message || 'Invalid OTP',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      });
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

            <div className="register-row">
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

              <div className="auth-input-group">
                <select
                  name="stateName"
                  className={`auth-input auth-select ${errors.stateName ? 'input-error' : ''}`}
                  value={formData.stateName}
                  onChange={handleInputChange as any}
                  required
                >
                  <option value="" disabled>Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                </select>
                {errors.stateName && <span className="error-text">{errors.stateName}</span>}
              </div>
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

            <div className="auth-checkbox-group">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  required
                />
                <span>I agree to the <a href="#" target="_blank" rel="noopener noreferrer">Terms and Conditions</a></span>
              </label>
              {errors.termsAccepted && <span className="error-text" style={{ display: 'block', marginTop: '4px' }}>{errors.termsAccepted}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
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
