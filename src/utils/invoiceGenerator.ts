import html2pdf from 'html2pdf.js';

export interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerContact?: string;
  customerEmail?: string;
  customerAddress: string;
  companyName?: string;
  gstNumber?: string;
  items: Array<{
    name: string;
    qty: number;
    price: number | string;
    subtotal?: number | string;
  }>;
  subtotal?: number | string;
  taxAmount?: number | string;
  totalAmount: number | string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDetails?: any;
  razorpayPaymentId?: string;
  paidAt?: string;
  isService?: boolean;
}

export function generateInvoiceHtml(data: InvoiceData): string {
  const numericTotal = typeof data.totalAmount === 'string' 
    ? parseFloat(data.totalAmount.replace(/[^0-9.-]+/g, '')) || 0 
    : data.totalAmount;
    
  let numericTax = data.taxAmount != null 
    ? (typeof data.taxAmount === 'string' ? parseFloat(data.taxAmount.replace(/[^0-9.-]+/g, '')) : data.taxAmount)
    : 0;
    
  let numericSubtotal = data.subtotal != null
    ? (typeof data.subtotal === 'string' ? parseFloat(data.subtotal.replace(/[^0-9.-]+/g, '')) : data.subtotal)
    : 0;

  // If subtotal equals total or tax is 0/missing, calculate 18% GST backwards
  if (numericTax === 0 || numericSubtotal === 0 || numericSubtotal >= numericTotal) {
    numericSubtotal = Math.round((numericTotal / 1.18) * 100) / 100;
    numericTax = Math.round((numericTotal - numericSubtotal) * 100) / 100;
  }

  let paymentInstrument = 'Online Payment';
  if (data.paymentDetails?.vpa) {
    paymentInstrument = `UPI (${data.paymentDetails.vpa})`;
  } else if (data.paymentDetails?.card) {
    const brand = data.paymentDetails.card.network && data.paymentDetails.card.network !== 'Unknown' ? data.paymentDetails.card.network : 'Card';
    paymentInstrument = `Credit / Debit Card (${brand} •••• ${data.paymentDetails.card.last4 || '****'})`;
  } else if (data.paymentDetails?.bank) {
    paymentInstrument = `Net Banking (${data.paymentDetails.bank})`;
  } else if (data.paymentDetails?.wallet) {
    const wName = data.paymentDetails.wallet.charAt(0).toUpperCase() + data.paymentDetails.wallet.slice(1);
    paymentInstrument = `Digital Wallet (${wName})`;
  } else {
    const m = (data.paymentMethod || '').toUpperCase();
    if (m === 'UPI') paymentInstrument = 'UPI / QR Code';
    else if (m === 'CARD') paymentInstrument = 'Credit / Debit Card';
    else if (m === 'NETBANKING') paymentInstrument = 'Net Banking';
    else if (m === 'WALLET') paymentInstrument = 'Digital Wallet';
    else if (m === 'EMI') paymentInstrument = 'EMI Payment';
    else if (m === 'PAYLATER') paymentInstrument = 'Pay Later';
    else if (m === 'COD' || m === 'CASH') paymentInstrument = 'Cash on Delivery';
    else if (m === 'ONLINE') paymentInstrument = 'Online Payment (Razorpay)';
    else paymentInstrument = data.paymentMethod || ((data.paymentStatus === 'PAID' || data.paymentStatus === 'Completed' || data.paymentStatus === 'Prebooking Paid') ? 'Online Payment' : 'Payment Pending');
  }

  return `
    <div class="invoice-card" style="max-width: 800px; margin: 0 auto; background: #ffffff; padding: 36px 40px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 18px; margin-bottom: 22px;">
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.5px;">ASSURE TECHNOLOGIES</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">TAX INVOICE</div>
          <div style="font-size: 13px; color: #475569; margin-top: 6px; line-height: 1.4;">
            <strong>Invoice #:</strong> INV-${data.orderNumber}<br />
            <strong>Order Date:</strong> ${data.orderDate}
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 22px;">
        <div style="background: #f8fafc; padding: 14px 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.5;">
          <h3 style="font-size: 12px; text-transform: uppercase; color: #2563eb; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">Billed & Shipped To</h3>
          <strong>${data.customerName || 'Customer'}</strong><br />
          ${data.companyName ? `Company: ${data.companyName}<br />` : ''}
          ${data.gstNumber ? `GSTIN: <strong>${data.gstNumber}</strong><br />` : ''}
          Address: ${data.customerAddress || 'Customer Address'}<br />
          ${data.customerContact ? `Phone: ${data.customerContact}<br />` : ''}
          ${data.customerEmail ? `Email: ${data.customerEmail}` : ''}
        </div>

        <div style="background: #f8fafc; padding: 14px 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.5;">
          <h3 style="font-size: 12px; text-transform: uppercase; color: #2563eb; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">Payment Details</h3>
          <strong>Mode:</strong> ${paymentInstrument}<br />
          <strong>Status:</strong> ${data.paymentStatus === 'PAID' || data.paymentStatus === 'Completed' || data.paymentStatus === 'Prebooking Paid' ? 'PAID' : 'PAYMENT PENDING'}<br />
          ${data.razorpayPaymentId ? `<strong>Transaction ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #0284c7;">${data.razorpayPaymentId}</span><br />` : ''}
          ${data.paidAt ? `<strong>Paid on:</strong> ${data.paidAt}` : ''}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
        <thead>
          <tr style="background: #f1f5f9; color: #334155; font-size: 12px; text-transform: uppercase; font-weight: 700;">
            <th style="width: 40px; padding: 9px 12px; text-align: center; border-bottom: 1px solid #cbd5e1;">#</th>
            <th style="padding: 9px 12px; text-align: left; border-bottom: 1px solid #cbd5e1;">Description of Goods / Services</th>
            <th style="width: 70px; padding: 9px 12px; text-align: center; border-bottom: 1px solid #cbd5e1;">Qty</th>
            <th style="width: 110px; padding: 9px 12px; text-align: right; border-bottom: 1px solid #cbd5e1;">Unit Price</th>
            <th style="width: 120px; padding: 9px 12px; text-align: right; border-bottom: 1px solid #cbd5e1;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, index) => {
            let itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0 : item.price;
            if (itemPrice * item.qty > numericSubtotal && numericSubtotal > 0) {
              itemPrice = Math.round((itemPrice / 1.18) * 100) / 100;
            }
            const itemSubtotal = Math.round(itemPrice * item.qty * 100) / 100;
            return `
              <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                <td style="padding: 10px 12px; text-align: center; color: #64748b;">${index + 1}</td>
                <td style="padding: 10px 12px; font-weight: 600;">${item.name}</td>
                <td style="padding: 10px 12px; text-align: center;">${item.qty}</td>
                <td style="padding: 10px 12px; text-align: right;">₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 600;">₹${itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
        <table style="width: 320px; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 10px; color: #475569;">Subtotal (Taxable):</td>
            <td style="padding: 5px 10px; text-align: right; font-weight: 600;">₹${numericSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px; color: #475569;">GST (18% Integrated):</td>
            <td style="padding: 5px 10px; text-align: right; font-weight: 600;">₹${numericTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1; font-weight: 800; font-size: 15px; color: #1e3a8a;">
            <td style="padding: 8px 10px;">Grand Total:</td>
            <td style="padding: 8px 10px; text-align: right;">₹${numericTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 12px; color: #64748b;">
        <p>Thank you for choosing Assure Technologies.</p>
      </div>
    </div>
  `;
}

export async function generateAndPrintInvoice(data: InvoiceData) {
  const container = document.createElement('div');
  container.innerHTML = generateInvoiceHtml(data);
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  document.body.appendChild(container);

  const opt = {
    margin: 10,
    filename: `Tax-Invoice-${data.orderNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    const target = container.firstElementChild as HTMLElement || container;
    await html2pdf().set(opt).from(target).save();
  } catch (error) {
    console.error('Direct PDF download failed, opening print window fallback:', error);
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Tax Invoice - ${data.orderNumber}</title></head>
        <body style="padding:20px;background:#f8fafc;">
          ${generateInvoiceHtml(data)}
          <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

