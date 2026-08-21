import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/customerApi';
import './EditProfilePage.css';

export function EditProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    email: '',
    full_address: '',
    pincode: '',
    state_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setFormData({
          full_name: data.full_name || '',
          mobile: data.mobile || '',
          email: data.email || '',
          full_address: data.full_address || '',
          pincode: data.pincode || '',
          state_name: data.state_name || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        full_address: formData.full_address,
        pincode: formData.pincode,
        state_name: formData.state_name
      });
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-container"><p>Loading profile...</p></div>;
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-profile-header">
          <h1>Edit Profile</h1>
          <p>Update your personal information</p>
        </div>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input type="text" autoComplete="none"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-profile-row">
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number (Read Only)</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                readOnly
                style={{ backgroundColor: "#e9ecef", color: "#6c757d", borderColor: "#dee2e6", cursor: "default" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address (Read Only)</label>
              <input type="email" autoComplete="none"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                style={{ backgroundColor: "#e9ecef", color: "#6c757d", borderColor: "#dee2e6", cursor: "default" }}
              />
            </div>
          </div>

          <div className="edit-profile-row">
            <div className="form-group">
              <label htmlFor="state_name">State</label>
              <input type="text" autoComplete="none"
                id="state_name"
                name="state_name"
                value={formData.state_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input type="text" autoComplete="none"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="full_address">Full Address</label>
            <textarea
              id="full_address"
              name="full_address"
              value={formData.full_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-profile-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/profile')} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






