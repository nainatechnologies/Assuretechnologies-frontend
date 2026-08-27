import axiosInstance from './axiosConfig';

export interface CreateServiceBookingPayload {
  service_id: string;
  scheduled_date: string;
  scheduled_time_slot?: string | null;
  address: string | {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    landmark?: string;
  };
  pincode: string;
  lat?: number | null;
  lng?: number | null;
  quantity?: number | null;
  metadata?: Record<string, any>;
}

export interface ServiceBookingResponse {
  success: boolean;
  message?: string;
  booking_id?: string;
  order_number?: string;
  total_amount?: number;
  razorpay_order_id?: string | null;
  requires_payment?: boolean;
}

export const createServiceBooking = async (payload: CreateServiceBookingPayload) => {
  const response = await axiosInstance.post('/customer/service-bookings', payload);
  return response.data as ServiceBookingResponse;
};

export const verifyServiceBookingPayment = async (
  bookingId: string,
  paymentData: Record<string, string>
) => {
  const response = await axiosInstance.post('/customer/service-bookings/verify-payment', {
    booking_id: bookingId,
    ...paymentData,
  });

  return response.data;
};

export const getCustomerServiceBookings = async () => {
  const response = await axiosInstance.get('/customer/service-bookings');
  return response.data;
};

export const cancelServiceBooking = async (bookingId: string) => {
  const response = await axiosInstance.put(`/customer/service-bookings/${bookingId}/status`, {
    status: 'CANCELLED'
  });
  return response.data;
};
