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
    await new Promise((resolve) => setTimeout(resolve, 800));
    // return axiosInstance.post(`/orders/${orderId}/cancel`);
    return { data: { success: true, message: 'Order cancelled successfully' } };
  }
};
