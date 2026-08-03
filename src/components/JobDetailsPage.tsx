import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';
import { CAREERS_DATA, type JobListing } from '../data/careers';
import './JobDetailsPage.css';

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListing | null>(null);

  useEffect(() => {
    const foundJob = CAREERS_DATA.find(j => j.id === id);
    if (foundJob) {
      setJob(foundJob);
    }
  }, [id]);

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
    <div className="job-details-page">
      <div className="job-hero">
        <div className="job-hero-inner">
          <h1>{job.title}</h1>
          <div className="job-hero-meta">
            <span className="meta-icon-item"><FaBriefcase /> {job.experience}</span>
            <span className="meta-icon-item"><FaMapMarkerAlt /> {job.location}</span>
            <span className="meta-icon-item"><FaClock /> {job.type}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="job-content-layout">
        
        {/* Left Column: Details */}
        <div className="job-description-section">
          <div className="job-quick-facts">
            <p><strong>Job Description – {job.title}</strong></p>
            <p><strong>Experience:</strong> {job.experience}</p>
            <p><strong>Industry:</strong> {job.industry}</p>
            <p><strong>Employment Type:</strong> {job.type}</p>
            <p><strong>Location:</strong> Work From Office – {job.location}</p>
          </div>

          <h3 className="job-section-title">Job Overview</h3>
          <p>{job.overview}</p>

          <h3 className="job-section-title">Key Responsibilities</h3>
          <ul>
            {job.responsibilities.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Right Column: Sidebar */}
        <div className="job-sidebar">
          <button className="btn-apply-large" onClick={() => navigate(`/career/${job.id}/apply`)}>
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
