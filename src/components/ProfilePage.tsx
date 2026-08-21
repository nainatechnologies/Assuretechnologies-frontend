import { useNavigate } from 'react-router-dom';
import { FaUserAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getProfile } from '../api/customerApi';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-page-container"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="profile-page-container"><p>Failed to load profile.</p></div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUserAlt />
          </div>
          <div className="profile-title-section">
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
          </div>
        </div>

        <form className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={user.full_name || ''} readOnly />
          </div>

          <div className="profile-row">
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" value={user.mobile || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user.email || ''} readOnly />
            </div>
          </div>

          <div className="profile-row">
            <div className="form-group">
              <label>State</label>
              <input type="text" value={user.state_name || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" value={user.pincode || ''} readOnly />
            </div>
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <textarea value={user.full_address || ''} readOnly />
          </div>
        </form>

        <div className="profile-actions">
          <button type="button" className="profile-edit-btn" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}


