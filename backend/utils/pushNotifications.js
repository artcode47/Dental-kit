const webpush = require('web-push');
const UserService = require('../services/userService');

const userService = new UserService();

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
    userSubscriptions.set(userId, subscription);
    
    // Store in database
    const user = await userService.getById(userId);
    if (user) {
      const pushSubscriptions = user.pushSubscriptions || [];
      pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: new Date()
      });
      
      await userService.update(userId, { pushSubscriptions });
    }
    
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
    userSubscriptions.delete(userId);
    
    // Remove from database
    const user = await userService.getById(userId);
    if (user && user.pushSubscriptions) {
      const updatedSubscriptions = user.pushSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      );
      
      await userService.update(userId, { pushSubscriptions: updatedSubscriptions });
    }
    
    return true;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return false;
  }
};

// Send push notification to user
const sendNotificationToUser = async (userId, notification) => {
  try {
    let subscription = userSubscriptions.get(userId);
    
    if (!subscription) {
      // Try to get from database
      const user = await userService.getById(userId);
      if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
        const latestSubscription = user.pushSubscriptions[user.pushSubscriptions.length - 1];
        subscription = {
          endpoint: latestSubscription.endpoint,
          keys: latestSubscription.keys
        };
        userSubscriptions.set(userId, subscription);
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

// Send push notification to multiple users
const sendNotificationToUsers = async (userIds, notification) => {
  const results = [];
  
  for (const userId of userIds) {
    const success = await sendNotificationToUser(userId, notification);
    results.push({ userId, success });
  }
  
  return results;
};

// Send push notification to all subscribed users
const sendNotificationToAll = async (notification) => {
  try {
    // Get all users with push subscriptions
    const users = await userService.getAll({
      filters: { 'pushSubscriptions.0': { $exists: true } },
      limitCount: 1000
    });
    
    const userIds = users.map(user => user.id);
    return await sendNotificationToUsers(userIds, notification);
  } catch (error) {
    console.error('Error sending notification to all users:', error);
    return [];
  }
};

// Send order status update notification
const sendOrderStatusNotification = async (userId, order, status) => {
  const statusMessages = {
    'confirmed': 'Your order has been confirmed and is being processed.',
    'processing': 'Your order is now being processed and prepared for shipping.',
    'shipped': 'Your order has been shipped!',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.',
    'refunded': 'Your order has been refunded.'
  };

  const notification = {
    title: `Order ${order.orderNumber} - ${status.toUpperCase()}`,
    body: statusMessages[status] || 'Your order status has been updated.',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      type: 'order_status_update',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status
    },
    tag: `order_${order.id}`,
    requireInteraction: false
  };

  return await sendNotificationToUser(userId, notification);
};

// Send new order notification to admin
const sendNewOrderNotification = async (order) => {
  try {
    // Get all admin users
    const adminUsers = await userService.getAll({
      filters: { role: { $in: ['admin', 'super_admin'] } },
      limitCount: 100
    });

    const notification = {
      title: 'New Order Received',
      body: `Order ${order.orderNumber} has been placed for ${order.total.toFixed(2)}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'new_order',
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total
      },
      tag: `new_order_${order.id}`,
      requireInteraction: true
    };

    const adminUserIds = adminUsers.map(user => user.id);
    return await sendNotificationToUsers(adminUserIds, notification);
  } catch (error) {
    console.error('Error sending new order notification:', error);
    return [];
  }
};

// Send low stock alert notification
const sendLowStockAlert = async (product) => {
  try {
    // Get all admin users
    const adminUsers = await userService.getAll({
      filters: { role: { $in: ['admin', 'super_admin'] } },
      limitCount: 100
    });

    const notification = {
      title: 'Low Stock Alert',
      body: `${product.name} is running low on stock (${product.stock} remaining)`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'low_stock_alert',
        productId: product.id,
        productName: product.name,
        currentStock: product.stock
      },
      tag: `low_stock_${product.id}`,
      requireInteraction: true
    };

    const adminUserIds = adminUsers.map(user => user.id);
    return await sendNotificationToUsers(adminUserIds, notification);
  } catch (error) {
    console.error('Error sending low stock alert:', error);
    return [];
  }
};

// Send back in stock notification
const sendBackInStockNotification = async (product, subscribers) => {
  try {
    const notification = {
      title: 'Back in Stock!',
      body: `${product.name} is now back in stock`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'back_in_stock',
        productId: product.id,
        productName: product.name,
        productUrl: `/products/${product.id}`
      },
      tag: `back_in_stock_${product.id}`,
      requireInteraction: false
    };

    const subscriberIds = subscribers.map(sub => sub.userId);
    return await sendNotificationToUsers(subscriberIds, notification);
  } catch (error) {
    console.error('Error sending back in stock notification:', error);
    return [];
  }
};

// Send promotional notification
const sendPromotionalNotification = async (title, body, data = {}) => {
  try {
    // Get all users with push subscriptions
    const users = await userService.getAll({
      filters: { 
        'pushSubscriptions.0': { $exists: true },
        'notificationPreferences.promotional': true
      },
      limitCount: 1000
    });

    const notification = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'promotional',
        ...data
      },
      tag: 'promotional',
      requireInteraction: false
    };

    const userIds = users.map(user => user.id);
    return await sendNotificationToUsers(userIds, notification);
  } catch (error) {
    console.error('Error sending promotional notification:', error);
    return [];
  }
};

// Get VAPID public key
const getVapidPublicKey = () => {
  return vapidKeys.publicKey;
};

// Get user subscription status
const getUserSubscriptionStatus = async (userId) => {
  try {
    const user = await userService.getById(userId);
    if (!user) return { subscribed: false };

    const hasSubscription = user.pushSubscriptions && user.pushSubscriptions.length > 0;
    const inMemory = userSubscriptions.has(userId);

    return {
      subscribed: hasSubscription || inMemory,
      subscriptionCount: user.pushSubscriptions ? user.pushSubscriptions.length : 0,
      inMemory
    };
  } catch (error) {
    console.error('Error getting user subscription status:', error);
    return { subscribed: false };
  }
};

// Cleanup invalid subscriptions
const cleanupInvalidSubscriptions = async () => {
  try {
    const users = await userService.getAll({
      filters: { 'pushSubscriptions.0': { $exists: true } },
      limitCount: 1000
    });

    let cleanedCount = 0;

    for (const user of users) {
      if (user.pushSubscriptions) {
        const validSubscriptions = [];
        
        for (const subscription of user.pushSubscriptions) {
          try {
            // Test subscription
            await webpush.sendNotification(subscription, JSON.stringify({
              title: 'Test',
              body: 'Test notification'
            }));
            validSubscriptions.push(subscription);
          } catch (error) {
            if (error.statusCode === 410) {
              // Subscription is invalid, remove it
              cleanedCount++;
            }
          }
        }

        // Update user with valid subscriptions only
        if (validSubscriptions.length !== user.pushSubscriptions.length) {
          await userService.update(user.id, { pushSubscriptions: validSubscriptions });
        }
      }
    }

    console.log(`Cleaned up ${cleanedCount} invalid push subscriptions`);
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up invalid subscriptions:', error);
    return 0;
  }
};

module.exports = {
  addSubscription,
  removeSubscription,
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAll,
  sendOrderStatusNotification,
  sendNewOrderNotification,
  sendLowStockAlert,
  sendBackInStockNotification,
  sendPromotionalNotification,
  getVapidPublicKey,
  getUserSubscriptionStatus,
  cleanupInvalidSubscriptions
}; 