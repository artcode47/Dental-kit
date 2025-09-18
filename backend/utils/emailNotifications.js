const sendEmail = require('./email');
const UserService = require('../services/userService');
const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');

const userService = new UserService();
const orderService = new OrderService();
const productService = new ProductService();

// Order confirmation email
exports.sendOrderConfirmation = async (order) => {
  try {
    const user = await userService.getById(order.userId);
    if (!user || !user.emailPreferences?.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      total: order.total.toFixed(2),
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        total: item.total.toFixed(2)
      })),
      shippingAddress: order.shippingAddress,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD',
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: 'order-confirmation',
      context
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

// Order status update email
exports.sendOrderStatusUpdate = async (order, previousStatus) => {
  try {
    const user = await userService.getById(order.userId);
    if (!user || !user.emailPreferences?.orderUpdates) return;

    const statusMessages = {
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'Your order is now being processed and prepared for shipping.',
      'shipped': 'Your order has been shipped!',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'Your order has been cancelled.',
      'refunded': 'Your order has been refunded.'
    };

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      previousStatus,
      newStatus: order.status,
      statusMessage: statusMessages[order.status] || 'Your order status has been updated.',
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD',
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: `Order Status Update - ${order.orderNumber}`,
      template: 'order-status-update',
      context
    });
  } catch (error) {
    console.error('Error sending order status update email:', error);
  }
};

// Shipping confirmation email
exports.sendShippingConfirmation = async (order) => {
  try {
    const user = await userService.getById(order.userId);
    if (!user || !user.emailPreferences?.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD',
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      })),
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: `Your Order Has Been Shipped - ${order.orderNumber}`,
      template: 'shipping-confirmation',
      context
    });
  } catch (error) {
    console.error('Error sending shipping confirmation email:', error);
  }
};

// Delivery confirmation email
exports.sendDeliveryConfirmation = async (order) => {
  try {
    const user = await userService.getById(order.userId);
    if (!user || !user.emailPreferences?.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      deliveryDate: new Date().toLocaleDateString(),
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      })),
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: `Your Order Has Been Delivered - ${order.orderNumber}`,
      template: 'delivery-confirmation',
      context
    });
  } catch (error) {
    console.error('Error sending delivery confirmation email:', error);
  }
};

// Order cancellation email
exports.sendOrderCancellation = async (order, reason) => {
  try {
    const user = await userService.getById(order.userId);
    if (!user || !user.emailPreferences?.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      cancellationReason: reason || 'No reason provided',
      refundAmount: order.total.toFixed(2),
      refundMethod: 'Original payment method',
      estimatedRefundTime: '3-5 business days',
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: `Order Cancelled - ${order.orderNumber}`,
      template: 'order-cancellation',
      context
    });
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
  }
};

// Low stock alert email
exports.sendLowStockAlert = async (product) => {
  try {
    // Get all admin users
    const adminUsers = await userService.getAll({
      filters: { role: { $in: ['admin', 'super_admin'] } },
      limitCount: 100
    });

    const context = {
      productName: product.name,
      currentStock: product.stock,
      sku: product.sku,
      threshold: 10, // You can make this configurable
      year: new Date().getFullYear()
    };

    // Send to all admin users
    for (const admin of adminUsers) {
      if (admin.emailPreferences?.updates) {
        await sendEmail({
          to: admin.email,
          subject: `Low Stock Alert - ${product.name}`,
          template: 'low-stock-alert',
          context
        });
      }
    }
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
  }
};

// New order notification email
exports.sendNewOrderNotification = async (order) => {
  try {
    // Get all admin users
    const adminUsers = await userService.getAll({
      filters: { role: { $in: ['admin', 'super_admin'] } },
      limitCount: 100
    });

    const user = await userService.getById(order.userId);

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      orderTotal: order.total.toFixed(2),
      itemCount: order.items.length,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      year: new Date().getFullYear()
    };

    // Send to all admin users
    for (const admin of adminUsers) {
      if (admin.emailPreferences?.updates) {
        await sendEmail({
          to: admin.email,
          subject: `New Order Received - ${order.orderNumber}`,
          template: 'new-order-notification',
          context
        });
      }
    }
  } catch (error) {
    console.error('Error sending new order notification email:', error);
  }
};

// Product back in stock notification
exports.sendBackInStockNotification = async (product, subscribers) => {
  try {
    const context = {
      productName: product.name,
      productUrl: `${process.env.CLIENT_URL}/products/${product.id}`,
      currentStock: product.stock,
      year: new Date().getFullYear()
    };

    // Send to all subscribers
    for (const subscriber of subscribers) {
      await sendEmail({
        to: subscriber.email,
        subject: `${product.name} is Back in Stock!`,
        template: 'back-in-stock',
        context
      });
    }
  } catch (error) {
    console.error('Error sending back in stock notification email:', error);
  }
};

// Welcome email for new users
exports.sendWelcomeEmail = async (user) => {
  try {
    if (!user.emailPreferences?.marketing) return;

    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      loginUrl: `${process.env.CLIENT_URL}/login`,
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Our Dental Store!',
      template: 'welcome-email',
      context
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      resetUrl,
      expiryTime: '1 hour',
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'reset-password',
      context
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Email verification
exports.sendEmailVerification = async (user, verificationToken) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      verificationUrl,
      expiryTime: '24 hours',
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'verify-email',
      context
    });
  } catch (error) {
    console.error('Error sending email verification:', error);
  }
};

// Newsletter subscription confirmation
exports.sendNewsletterConfirmation = async (user) => {
  try {
    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      unsubscribeUrl: `${process.env.CLIENT_URL}/unsubscribe?email=${user.email}`,
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Newsletter Subscription Confirmed',
      template: 'newsletter-confirmation',
      context
    });
  } catch (error) {
    console.error('Error sending newsletter confirmation email:', error);
  }
};

// Abandoned cart reminder
exports.sendAbandonedCartReminder = async (user, cart) => {
  try {
    if (!user.emailPreferences?.marketing) return;

    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      cartUrl: `${process.env.CLIENT_URL}/cart`,
      itemCount: cart.items.length,
      total: cart.total.toFixed(2),
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Complete Your Purchase',
      template: 'abandoned-cart-reminder',
      context
    });
  } catch (error) {
    console.error('Error sending abandoned cart reminder email:', error);
  }
}; 