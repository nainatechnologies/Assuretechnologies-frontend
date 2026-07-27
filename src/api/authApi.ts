import axiosInstance from './axiosConfig';

export const authApi = {
  login: async (identifier: string) => {
    // Mocking an API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // For now, return mock success. When backend is ready:
    // return axiosInstance.post('/auth/login', { identifier });
    return { data: { success: true, message: 'OTP sent' } };
  },

  verifyOtp: async (identifier: string, otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // return axiosInstance.post('/auth/verify-otp', { identifier, otp });
    return { 
      data: { 
        success: true, 
        token: 'mock-jwt-token-12345',
        user: { name: 'Sai Kumar', email: 'sai@example.com' }
      } 
    };
  },

  register: async (userData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // return axiosInstance.post('/auth/register', userData);
    return { data: { success: true, message: 'Registration successful' } };
  }
};
