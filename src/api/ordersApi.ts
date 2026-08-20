import axiosInstance from './axiosConfig';

export const ordersApi = {
  createOrder: async (orderData: any) => {
    return axiosInstance.post('/orders', orderData);
  },
  fetchOrderById: async (id: string) => {
    return axiosInstance.get(`/orders/${id}`);
  },
  fetchOrders: async () => {
    return axiosInstance.get('/orders');
  },
  cancelOrder: async (orderId: string) => {
    return axiosInstance.post(`/orders/${orderId}/cancel`);
  }
};
