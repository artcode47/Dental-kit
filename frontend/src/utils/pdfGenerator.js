import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// PDF Generator utility for invoices
export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF({ compress: true, precision: 16 });
    this.currentY = 20;
    this.margin = 20;
    this.pageWidth = 210;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  // Safely stringify any value for PDF text
  safeText(value) {
    if (value === null || value === undefined) return '-';
    try {
      return String(value);
    } catch (_) {
      return '-';
    }
  }

  // Generate invoice PDF
  generateInvoice(order) {
    try {
      this.doc = new jsPDF({ compress: true, precision: 16 });
      this.doc.setLineHeightFactor(1.3);
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

      // Add page numbers
      const pageCount = this.doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        this.doc.setPage(i);
        this.doc.setFontSize(8);
        this.doc.setTextColor(120, 120, 120);
        this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin, 295, { align: 'right' });
      }

      return this.doc;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }

  // Add header with logo and title
  addHeader() {
    // Company logo placeholder (you can add actual logo)
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246); // Blue color
    this.doc.text(this.safeText('DentalKit'), this.margin, this.currentY);
    
    this.currentY += 12;
    
    // Invoice title
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.safeText('INVOICE'), this.pageWidth - this.margin - 30, this.currentY);
    
    this.currentY += 18;
    // Separator line
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 6;
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
      this.doc.text(this.safeText(line), this.margin, this.currentY + (index * 5));
    });

    this.currentY += 36;
  }

  // Add invoice details
  addInvoiceDetails(order) {
    const rightX = this.pageWidth - this.margin;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Invoice details
    const details = [
      { label: 'Invoice Number:', value: order?.orderNumber },
      { label: 'Invoice Date:', value: order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-' },
      { label: 'Order Date:', value: order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-' },
      { label: 'Payment Method:', value: this.formatPaymentMethod(order?.paymentMethod) },
      { label: 'Shipping Method:', value: this.formatShippingMethod(order?.shippingMethod) }
    ];

    details.forEach((detail, index) => {
      const y = this.currentY + (index * 8);
      
      // Label
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(this.safeText(detail.label), rightX - 60, y);
      
      // Value
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.safeText(detail.value), rightX - 55, y);
    });

    this.currentY += 46;
    // Separator line
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  // Add billing and shipping addresses
  addAddresses(order) {
    const leftX = this.margin;
    const rightX = this.pageWidth / 2 + 10;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Billing Address
    this.doc.text(this.safeText('BILL TO:'), leftX, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const billingAddress = order?.billingAddress ? [
      `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`,
      order.billingAddress.company || '',
      order.billingAddress.address1 || '',
      order.billingAddress.address2 || '',
      `${order.billingAddress.city || ''}, ${order.billingAddress.state || ''} ${order.billingAddress.zipCode || ''}`,
      order.billingAddress.country || '',
      this.safeText(order.billingAddress.phone || '')
    ].filter(line => this.safeText(line).trim()) : ['No billing address provided'];

    billingAddress.forEach((line, index) => {
      this.doc.text(this.safeText(line), leftX, this.currentY + (index * 5));
    });

    // Shipping Address
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.safeText('SHIP TO:'), rightX, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const shippingAddress = order?.shippingAddress ? [
      `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`,
      order.shippingAddress.company || '',
      order.shippingAddress.address1 || '',
      order.shippingAddress.address2 || '',
      `${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}`,
      order.shippingAddress.country || '',
      this.safeText(order.shippingAddress.phone || '')
    ].filter(line => this.safeText(line).trim()) : ['No shipping address provided'];

    shippingAddress.forEach((line, index) => {
      this.doc.text(this.safeText(line), rightX, this.currentY + (index * 5));
    });

    this.currentY += Math.max(billingAddress.length, shippingAddress.length) * 5 + 16;
    // Separator line
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  // Add items table
  addItemsTable(order) {
    try {
      const items = Array.isArray(order?.items) ? order.items : [];
      const tableData = items.map(item => [
        this.safeText(item?.name || 'Unknown Item'),
        this.safeText(item?.quantity ?? 0),
        this.formatPrice(Number(item?.price ?? 0)),
        this.formatPrice(Number(item?.total ?? (Number(item?.price ?? 0) * Number(item?.quantity ?? 0))))
      ]);

      // Add header row
      const headers = ['Item', 'Qty', 'Unit Price', 'Total'];
      
      autoTable(this.doc, {
        startY: this.currentY,
        head: [headers],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          lineWidth: 0.1,
          lineColor: [209, 213, 219]
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });

      this.currentY = this.doc.lastAutoTable?.finalY + 10 || this.currentY + 50;
    } catch (error) {
      console.error('Error creating table:', error);
      // Fallback: create a simple text-based table
      this.createSimpleTable(order);
    }
  }

  // Fallback method for creating a simple table without autoTable
  createSimpleTable(order) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Headers
    const headers = ['Item', 'Qty', 'Price', 'Total'];
    const startX = this.margin;
    const colWidth = 40;
    
    headers.forEach((header, index) => {
      this.doc.text(this.safeText(header), startX + (index * colWidth), this.currentY);
    });
    
    this.currentY += 10;
    
    // Items
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    (Array.isArray(order?.items) ? order.items : []).forEach(item => {
      const itemName = this.safeText(item?.name || 'Unknown Item');
      const quantity = this.safeText(item?.quantity ?? 0);
      const price = this.formatPrice(Number(item?.price ?? 0));
      const total = this.formatPrice(Number(item?.total ?? (Number(item?.price ?? 0) * Number(item?.quantity ?? 0))));
      
      this.doc.text(this.safeText(itemName.substring(0, 30)), startX, this.currentY);
      this.doc.text(this.safeText(quantity), startX + colWidth, this.currentY);
      this.doc.text(this.safeText(price), startX + (colWidth * 2), this.currentY);
      this.doc.text(this.safeText(total), startX + (colWidth * 3), this.currentY);
      
      this.currentY += 6;
    });
    
    this.currentY += 10;
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
      { label: 'Subtotal:', value: this.formatPrice(Number(order?.subtotal ?? 0)) },
      { label: 'Shipping:', value: Number(order?.shipping ?? 0) === 0 ? 'Free' : this.formatPrice(Number(order?.shipping ?? 0)) },
      { label: 'Tax:', value: this.formatPrice(Number(order?.tax ?? 0)) }
    ];

    if (Number(order?.discount ?? 0) > 0) {
      totals.push({ label: 'Discount:', value: `-${this.formatPrice(Number(order.discount))}` });
    }

    totals.forEach((total, index) => {
      const y = this.currentY + (index * 8);
      
      this.doc.text(this.safeText(total.label), labelX, y);
      this.doc.text(this.safeText(total.value), valueX, y);
    });

    // Total line
    this.currentY += totals.length * 8 + 5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.safeText('Total:'), labelX, this.currentY);
    this.doc.setTextColor(59, 130, 246);
    this.doc.text(this.safeText(this.formatPrice(Number(order?.total ?? 0))), valueX, this.currentY);
    
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
      this.doc.text(this.safeText(line), this.margin, this.currentY + (index * 4));
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
    return this.safeText(methods[method] || method);
  }

  // Format shipping method
  formatShippingMethod(method) {
    const methods = {
      'standard': 'Standard Shipping',
      'express': 'Express Shipping',
      'overnight': 'Overnight Shipping',
      'pickup': 'Pickup from Store'
    };
    return this.safeText(methods[method] || method);
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