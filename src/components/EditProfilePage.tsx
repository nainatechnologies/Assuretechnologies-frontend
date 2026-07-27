import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfilePage.css';

export function EditProfilePage() {
  const navigate = useNavigate();

  // Initialize with dummy data matching the Profile page
  const [formData, setFormData] = useState({
    fullName: 'Sai Kumar',
    mobileNumber: '9912345678',
    emailAddress: 'john.doe@example.com',
    fullAddress: '123 Tech Park, Innovation Hub',
    pincode: '500081'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here to save the changes
    alert('Profile updated successfully!');
    navigate('/profile');
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-profile-header">
          <h1>Edit Profile</h1>
          <p>Update your personal information</p>
        </div>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-profile-row">
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="emailAddress">Email Address</label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="edit-profile-row">
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullAddress">Full Address</label>
            <textarea
              id="fullAddress"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-profile-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/profile')}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
