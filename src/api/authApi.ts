export const authApi = {
  login: async (_identifier: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { data: { success: true, message: 'OTP sent' } };
  },

  verifyOtp: async (_identifier: string, _otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { 
      data: { 
        success: true, 
        token: 'mock-jwt-token-12345',
        user: { name: 'Sai Kumar', email: 'sai@example.com' }
      } 
    };
  },

  register: async (_userData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { success: true, message: 'Registration successful' } };
  }
};
