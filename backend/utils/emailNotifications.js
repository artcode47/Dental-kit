const sendEmail = require('./email');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Order confirmation email
exports.sendOrderConfirmation = async (order) => {
  try {
    const user = await User.findById(order.user);
    if (!user || !user.emailPreferences.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      orderDate: order.createdAt.toLocaleDateString(),
      total: order.total.toFixed(2),
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        total: item.total.toFixed(2)
      })),
      shippingAddress: order.shippingAddress,
      estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toLocaleDateString() : 'TBD',
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
    const user = await User.findById(order.user);
    if (!user || !user.emailPreferences.orderUpdates) return;

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
      estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toLocaleDateString() : 'TBD',
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
    const user = await User.findById(order.user);
    if (!user || !user.emailPreferences.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toLocaleDateString() : 'TBD',
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
    const user = await User.findById(order.user);
    if (!user || !user.emailPreferences.orderUpdates) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      deliveryDate: order.deliveredAt.toLocaleDateString(),
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

// Review reminder email
exports.sendReviewReminder = async (order) => {
  try {
    const user = await User.findById(order.user);
    if (!user || !user.emailPreferences.productRecommendations) return;

    const context = {
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`,
      items: order.items.map(item => ({
        name: item.name,
        productId: item.product
      })),
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'How was your purchase? Leave a review!',
      template: 'review-reminder',
      context
    });
  } catch (error) {
    console.error('Error sending review reminder email:', error);
  }
};

// Back in stock notification
exports.sendBackInStockNotification = async (product, users) => {
  try {
    const context = {
      productName: product.name,
      productUrl: `${process.env.CLIENT_URL}/products/${product.slug}`,
      price: product.price.toFixed(2),
      year: new Date().getFullYear()
    };

    for (const userId of users) {
      try {
        const user = await User.findById(userId);
        if (user && user.emailPreferences.productRecommendations) {
          context.customerName = `${user.firstName} ${user.lastName}`;
          
          await sendEmail({
            to: user.email,
            subject: `${product.name} is back in stock!`,
            template: 'back-in-stock',
            context
          });
        }
      } catch (error) {
        console.error(`Error sending back in stock email to user ${userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending back in stock notifications:', error);
  }
};

// Price drop notification
exports.sendPriceDropNotification = async (product, users, oldPrice) => {
  try {
    const discount = ((oldPrice - product.price) / oldPrice * 100).toFixed(0);
    
    const context = {
      productName: product.name,
      productUrl: `${process.env.CLIENT_URL}/products/${product.slug}`,
      oldPrice: oldPrice.toFixed(2),
      newPrice: product.price.toFixed(2),
      discount,
      year: new Date().getFullYear()
    };

    for (const userId of users) {
      try {
        const user = await User.findById(userId);
        if (user && user.emailPreferences.productRecommendations) {
          context.customerName = `${user.firstName} ${user.lastName}`;
          
          await sendEmail({
            to: user.email,
            subject: `Price Drop Alert: ${product.name} - ${discount}% off!`,
            template: 'price-drop',
            context
          });
        }
      } catch (error) {
        console.error(`Error sending price drop email to user ${userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending price drop notifications:', error);
  }
};

// New product notification
exports.sendNewProductNotification = async (product, users) => {
  try {
    const context = {
      productName: product.name,
      productDescription: product.shortDescription || product.description,
      productUrl: `${process.env.CLIENT_URL}/products/${product.slug}`,
      price: product.price.toFixed(2),
      year: new Date().getFullYear()
    };

    for (const userId of users) {
      try {
        const user = await User.findById(userId);
        if (user && user.emailPreferences.productRecommendations) {
          context.customerName = `${user.firstName} ${user.lastName}`;
          
          await sendEmail({
            to: user.email,
            subject: `New Product Alert: ${product.name}`,
            template: 'new-product',
            context
          });
        }
      } catch (error) {
        console.error(`Error sending new product email to user ${userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending new product notifications:', error);
  }
};

// Abandoned cart reminder
exports.sendAbandonedCartReminder = async (user, cart) => {
  try {
    if (!user.emailPreferences.productRecommendations) return;

    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      items: cart.items.map(item => ({
        name: item.product.name,
        price: item.price.toFixed(2),
        quantity: item.quantity
      })),
      total: cart.total.toFixed(2),
      cartUrl: `${process.env.CLIENT_URL}/cart`,
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Complete your purchase - Items waiting in your cart',
      template: 'abandoned-cart',
      context
    });
  } catch (error) {
    console.error('Error sending abandoned cart reminder:', error);
  }
};

// Welcome email for new users
exports.sendWelcomeEmail = async (user) => {
  try {
    if (!user.emailPreferences.marketing) return;

    const context = {
      customerName: `${user.firstName} ${user.lastName}`,
      year: new Date().getFullYear()
    };

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Dental Kit Store!',
      template: 'welcome',
      context
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Newsletter email
exports.sendNewsletter = async (users, newsletterData) => {
  try {
    const context = {
      ...newsletterData,
      year: new Date().getFullYear()
    };

    for (const userId of users) {
      try {
        const user = await User.findById(userId);
        if (user && user.emailPreferences.newsletter) {
          context.customerName = `${user.firstName} ${user.lastName}`;
          
          await sendEmail({
            to: user.email,
            subject: newsletterData.subject,
            template: 'newsletter',
            context
          });
        }
      } catch (error) {
        console.error(`Error sending newsletter to user ${userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
}; 