import React from 'react';

interface CartPaymentSectionProps {
  needsGstInvoice: boolean;
  onToggleGstInvoice: (checked: boolean) => void;
  orderCompanyName: string;
  onChangeCompanyName: (val: string) => void;
  orderGstNumber: string;
  onChangeGstNumber: (val: string) => void;
  paymentMethod: 'Online';
  onChangePaymentMethod: (method: 'Online') => void;
  onSubmitOrder: () => void;
  isPlacingOrder: boolean;
  isVerifyingPayment: boolean;
  total: number;
}

export const CartPaymentSection: React.FC<CartPaymentSectionProps> = ({
  needsGstInvoice,
  onToggleGstInvoice,
  orderCompanyName,
  onChangeCompanyName,
  orderGstNumber,
  onChangeGstNumber,
  paymentMethod,
  onChangePaymentMethod,
  onSubmitOrder,
  isPlacingOrder,
  isVerifyingPayment,
  total
}) => {
  return (
    <div className="payment-step-container">
      <div className="cart-items-header" style={{ marginBottom: '16px' }}>
        <h2>Billing Details</h2>
      </div>
      <div style={{ padding: '0 24px 24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: needsGstInvoice ? '16px' : '0' }}>
          <input 
            type="checkbox" 
            checked={needsGstInvoice}
            onChange={(e) => onToggleGstInvoice(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <strong>I am a business and require a GST Invoice</strong>
        </label>

        {needsGstInvoice && (
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                required={needsGstInvoice}
                minLength={2}
                maxLength={100}
                value={orderCompanyName} 
                onChange={e => onChangeCompanyName(e.target.value)} 
                placeholder="Enter your registered company name" 
              />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input 
                type="text" 
                required={needsGstInvoice}
                maxLength={15}
                value={orderGstNumber} 
                onChange={e => onChangeGstNumber(e.target.value)} 
                placeholder="Enter 15-digit GSTIN" 
              />
            </div>
          </div>
        )}
      </div>

      <div className="cart-items-header">
        <h2>Payment Options</h2>
      </div>
      <div className="payment-options-list">
        <label className={`payment-method-card ${paymentMethod === 'Online' ? 'selected' : ''}`}>
          <div className="payment-method-radio">
            <input
              type="radio"
              name="payment_method"
              checked={paymentMethod === 'Online'}
              onChange={() => onChangePaymentMethod('Online')}
            />
            <div className="payment-method-info">
              <span className="payment-method-title">Online Payment</span>
              <span className="payment-method-desc">Pay via UPI, Credit/Debit Card, or Netbanking</span>
            </div>
          </div>
          {paymentMethod === 'Online' && (
            <div className="payment-action-area">
              <button className="btn-confirm-order" onClick={onSubmitOrder} disabled={isPlacingOrder || isVerifyingPayment}>
                {isVerifyingPayment ? 'Verifying Payment...' : isPlacingOrder ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} & Place Order`}
              </button>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};
