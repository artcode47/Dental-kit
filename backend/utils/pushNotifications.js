const webpush = require('web-push');
const User = require('../models/User');

// Configure web-push
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store user subscriptions
const userSubscriptions = new Map();

// Add user subscription
const addSubscription = async (userId, subscription) => {
  try {
    // Store in memory for quick access
    userSubscriptions.set(userId.toString(), subscription);
    
    // Store in database
    await User.findByIdAndUpdate(userId, {
      $push: {
        pushSubscriptions: {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          createdAt: new Date()
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error adding push subscription:', error);
    return false;
  }
};

// Remove user subscription
const removeSubscription = async (userId, endpoint) => {
  try {
    // Remove from memory
    userSubscriptions.delete(userId.toString());
    
    // Remove from database
    await User.findByIdAndUpdate(userId, {
      $pull: {
        pushSubscriptions: { endpoint }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return false;
  }
};

// Send push notification to user
const sendNotificationToUser = async (userId, notification) => {
  try {
    const subscription = userSubscriptions.get(userId.toString());
    
    if (!subscription) {
      // Try to get from database
      const user = await User.findById(userId);
      if (user && user.pushSubscriptions.length > 0) {
        const latestSubscription = user.pushSubscriptions[user.pushSubscriptions.length - 1];
        userSubscriptions.set(userId.toString(), {
          endpoint: latestSubscription.endpoint,
          keys: latestSubscription.keys
        });
      } else {
        return false;
      }
    }
    
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data || {},
      actions: notification.actions || [],
      tag: notification.tag || 'default',
      requireInteraction: notification.requireInteraction || false,
      silent: notification.silent || false
    });
    
    await webpush.sendNotification(subscription, payload);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // Remove invalid subscription
    if (error.statusCode === 410) {
      await removeSubscription(userId, subscription?.endpoint);
    }
    
    return false;
  }
};

// Send notification to multiple users
const sendNotificationToUsers = async (userIds, notification) => {
  const results = await Promise.allSettled(
    userIds.map(userId => sendNotificationToUser(userId, notification))
  );
  
  const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
  const failed = results.length - successful;
  
  return { successful, failed, total: results.length };
};

// Send notification to all users
const sendNotificationToAll = async (notification) => {
  try {
    const users = await User.find({ 'pushSubscriptions.0': { $exists: true } });
    const userIds = users.map(user => user._id);
    
    return await sendNotificationToUsers(userIds, notification);
  } catch (error) {
    console.error('Error sending notification to all users:', error);
    return { successful: 0, failed: 0, total: 0 };
  }
};

// Notification templates
const notificationTemplates = {
  orderStatusUpdate: (orderNumber, status) => ({
    title: 'Order Status Update',
    body: `Your order ${orderNumber} has been ${status}`,
    icon: '/order-icon.png',
    tag: 'order-update',
    data: { orderNumber, status }
  }),
  
  lowStockAlert: (productName) => ({
    title: 'Low Stock Alert',
    body: `${productName} is running low on stock`,
    icon: '/stock-icon.png',
    tag: 'stock-alert',
    data: { productName }
  }),
  
  priceDrop: (productName, oldPrice, newPrice) => ({
    title: 'Price Drop Alert',
    body: `${productName} price dropped from $${oldPrice} to $${newPrice}`,
    icon: '/price-icon.png',
    tag: 'price-drop',
    data: { productName, oldPrice, newPrice }
  }),
  
  newProduct: (productName) => ({
    title: 'New Product Available',
    body: `Check out our new ${productName}`,
    icon: '/new-product-icon.png',
    tag: 'new-product',
    data: { productName }
  }),
  
  backInStock: (productName) => ({
    title: 'Back in Stock',
    body: `${productName} is back in stock`,
    icon: '/stock-icon.png',
    tag: 'back-in-stock',
    data: { productName }
  }),
  
  orderShipped: (orderNumber, trackingNumber) => ({
    title: 'Order Shipped',
    body: `Your order ${orderNumber} has been shipped. Track: ${trackingNumber}`,
    icon: '/shipping-icon.png',
    tag: 'order-shipped',
    data: { orderNumber, trackingNumber }
  }),
  
  abandonedCart: () => ({
    title: 'Complete Your Purchase',
    body: 'You have items in your cart waiting for you',
    icon: '/cart-icon.png',
    tag: 'abandoned-cart',
    requireInteraction: true
  }),
  
  loyaltyPoints: (points, reason) => ({
    title: 'Loyalty Points Earned',
    body: `You earned ${points} points for ${reason}`,
    icon: '/loyalty-icon.png',
    tag: 'loyalty-points',
    data: { points, reason }
  }),
  
  flashSale: (discount, endTime) => ({
    title: 'Flash Sale!',
    body: `${discount}% off - Ends in ${endTime}`,
    icon: '/sale-icon.png',
    tag: 'flash-sale',
    requireInteraction: true,
    data: { discount, endTime }
  })
};

// Get VAPID public key
const getVapidPublicKey = () => {
  return vapidKeys.publicKey;
};

// Get user subscription status
const getUserSubscriptionStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      hasSubscription: user && user.pushSubscriptions.length > 0,
      subscriptionCount: user ? user.pushSubscriptions.length : 0
    };
  } catch (error) {
    console.error('Error getting user subscription status:', error);
    return { hasSubscription: false, subscriptionCount: 0 };
  }
};

// Clean up invalid subscriptions
const cleanupInvalidSubscriptions = async () => {
  try {
    const users = await User.find({ 'pushSubscriptions.0': { $exists: true } });
    
    for (const user of users) {
      const validSubscriptions = [];
      
      for (const subscription of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(subscription, 'test');
          validSubscriptions.push(subscription);
        } catch (error) {
          if (error.statusCode === 410) {
            // Invalid subscription, remove it
            console.log(`Removing invalid subscription for user ${user._id}`);
          }
        }
      }
      
      // Update user with valid subscriptions only
      if (validSubscriptions.length !== user.pushSubscriptions.length) {
        await User.findByIdAndUpdate(user._id, {
          pushSubscriptions: validSubscriptions
        });
      }
    }
  } catch (error) {
    console.error('Error cleaning up invalid subscriptions:', error);
  }
};

module.exports = {
  addSubscription,
  removeSubscription,
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAll,
  notificationTemplates,
  getVapidPublicKey,
  getUserSubscriptionStatus,
  cleanupInvalidSubscriptions
}; 