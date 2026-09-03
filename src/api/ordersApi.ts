import axiosInstance from './axiosConfig';

export const ordersApi = {
  createOrder: async (orderData: any) => {
    return axiosInstance.post('/orders', orderData);
  },
  fetchOrderById: async (id: string) => {
    return axiosInstance.get(`/orders/${id}`);
  },
  fetchOrders: async (params?: any) => {
    return axiosInstance.get('/orders', { params });
  },
  cancelOrder: async (orderId: string, payload?: { reason?: string }) => {
    return axiosInstance.post(`/orders/${orderId}/cancel`, payload || {});
  }
};
