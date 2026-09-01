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

export type CustomerActionPayload =
  | { action: 'ACCEPT_WORK' }
  | { action: 'CANCEL'; reason?: string }
  | { action: 'UPDATE_EXTRA_ITEM'; item_id: string; status: 'APPROVED' | 'REJECTED' };

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

export const getCustomerServiceBookings = async (bookingId?: string) => {
  const url = bookingId ? '/customer/service-bookings/' + bookingId : '/customer/service-bookings';
  const response = await axiosInstance.get(url);
  return response.data;
};

export const handleCustomerAction = async (bookingId: string, payload: CustomerActionPayload) => {
  const response = await axiosInstance.patch('/customer/service-bookings/' + bookingId + '/action', payload);
  return response.data;
};

export const acceptServiceBookingWork = async (bookingId: string) => {
  return handleCustomerAction(bookingId, { action: 'ACCEPT_WORK' });
};

export const updateExtraItemStatus = async (bookingId: string, itemId: string, status: 'APPROVED' | 'REJECTED') => {
  return handleCustomerAction(bookingId, { action: 'UPDATE_EXTRA_ITEM', item_id: itemId, status });
};

export const cancelServiceBooking = async (bookingId: string, reason: string = 'No reason provided') => {
  const response = await axiosInstance.patch('/customer/service-bookings/' + bookingId + '/action', {
    action: 'CANCEL',
    reason: reason
  });
  return response.data;
};

