import axiosInstance from './axiosConfig';

export const getProfile = async () => {
  const response = await axiosInstance.get('/customer/profile');
  return response.data;
};

export const updateProfile = async (profileData: any) => {
  const response = await axiosInstance.put('/customer/profile', profileData);
  return response.data;
};

