import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { CAREERS_DATA, type JobListing } from '../data/careers';
import './JobApplicationForm.css';

export function JobApplicationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListing | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    experience: '',
    currentSalary: '',
    expectedSalary: '',
    availableToJoin: '',
    preferredLocation: '',
    currentLocation: '',
    skills: '',
    privacyPolicy: false
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const foundJob = CAREERS_DATA.find(j => j.id === id);
    if (foundJob) {
      setJob(foundJob);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if required fields are filled (HTML5 required attribute handles most, but we can do a manual check for SweetAlert)
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'gender', 'dob',
      'experience', 'currentSalary', 'expectedSalary', 'availableToJoin',
      'preferredLocation', 'currentLocation', 'skills'
    ];

    const isAnyEmpty = requiredFields.some(field => !formData[field as keyof typeof formData]);

    if (isAnyEmpty || !file || !formData.privacyPolicy) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all the required fields and accept the privacy policy!',
        confirmButtonColor: '#0076A8'
      });
      return;
    }

    // Simulate API call
    console.log("Submitting application for", job?.title);

    Swal.fire({
      icon: 'success',
      title: 'Application Submitted!',
      text: 'Your application has been successfully submitted.',
      confirmButtonColor: '#0076A8',
      timer: 3000,
      timerProgressBar: true
    }).then(() => {
      navigate(`/career/${id}`);
    });
  };

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Job not found</h2>
        <button onClick={() => navigate('/career')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Back to Careers
        </button>
      </div>
    );
  }

  return (
    <div className="application-page-container">
      <div className="application-form-container">
        <div className="application-header">
          <Link to={`/career/${id}`} className="back-link">
            <FaArrowLeft /> Back to Job Details
          </Link>
          <h2>Apply for {job.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input type="text" id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input type="text" id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select id="gender" name="gender" required value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth *</label>
              <input type="date" id="dob" name="dob" required value={formData.dob} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience">Experience *</label>
              <select id="experience" name="experience" required value={formData.experience} onChange={handleChange}>
                <option value="">Select Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="availableToJoin">Available to Join *</label>
              <select id="availableToJoin" name="availableToJoin" required value={formData.availableToJoin} onChange={handleChange}>
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
              <label htmlFor="currentSalary">Current Salary (LPA) *</label>
              <input type="number" id="currentSalary" name="currentSalary" placeholder="e.g. 5" required value={formData.currentSalary} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="expectedSalary">Expected Salary (LPA) *</label>
              <input type="number" id="expectedSalary" name="expectedSalary" placeholder="e.g. 8" required value={formData.expectedSalary} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredLocation">Preferred Location *</label>
              <select id="preferredLocation" name="preferredLocation" required value={formData.preferredLocation} onChange={handleChange}>
                <option value="">Select Location</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Amaravathi">Amaravathi</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="currentLocation">Current Location *</label>
              <input type="text" id="currentLocation" name="currentLocation" placeholder="City, State" required value={formData.currentLocation} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills *</label>
            <input type="text" id="skills" name="skills" placeholder="React, Node.js, Marketing, etc." required value={formData.skills} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Upload Resume (PDF, DOCX) *</label>
            <label htmlFor="resume" className="custom-file-upload">
              {file ? 'Change File' : 'Choose File'}
            </label>
            <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required onChange={handleFileChange} />
            {file && <div className="file-name">Selected: {file.name}</div>}
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="privacyPolicy"
              name="privacyPolicy"
              required
              checked={formData.privacyPolicy}
              onChange={handleChange}
            />
            <label htmlFor="privacyPolicy">I agree to the Privacy Policy and consent to the processing of my personal data. *</label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(`/career/${id}`)}>Cancel</button>
            <button type="submit" className="btn-submit">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
}
