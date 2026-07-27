import axiosInstance from './axiosConfig';

export const ordersApi = {
  fetchOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // return axiosInstance.get('/orders');
    return { data: [
      {
        id: 'ORD-2023-0891',
        date: 'July 15, 2026',
        total: '₹16,500',
        shipTo: 'Shyam Matam',
        type: 'product',
        status: 'Delivered',
        items: [
          {
            name: '4K Security Camera',
            qty: 2,
            image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80',
            returnStatus: 'Warranty valid until 15 July 2027',
          }
        ]
      },
      {
        id: 'SRV-2023-0442',
        date: 'July 20, 2026',
        total: '₹2,300',
        shipTo: 'Shyam Matam',
        type: 'service',
        status: 'Pending',
        items: [
          {
            name: 'CCTV Installation Service',
            qty: 1,
            image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
            returnStatus: 'Service scheduled for 25 July 2026',
          }
        ]
      },
      {
        id: 'SRV-2023-0555',
        date: 'July 22, 2026',
        total: '₹1,500',
        shipTo: 'Shyam Matam',
        type: 'service',
        status: 'Awaiting Approval',
        items: [
          {
            name: 'Plumbing Repair',
            qty: 1,
            image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80',
            returnStatus: 'Work completed by technician',
          }
        ]
      },
      {
        id: 'ORD-2023-0102',
        date: 'June 05, 2026',
        total: '₹8,999',
        shipTo: 'Shyam Matam',
        type: 'product',
        status: 'Processing',
        items: [
          {
            name: 'Biometric Access Control System',
            qty: 1,
            image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
            returnStatus: 'Warranty valid until 05 June 2027',
          }
        ]
      }
    ] };
  },

  cancelOrder: async (orderId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // return axiosInstance.post(`/orders/${orderId}/cancel`);
    return { data: { success: true, message: 'Order cancelled successfully' } };
  }
};
