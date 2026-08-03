import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';
import { CAREERS_DATA, type JobListing } from '../data/careers';
import './CareersPage.css';

export function CareersPage() {
  // Group all jobs by department directly since filters are removed
  const groupedJobs = useMemo(() => {
    return CAREERS_DATA.reduce((acc, job) => {
      if (!acc[job.department]) {
        acc[job.department] = [];
      }
      acc[job.department].push(job);
      return acc;
    }, {} as Record<string, JobListing[]>);
  }, []);

  return (
    <div className="careers-container">
      <div className="careers-header">
        <h1>Open Positions at Assure Tech</h1>
      </div>

      <div className="careers-layout">
        <main className="careers-main">
          {Object.keys(groupedJobs).length === 0 ? (
            <div className="no-jobs-found">
              <p>No jobs found matching your criteria.</p>
            </div>
          ) : (
            Object.entries(groupedJobs).map(([dept, jobs]) => (
              <div key={dept} className="department-group">
                <h2 className="department-title">
                  {dept} <span className="job-count">{jobs.length} jobs</span>
                </h2>
                <div className="jobs-grid">
                  {jobs.map(job => (
                    <Link to={`/career/${job.id}`} key={job.id} className="job-card">
                      <div className="job-title">
                        {job.title}
                        <span className="job-posted">{job.postedDaysAgo} days ago</span>
                      </div>
                      <div className="job-details">
                        <span className="job-badge"><FaMapMarkerAlt /> {job.location}</span>
                        <span className="job-badge"><FaBriefcase /> {job.experience}</span>
                        <span className="job-badge"><FaClock /> {job.type}</span>
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
