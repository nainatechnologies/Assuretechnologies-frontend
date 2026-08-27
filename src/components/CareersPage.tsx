import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';
import axios from 'axios';
import './CareersPage.css';

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
  createdAt: string;
}

export function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/career/jobs`)
      .then(res => {
        setJobs(res.data.data || []);
      })
      .catch(() => {
        setError('Failed to load job postings. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedJobs = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const dept = job.industry || 'General';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(job);
      return acc;
    }, {} as Record<string, JobPosting[]>);
  }, [jobs]);

  if (loading) return <div className="careers-container"><div className="careers-header"><p>Loading jobs...</p></div></div>;
  if (error) return <div className="careers-container"><div className="careers-header"><p style={{ color: 'red' }}>{error}</p></div></div>;

  return (
    <div className="careers-container">
      <div className="careers-header">
        <h1>Open Positions at Assure Tech</h1>
      </div>

      <div className="careers-layout">
        <main className="careers-main">
          {jobs.length === 0 ? (
            <div className="no-jobs-found">
              <p>No open positions at the moment. Check back soon!</p>
            </div>
          ) : (
            Object.entries(groupedJobs).map(([dept, deptJobs]) => (
              <div key={dept} className="department-group">
                <h2 className="department-title">
                  {dept} <span className="job-count">{deptJobs.length} jobs</span>
                </h2>
                <div className="jobs-grid">
                  {deptJobs.map(job => (
                    <Link to={`/career/jobdetails/${(job as any).jobCode || job.id}`} key={job.id} className="job-card">
                      <div className="job-title">
                        {job.title}
                        <span className="job-posted">
                          {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      <div className="job-details">
                        {job.location && <span className="job-badge"><FaMapMarkerAlt /> {job.location}</span>}
                        {job.experience && <span className="job-badge"><FaBriefcase /> {job.experience}</span>}
                        {job.employmentType && <span className="job-badge"><FaClock /> {job.employmentType}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
