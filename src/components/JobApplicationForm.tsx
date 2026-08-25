import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import './JobApplicationForm.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

const applicationSchema = z.object({
  applicantName: z.string().min(3, 'Full name must be at least 3 characters').max(200, 'Name too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
  dob: z.string().optional(),
  experience: z.string().optional(),
  currentSalary: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number (e.g. 5, 8.5)').optional().or(z.literal('')),
  expectedSalary: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid number (e.g. 5, 8.5)').optional().or(z.literal('')),
  availableToJoin: z.string().optional(),
  preferredLocation: z.string().optional(),
  currentLocation: z.string().optional(),
  skills: z.string().optional(),
  privacyPolicy: z.boolean().refine(val => val === true, { message: 'You must accept the Privacy Policy to proceed.' }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export function JobApplicationForm() {
  const { jobCode } = useParams<{ jobCode: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(selected.type)) {
        setFileError('Only PDF or DOCX files are allowed.');
        setFile(null);
        return;
      }
      setFileError(null);
      if (selected.size > 10 * 1024 * 1024) { setFileError('File size exceeds the 10MB limit.'); setFile(null); return; }
      setFile(selected);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!file) {
      setFileError('Please upload your resume.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', jobCode!);
      formData.append('applicantName', data.applicantName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.gender) formData.append('gender', data.gender);
      if (data.dob) formData.append('dob', data.dob);
      if (data.experience) formData.append('experience', data.experience);
      if (data.currentSalary) formData.append('currentSalary', data.currentSalary);
      if (data.expectedSalary) formData.append('expectedSalary', data.expectedSalary);
      if (data.availableToJoin) formData.append('availableToJoin', data.availableToJoin);
      if (data.preferredLocation) formData.append('preferredLocation', data.preferredLocation);
      if (data.currentLocation) formData.append('currentLocation', data.currentLocation);
      if (data.skills) formData.append('skills', data.skills);
      formData.append('resume', file);

      await axios.post(`${API_BASE}/career/jobs/${jobCode}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Your application has been successfully submitted. We will be in touch soon.',
        confirmButtonColor: '#0076A8',
        timer: 3000,
        timerProgressBar: true,
      });
      navigate(`/career/jobdetails/${jobCode}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: msg,
        confirmButtonColor: '#0076A8',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onError = () => {
    if (!file) {
      setFileError('Please upload your resume.');
    }
    Swal.fire({
      icon: 'warning',
      title: 'Action Required',
      text: 'Please complete all required fields correctly.',
      confirmButtonColor: '#0076A8',
    });
  };

  return (
    <div className="application-page-container">
      <div className="application-form-container">
        <div className="application-header">
          <Link to={`/career/jobdetails/${jobCode}`} className="back-link">
            <FaArrowLeft /> Back to Job Details
          </Link>
          <h2>Submit Your Application</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="job-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="applicantName">Full Name *</label>
              <input type="text" id="applicantName" {...register('applicantName')}  className={errors.applicantName ? 'input-error' : ''} />
              {errors.applicantName && <span className="error-text">{errors.applicantName.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input type="tel" id="phone" {...register('phone')} maxLength={10}  className={errors.phone ? 'input-error' : ''} />
              {errors.phone && <span className="error-text">{errors.phone.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input type="email" id="email" {...register('email')}  className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" {...register('gender')} className={errors.gender ? 'input-error' : ''}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input type="date" id="dob" {...register('dob')}  className={errors.dob ? 'input-error' : ''} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience">Experience</label>
              <select id="experience" {...register('experience')} className={errors.experience ? 'input-error' : ''}>
                <option value="">Select Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="availableToJoin">Available to Join</label>
              <select id="availableToJoin" {...register('availableToJoin')} className={errors.availableToJoin ? 'input-error' : ''}>
                <option value="">Select Notice Period</option>
                <option value="Immediate">Immediate</option>
                <option value="15 Days">15 Days</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months+">3 Months+</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentSalary">Current Salary (LPA)</label>
              <input type="text" id="currentSalary" placeholder="e.g. 5" {...register('currentSalary')}  className={errors.currentSalary ? 'input-error' : ''} />
            </div>
            <div className="form-group">
              <label htmlFor="expectedSalary">Expected Salary (LPA)</label>
              <input type="text" id="expectedSalary" placeholder="e.g. 8" {...register('expectedSalary')}  className={errors.expectedSalary ? 'input-error' : ''} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredLocation">Preferred Location</label>
              <select id="preferredLocation" {...register('preferredLocation')} className={errors.preferredLocation ? 'input-error' : ''}>
                <option value="">Select Location</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Amaravathi">Amaravathi</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="currentLocation">Current Location</label>
              <input type="text" id="currentLocation" placeholder="City, State" {...register('currentLocation')}  className={errors.currentLocation ? 'input-error' : ''} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <input type="text" id="skills" placeholder="React, Node.js, Marketing, etc." {...register('skills')}  className={errors.skills ? 'input-error' : ''} />
          </div>

          <div className="form-group">
            <label>Upload Resume (PDF, DOCX - Max 10MB) *</label>
            <label htmlFor="resume" className={`custom-file-upload ${fileError ? 'input-error' : ''}`}>
              <span style={{ color: fileError ? '#ef4444' : 'inherit' }}>{file ? 'Change Resume' : 'Choose Resume'}</span>
            </label>
            <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            {file && <div className="file-name">Selected: {file.name}</div>}
            {fileError && <span className="error-text">{fileError}</span>}
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" id="privacyPolicy" {...register('privacyPolicy')} />
            <label htmlFor="privacyPolicy">I agree to the Privacy Policy and consent to the processing of my personal data. *</label>
            {errors.privacyPolicy && <span className="error-text" style={{ display: 'block', marginTop: '4px' }}>{errors.privacyPolicy.message}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(`/career/jobdetails/${jobCode}`)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




