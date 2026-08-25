import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/customerApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import './EditProfilePage.css';

// Define the validation schema using Zod
const profileSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  mobile: z.string().optional(),
  email: z.string().optional(),
  full_address: z.string().min(10, 'Full address must be at least 10 characters'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  state_name: z.string().min(3, 'State must be at least 3 characters'),
});

// Infer TypeScript type from schema
type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      mobile: '',
      email: '',
      full_address: '',
      pincode: '',
      state_name: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        // Reset form with fetched data
        reset({
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
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: data.full_name,
        full_address: data.full_address,
        pincode: data.pincode,
        state_name: data.state_name
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Profile updated successfully!',
        confirmButtonColor: '#1d4ed8'
      }).then(() => {
        navigate('/profile');
      });
    } catch (error) {
      console.error('Failed to update profile', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to update profile. Please try again.',
        confirmButtonColor: '#1d4ed8'
      });
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

        <form className="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input type="text" autoComplete="none"
              id="full_name"
              {...register('full_name')}
              className={errors.full_name ? 'input-error' : ''}
            />
            {errors.full_name && <span className="error-text">{errors.full_name.message}</span>}
          </div>

          <div className="edit-profile-row">
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number (Read Only)</label>
              <input
                type="tel"
                id="mobile"
                {...register('mobile')}
                readOnly
                style={{ backgroundColor: "#e9ecef", color: "#6c757d", borderColor: "#dee2e6", cursor: "default" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address (Read Only)</label>
              <input type="email" autoComplete="none"
                id="email"
                {...register('email')}
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
                {...register('state_name')}
                className={errors.state_name ? 'input-error' : ''}
              />
              {errors.state_name && <span className="error-text">{errors.state_name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input type="text" autoComplete="none"
                id="pincode"
                {...register('pincode')}
                className={errors.pincode ? 'input-error' : ''}
              />
              {errors.pincode && <span className="error-text">{errors.pincode.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="full_address">Full Address</label>
            <textarea
              id="full_address"
              {...register('full_address')}
              className={errors.full_address ? 'input-error' : ''}
            />
            {errors.full_address && <span className="error-text">{errors.full_address.message}</span>}
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
