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
    return (paymentStatus === 'PAID' || paymentStatus === 'REFUND_PENDING') ? 'Pending' : 'Payment Pending';
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

/**
 * Validates and returns a safe HTTP/HTTPS URL, preventing javascript: or data: injection.
 */
export function getSafeTrackingUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

/**
 * Returns descriptive status text for an order item.
 */
export function getItemStatusText(orderStatus?: string, paymentStatus?: string, refundStatus?: string): string {
  const isCancelled = orderStatus === 'CANCELLED' || orderStatus === 'Cancelled' || orderStatus === 'REJECTED' || orderStatus === 'Rejected';

  if (isCancelled) {
    if (paymentStatus === 'REFUNDED') {
      return 'Cancelled • Refunded';
    }
    if (paymentStatus === 'REFUND_PENDING' || refundStatus === 'REQUESTED') {
      return 'Cancelled • Refund in Progress';
    }
    return (orderStatus === 'REJECTED' || orderStatus === 'Rejected') ? 'Order Rejected' : 'Order Cancelled';
  }

  if (paymentStatus && paymentStatus === 'PENDING') {
    return 'Payment Pending • Awaiting payment completion';
  }

  switch (orderStatus) {
    case 'NEW':
    case 'Pending':
      return 'Order Placed • Awaiting Confirmation';
    case 'ACCEPTED':
    case 'Accepted':
      return 'Order Accepted • Packing Item';
    case 'OUT_FOR_DELIVERY':
    case 'Out for Delivery':
      return 'Dispatched • Out for Delivery';
    case 'COMPLETED':
    case 'Delivered':
      return 'Delivered Successfully';
    default:
      return orderStatus ? `Status: ${orderStatus}` : 'Order Placed';
  }
}


