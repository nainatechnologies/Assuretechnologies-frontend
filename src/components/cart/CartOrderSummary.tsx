import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

interface CartOrderSummaryProps {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  totalSavings: number;
  currentStep: 1 | 2 | 3;
  onPlaceOrderClick: () => void;
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  itemCount,
  subtotal,
  tax,
  total,
  totalSavings,
  currentStep,
  onPlaceOrderClick
}) => {
  return (
    <div className="cart-summary">
      <h3 className="cart-summary-title">Price Details</h3>
      <div className="summary-divider" />

      <div className="summary-row">
        <span>Price ({itemCount} items)</span>
        <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="summary-row">
        <span>Tax (18% GST)</span>
        <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="summary-row">
        <span>Delivery</span>
        <span className="charges-applicable" style={{ color: "#b45309", fontWeight: "500", fontSize: "14px" }}>Charges Applicable</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-row total-row">
        <span>Total Amount</span>
        <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      {totalSavings > 0 && (
        <div className="savings-banner">
          You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
        </div>
      )}

      {currentStep === 1 && (
        <button className="btn-checkout" onClick={onPlaceOrderClick}>
          Place Order
        </button>
      )}

      <div className="cart-trust">
        <FaShieldAlt className="cart-trust-icon" />
        <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
      </div>
    </div>
  );
};
