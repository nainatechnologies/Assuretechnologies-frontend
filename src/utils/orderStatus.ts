const PRODUCT_STATUS_MAP: Record<string, string> = {
  ACCEPTED: 'Accepted',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

const SERVICE_STATUS_MAP: Record<string, string> = {
  NEW: 'Pending',
  ACCEPTED: 'Accepted',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_APPROVAL: 'Awaiting Approval',
  AWAITING_APPROVAL: 'Awaiting Approval',
  'Awaiting Approval': 'Awaiting Approval',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/**
 * Returns a user-friendly product order status label.
 */
export function getProductOrderStatus(status?: string, paymentStatus?: string): string {
  if (!status) return 'Pending';
  if (status === 'NEW') {
    return paymentStatus === 'PAID' ? 'Pending' : 'Payment Pending';
  }
  return PRODUCT_STATUS_MAP[status] || status;
}

/**
 * Returns a user-friendly service booking status label.
 */
export function getServiceBookingStatus(status?: string): string {
  if (!status) return 'Pending';
  return SERVICE_STATUS_MAP[status] || status;
}

/**
 * Returns a formatted payment method label.
 */
export function getPaymentMethodLabel(
  paymentMethod?: string,
  paymentDetails?: any,
  isPaid?: boolean
): string | undefined {
  if (paymentDetails?.card) return 'Card';
  if (paymentDetails?.vpa) return 'UPI';
  if (paymentMethod === 'UPI') return 'UPI';
  if (paymentMethod === 'CARD') return 'Card';
  if (paymentMethod) return paymentMethod;
  return isPaid ? 'Online' : undefined;
}
