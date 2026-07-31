import axiosInstance from './axiosConfig';

export const ordersApi = {
  fetchOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // return axiosInstance.get('/orders');
    return {
      data: [
        {
          id: 'ORD-2026-0001',
          date: 'July 25, 2026',
          total: '₹50,000',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Accepted',
          transportName: 'Blue Dart',
          trackingId: 'BD111111',
          items: [
            {
              name: 'Biometric Access Control System',
              qty: 30,
              image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
              returnStatus: 'Order is being packed',
              vendor: 'Vendor A'
            }
          ]
        },
        {
          id: 'ORD-2026-0001',
          date: 'July 25, 2026',
          total: '₹50,000',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Accepted',
          transportName: 'Shiprocket',
          trackingId: 'SR222222',
          items: [
            {
              name: 'Biometric Access Control System',
              qty: 30,
              image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
              returnStatus: 'Out for Delivery',
              vendor: 'Vendor B'
            }
          ]
        },
        {
          id: 'ORD-2026-0001',
          date: 'July 25, 2026',
          total: '₹50,000',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Pending',
          items: [
            {
              name: 'Biometric Access Control System',
              qty: 40,
              image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
              returnStatus: 'Awaiting vendor confirmation',
              vendor: 'Vendor C'
            }
          ]
        },
        {
          id: 'ORD-2026-0002',
          date: 'July 22, 2026',
          total: '₹2,500',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Accepted',
          items: [
            {
              name: 'Smart Video Doorbell',
              qty: 1,
              image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
              returnStatus: 'Order is being packed',
            }
          ]
        },
        {
          id: 'ORD-2026-0003',
          date: 'July 18, 2026',
          total: '₹12,000',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Out for Delivery',
          transportName: 'Shiprocket',
          trackingId: 'SR123456789',
          items: [
            {
              name: 'Outdoor PTZ Camera',
              qty: 1,
              image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80',
              returnStatus: 'Arriving today by 9 PM',
            }
          ]
        },
        {
          id: 'ORD-2026-0004',
          date: 'July 15, 2026',
          total: '₹16,500',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Delivered',
          transportName: 'Blue Dart',
          trackingId: 'BD987654321',
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
          id: 'ORD-2026-0005',
          date: 'July 10, 2026',
          total: '₹5,500',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Rejected',
          items: [
            {
              name: 'Wireless Motion Sensor',
              qty: 3,
              image: 'https://images.unsplash.com/photo-1555861496-faa66cb20c27?w=300&q=80',
              returnStatus: 'Item is currently out of stock',
            }
          ]
        },
        {
          id: 'ORD-2026-0006',
          date: 'July 05, 2026',
          total: '₹1,200',
          shipTo: 'Shyam Matam',
          type: 'product',
          status: 'Cancelled',
          items: [
            {
              name: 'Network Switch (8-Port)',
              qty: 1,
              image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&q=80',
              returnStatus: 'Cancelled by user',
            }
          ]
        },
        {
          id: 'DRN-2026-0001',
          date: 'July 31, 2026',
          scheduledDate: '02 Aug 2026',
          scheduledTime: '09:00 AM - 11:00 AM',
          address: 'Survey 123/A, Guntur, AP - 500001',
          technician: null,
          total: '₹4,500',
          shipTo: 'Shyam Matam',
          type: 'service',
          isDroneService: true,
          status: 'Pending',
          items: [{ name: 'Agriculture Drone Spray Services', qty: 1, image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&q=80', returnStatus: 'Waiting for admin approval' }]
        },
        {
          id: 'SRV-2026-0001',
          date: 'July 28, 2026',
          scheduledDate: '30 July 2026',
          scheduledTime: '09:00 AM - 11:00 AM',
          address: 'H.No 12, Madhapur, Hyderabad, Telangana - 500081',
          technician: null,
          total: '₹1,500',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'Pending',
          items: [{ name: 'AC Servicing', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Waiting for admin approval' }]
        },
        {
          id: 'SRV-2026-0002',
          date: 'July 27, 2026',
          scheduledDate: '29 July 2026',
          scheduledTime: '11:00 AM - 01:00 PM',
          address: 'Flat 405, Kondapur, Hyderabad, Telangana - 500084',
          technician: null,
          total: '₹800',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'Accepted',
          items: [{ name: 'Electrical Repair', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Accepted by admin, pending technician assignment' }]
        },
        {
          id: 'SRV-2026-0003',
          date: 'July 26, 2026',
          scheduledDate: '28 July 2026',
          scheduledTime: '02:00 PM - 04:00 PM',
          address: 'H.No 45, Gachibowli, Hyderabad, Telangana - 500032',
          technician: { name: 'Venkatesh', mobile: '9876543210' },
          total: '₹2,300',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'Assigned',
          items: [{ name: 'CCTV Installation', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Technician assigned' }]
        },
        {
          id: 'SRV-2026-0004',
          date: 'July 25, 2026',
          scheduledDate: '28 July 2026',
          scheduledTime: '04:00 PM - 06:00 PM',
          address: 'Villa 12, Jubilee Hills, Hyderabad, Telangana - 500033',
          technician: { name: 'Ramesh', mobile: '9876543211' },
          total: '₹3,500',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'In Progress',
          items: [{ name: 'Home Automation Setup', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Technician is currently working' }]
        },
        {
          id: 'SRV-2026-0005',
          date: 'July 24, 2026',
          scheduledDate: '27 July 2026',
          scheduledTime: '10:00 AM - 12:00 PM',
          address: 'H.No 45, Gachibowli, Hyderabad, Telangana - 500032',
          technician: { name: 'Venkatesh', mobile: '9876543210' },
          total: '₹1,500',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'Awaiting Approval',
          items: [{ name: 'Plumbing Repair', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Work completed, awaiting your approval' }]
        },
        {
          id: 'SRV-2026-0006',
          date: 'July 22, 2026',
          scheduledDate: '24 July 2026',
          scheduledTime: '12:00 PM - 02:00 PM',
          address: 'Apt 2B, Banjara Hills, Hyderabad, Telangana - 500034',
          technician: { name: 'Suresh', mobile: '9876543212' },
          total: '₹4,200',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'Completed',
          items: [{ name: 'Deep Cleaning', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Service completed successfully' }]
        },
        {
          id: 'SRV-2026-0007',
          date: 'July 20, 2026',
          scheduledDate: '22 July 2026',
          scheduledTime: '09:00 AM - 11:00 AM',
          address: 'H.No 8, Manikonda, Hyderabad, Telangana - 500089',
          technician: null,
          total: '₹1,000',
          shipTo: 'Shyam Matam',
          type: 'service',
          status: 'Cancelled',
          items: [{ name: 'Pest Control', qty: 1, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&q=80', returnStatus: 'Cancelled by user' }]
        }
      ]
    };
  },

  cancelOrder: async (orderId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // return axiosInstance.post(`/orders/${orderId}/cancel`);
    return { data: { success: true, message: 'Order cancelled successfully' } };
  }
};
