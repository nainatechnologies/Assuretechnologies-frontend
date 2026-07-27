import { useNavigate } from 'react-router-dom';
import { FaUserAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const { userName } = useAuth();

  // Dummy user data based on registration fields
  const user = {
    fullName: userName || 'Sai Kumar',
    mobileNumber: '9912345678',
    emailAddress: 'john.doe@example.com',
    fullAddress: '123 Tech Park, Innovation Hub',
    pincode: '500081'
  };

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
            <input type="text" value={user.fullName} disabled />
          </div>

          <div className="profile-row">
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" value={user.mobileNumber} disabled />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user.emailAddress} disabled />
            </div>
          </div>

          <div className="profile-row">
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" value={user.pincode} disabled />
            </div>
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <textarea value={user.fullAddress} disabled />
          </div>
        </form>

        <div className="profile-actions">
          <button className="profile-edit-btn" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
