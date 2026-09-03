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
import './LoginPage.css'; // Reuse auth styles
import './RegisterPage.css';
import { Toast } from '../utils/errorHandler';
import { StateSelect } from './StateSelect';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters long').regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  emailAddress: z.string().email('Please provide a valid email address').max(254, 'Email is too long'),
  fullAddress: z.string().min(5, 'Address must be at least 5 characters long'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  stateName: z.string().min(2, 'State name is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must be at most 72 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
});

type OtpFormValues = z.infer<typeof otpSchema>;

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: OTP
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredMobile, setRegisteredMobile] = useState('');
  
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    setError: setRegisterError,
    setValue: setRegisterValue,
    watch: watchRegister,
    clearErrors: clearRegisterErrors,
    formState: { errors: registerErrors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      emailAddress: '',
      fullAddress: '',
      pincode: '',
      stateName: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    }
  });

  const selectedState = watchRegister('stateName');

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors }
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  });

  const onRegisterSubmit = (data: RegisterFormValues) => {
    setLoading(true);

    const payload = {
      full_name: data.fullName,
      mobile: data.mobileNumber,
      email: data.emailAddress,
      full_address: data.fullAddress,
      pincode: data.pincode,
      state_name: data.stateName,
      password: data.password
    };

    API.post('/auth/customer/register', payload)
      .then((res) => {
        if (res.data.success) {
          setRegisteredMobile(data.mobileNumber);
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
          err.response.data.errors.forEach((e: any) => {
            if (e.field === 'mobile') setRegisterError('mobileNumber', { message: e.message });
            if (e.field === 'email') setRegisterError('emailAddress', { message: e.message });
            if (e.field === 'full_name') setRegisterError('fullName', { message: e.message });
            if (e.field === 'full_address') setRegisterError('fullAddress', { message: e.message });
            if (e.field === 'pincode') setRegisterError('pincode', { message: e.message });
            if (e.field === 'state_name') setRegisterError('stateName', { message: e.message });
            if (e.field === 'password') setRegisterError('password', { message: e.message });
          });
          
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
            title: 'Registration Failed',
            text: err.response?.data?.message || 'Server error',
            icon: 'error',
            confirmButtonColor: '#EF4444'
          });
        }
      })
      .finally(() => setLoading(false));
  };

  const onOtpSubmit = (data: OtpFormValues) => {
    API.post('/auth/customer/verify-otp', { mobile: registeredMobile, otp: data.otp })
      .then((res) => {
        if (res.data.success) {
          loginUser(res.data.data.user);
          login(res.data.data.token || 'customer-session', res.data.data.user.full_name || 'Customer');
          
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
          <form className="auth-form" onSubmit={handleRegisterSubmit(onRegisterSubmit)} noValidate>
            <div className="auth-input-group">
              <input
                type="text"
                className={`auth-input ${registerErrors.fullName ? 'input-error' : ''}`}
                placeholder="Full Name"
                {...registerForm('fullName')}
                maxLength={50}
              />
              {registerErrors.fullName && <span className="error-text">{registerErrors.fullName.message}</span>}
            </div>
            
            <div className="register-row">
              <div className="auth-input-group">
                <input
                  type="tel"
                  className={`auth-input ${registerErrors.mobileNumber ? 'input-error' : ''}`}
                  placeholder="Mobile Number"
                  {...registerForm('mobileNumber')}
                  maxLength={10}
                />
                {registerErrors.mobileNumber && <span className="error-text">{registerErrors.mobileNumber.message}</span>}
              </div>
              <div className="auth-input-group">
                <input
                  type="email"
                  className={`auth-input ${registerErrors.emailAddress ? 'input-error' : ''}`}
                  placeholder="Email Address"
                  {...registerForm('emailAddress')}
                />
                {registerErrors.emailAddress && <span className="error-text">{registerErrors.emailAddress.message}</span>}
              </div>
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                className={`auth-input ${registerErrors.fullAddress ? 'input-error' : ''}`}
                placeholder="Full Address"
                {...registerForm('fullAddress')}
                maxLength={200}
              />
              {registerErrors.fullAddress && <span className="error-text">{registerErrors.fullAddress.message}</span>}
            </div>

            <div className="register-row">
              <div className="auth-input-group">
                <input
                  type="text"
                  className={`auth-input ${registerErrors.pincode ? 'input-error' : ''}`}
                  placeholder="Pincode"
                  {...registerForm('pincode')}
                  maxLength={6}
                />
                {registerErrors.pincode && <span className="error-text">{registerErrors.pincode.message}</span>}
              </div>

              <div className="auth-input-group">
                <StateSelect
                  value={selectedState}
                  onChange={(val) => {
                    setRegisterValue('stateName', val, { shouldValidate: true });
                    if (val) clearRegisterErrors('stateName');
                  }}
                  error={Boolean(registerErrors.stateName)}
                  placeholder="Select State"
                />
                {registerErrors.stateName && <span className="error-text">{registerErrors.stateName.message}</span>}
              </div>
            </div>

            <div className="register-row">
              <div className="auth-input-group">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`auth-input ${registerErrors.password ? 'input-error' : ''}`}
                    placeholder="Password"
                    {...registerForm('password')}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', lineHeight: '1.2' }}>
                  Must be 8-72 chars, with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                </div>
                {registerErrors.password && <span className="error-text">{registerErrors.password.message}</span>}
              </div>

              <div className="auth-input-group">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`auth-input ${registerErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm Password"
                    {...registerForm('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {registerErrors.confirmPassword && <span className="error-text">{registerErrors.confirmPassword.message}</span>}
              </div>
            </div>

            <div className="auth-checkbox-group">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  {...registerForm('termsAccepted')}
                />
                <span>I agree to the <a href="#" target="_blank" rel="noopener noreferrer">Terms and Conditions</a></span>
              </label>
              {registerErrors.termsAccepted && <span className="error-text" style={{ display: 'block', marginTop: '4px' }}>{registerErrors.termsAccepted.message}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleOtpSubmit(onOtpSubmit)} noValidate>
            <p className="otp-message">
              Please enter the OTP sent to <strong>{registeredMobile}</strong>
            </p>

            <div className="auth-input-group">
              <input
                type="text"
                className={`auth-input ${otpErrors.otp ? 'input-error' : ''}`}
                placeholder="Enter OTP (Use 123456)"
                {...registerOtp('otp')}
              />
              {otpErrors.otp && <span className="error-text">{otpErrors.otp.message}</span>}
            </div>

            <button type="submit" className="auth-submit-btn">
              Verify & Register
            </button>

            <div className="auth-resend">
              Didn't receive code? 
              <button type="button" onClick={() => Toast.fire({ icon: 'info', title: 'OTP Resent! (Use 123456)' })}>
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
