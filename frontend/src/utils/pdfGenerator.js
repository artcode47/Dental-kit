import jsPDF from 'jspdf';
import 'jspdf-autotable';

// PDF Generator utility for invoices
export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF();
    this.currentY = 20;
    this.margin = 20;
    this.pageWidth = 210;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  // Generate invoice PDF
  generateInvoice(order) {
    this.doc = new jsPDF();
    this.currentY = 20;

    // Add header
    this.addHeader();
    
    // Add company info
    this.addCompanyInfo();
    
    // Add invoice details
    this.addInvoiceDetails(order);
    
    // Add billing and shipping addresses
    this.addAddresses(order);
    
    // Add items table
    this.addItemsTable(order);
    
    // Add totals
    this.addTotals(order);
    
    // Add footer
    this.addFooter();

    return this.doc;
  }

  // Add header with logo and title
  addHeader() {
    // Company logo placeholder (you can add actual logo)
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246); // Blue color
    this.doc.text('DentalKit', this.margin, this.currentY);
    
    this.currentY += 10;
    
    // Invoice title
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('INVOICE', this.pageWidth - this.margin - 30, this.currentY);
    
    this.currentY += 20;
  }

  // Add company information
  addCompanyInfo() {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99); // Gray color
    
    const companyInfo = [
      'DentalKit',
      '123 Dental Street',
      'Medical District, CA 90210',
      'United States',
      'Phone: +1 (555) 123-4567',
      'Email: info@dentalkit.com',
      'Website: www.dentalkit.com'
    ];

    companyInfo.forEach((line, index) => {
      this.doc.text(line, this.margin, this.currentY + (index * 5));
    });

    this.currentY += 40;
  }

  // Add invoice details
  addInvoiceDetails(order) {
    const rightX = this.pageWidth - this.margin;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Invoice details
    const details = [
      { label: 'Invoice Number:', value: order.orderNumber },
      { label: 'Invoice Date:', value: new Date(order.createdAt).toLocaleDateString() },
      { label: 'Order Date:', value: new Date(order.createdAt).toLocaleDateString() },
      { label: 'Payment Method:', value: this.formatPaymentMethod(order.paymentMethod) },
      { label: 'Shipping Method:', value: this.formatShippingMethod(order.shippingMethod) }
    ];

    details.forEach((detail, index) => {
      const y = this.currentY + (index * 8);
      
      // Label
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(detail.label, rightX - 60, y);
      
      // Value
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(detail.value, rightX - 55, y);
    });

    this.currentY += 50;
  }

  // Add billing and shipping addresses
  addAddresses(order) {
    const leftX = this.margin;
    const rightX = this.pageWidth / 2 + 10;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Billing Address
    this.doc.text('BILL TO:', leftX, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const billingAddress = [
      `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
      order.billingAddress.company || '',
      order.billingAddress.address1,
      order.billingAddress.address2 || '',
      `${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.zipCode}`,
      order.billingAddress.country,
      order.billingAddress.phone || ''
    ].filter(line => line.trim());

    billingAddress.forEach((line, index) => {
      this.doc.text(line, leftX, this.currentY + (index * 5));
    });

    // Shipping Address
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('SHIP TO:', rightX, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const shippingAddress = [
      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      order.shippingAddress.company || '',
      order.shippingAddress.address1,
      order.shippingAddress.address2 || '',
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
      order.shippingAddress.country,
      order.shippingAddress.phone || ''
    ].filter(line => line.trim());

    shippingAddress.forEach((line, index) => {
      this.doc.text(line, rightX, this.currentY + (index * 5));
    });

    this.currentY += Math.max(billingAddress.length, shippingAddress.length) * 5 + 20;
  }

  // Add items table
  addItemsTable(order) {
    const tableData = order.items.map(item => [
      item.name,
      item.quantity,
      this.formatPrice(item.price),
      this.formatPrice(item.total)
    ]);

    // Add header row
    const headers = ['Item', 'Qty', 'Unit Price', 'Total'];
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add totals section
  addTotals(order) {
    const rightX = this.pageWidth - this.margin;
    const labelX = rightX - 60;
    const valueX = rightX - 20;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const totals = [
      { label: 'Subtotal:', value: this.formatPrice(order.subtotal) },
      { label: 'Shipping:', value: order.shipping === 0 ? 'Free' : this.formatPrice(order.shipping) },
      { label: 'Tax:', value: this.formatPrice(order.tax) }
    ];

    if (order.discount > 0) {
      totals.push({ label: 'Discount:', value: `-${this.formatPrice(order.discount)}` });
    }

    totals.forEach((total, index) => {
      const y = this.currentY + (index * 8);
      
      this.doc.text(total.label, labelX, y);
      this.doc.text(total.value, valueX, y);
    });

    // Total line
    this.currentY += totals.length * 8 + 5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Total:', labelX, this.currentY);
    this.doc.setTextColor(59, 130, 246);
    this.doc.text(this.formatPrice(order.total), valueX, this.currentY);
    
    this.currentY += 20;
  }

  // Add footer
  addFooter() {
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(156, 163, 175);
    
    const footerText = [
      'Thank you for your business!',
      'For questions about this invoice, please contact us at support@dentalkit.com',
      'Payment is due within 30 days of invoice date.',
      'DentalKit - Your trusted partner for modern dental supplies.'
    ];

    footerText.forEach((line, index) => {
      this.doc.text(line, this.margin, this.currentY + (index * 4));
    });
  }

  // Format payment method
  formatPaymentMethod(method) {
    const methods = {
      'creditCard': 'Credit Card',
      'paypal': 'PayPal',
      'cashOnDelivery': 'Cash on Delivery',
      'bankTransfer': 'Bank Transfer'
    };
    return methods[method] || method;
  }

  // Format shipping method
  formatShippingMethod(method) {
    const methods = {
      'standard': 'Standard Shipping',
      'express': 'Express Shipping',
      'overnight': 'Overnight Shipping',
      'pickup': 'Pickup from Store'
    };
    return methods[method] || method;
  }

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Download PDF
  download(filename) {
    this.doc.save(filename);
  }

  // Get PDF as blob
  getBlob() {
    return this.doc.output('blob');
  }
}

// Export default instance
export default PDFGenerator; 