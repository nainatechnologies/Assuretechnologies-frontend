import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';
import axios from 'axios';
import './JobDetailsPage.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

interface JobPosting {
  id: string;
  title: string;
  overview?: string;
  description?: string;
  experience?: string;
  industry?: string;
  employmentType?: string;
  location?: string;
  responsibilities?: string;
  skills?: string;
  postedDate?: string;
}

export function JobDetailsPage() {
  const { jobCode } = useParams<{ jobCode: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!jobCode) return;
    axios.get(`${API_BASE}/career/jobs/${jobCode}`)
      .then(res => {
        setJob(res.data.data);
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [jobCode]);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p>Loading...</p></div>;

  if (notFound || !job) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Job not found</h2>
        <button onClick={() => navigate('/career')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Back to Careers
        </button>
      </div>
    );
  }

  const responsibilities = job.responsibilities
    ? job.responsibilities.split('\n').filter(r => r.trim())
    : [];

  return (
    <div className="job-details-page">
      <div className="job-hero">
        <div className="job-hero-inner">
          <h1>{job.title}</h1>
          <div className="job-hero-meta">
            {job.experience && <span className="meta-icon-item"><FaBriefcase /> {job.experience}</span>}
            {job.location && <span className="meta-icon-item"><FaMapMarkerAlt /> {job.location}</span>}
            {job.employmentType && <span className="meta-icon-item"><FaClock /> {job.employmentType}</span>}
          </div>
        </div>
      </div>

      <div className="job-content-layout">
        <div className="job-description-section">
          <div className="job-quick-facts">
            <p><strong>Job Description - {job.title}</strong></p>
            {job.experience && <p><strong>Experience:</strong> {job.experience}</p>}
            {job.industry && <p><strong>Industry:</strong> {job.industry}</p>}
            {job.employmentType && <p><strong>Employment Type:</strong> {job.employmentType}</p>}
            {job.location && <p><strong>Location:</strong> Work From Office - {job.location}</p>}
          </div>

          {job.overview && (
            <>
              <h3 className="job-section-title">Job Overview</h3>
              <p>{job.overview}</p>
            </>
          )}

          {job.description && (
            <>
              <h3 className="job-section-title">Full Description</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
            </>
          )}

          {responsibilities.length > 0 && (
            <>
              <h3 className="job-section-title">Key Responsibilities</h3>
              <ul>
                {responsibilities.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </>
          )}

          {job.skills && (
            <>
              <h3 className="job-section-title">Required Skills</h3>
              <p>{job.skills}</p>
            </>
          )}
        </div>

        <div className="job-sidebar">
          <button className="btn-apply-large" onClick={() => navigate(`/career/jobdetails/${jobCode}/apply`)}>
            Apply for this job
          </button>
          <Link to="/career" className="view-all-link">
            View all job openings
          </Link>
        </div>
      </div>
    </div>
  );
}
