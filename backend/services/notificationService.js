const unifiedStore = require('./unifiedStore');
const emailService = require('../utils/email');

class NotificationService {
  constructor() {
    this.notificationTypes = {
      ORDER_STATUS: 'order_status',
      PAYMENT: 'payment',
      SHIPPING: 'shipping',
      SECURITY: 'security',
      PROMOTIONAL: 'promotional',
      SYSTEM: 'system'
    };

    this.priorityLevels = {
      LOW: 'low',
      NORMAL: 'normal',
      HIGH: 'high',
      URGENT: 'urgent'
    };

    this.deliveryChannels = {
      IN_APP: 'in_app',
      EMAIL: 'email',
      SMS: 'sms',
      PUSH: 'push'
    };
  }

  // Create a new notification
  async createNotification(data) {
    try {
      const {
        userId,
        type,
        title,
        message,
        priority = this.priorityLevels.NORMAL,
        channels = [this.deliveryChannels.IN_APP],
        metadata = {},
        expiresAt = null,
        readAt = null
      } = data;

      const notification = {
        id: this.generateNotificationId(),
        userId,
        type,
        title,
        message,
        priority,
        channels,
        metadata,
        isRead: false,
        readAt,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store notification in unifiedStore
      const cacheKey = `notifications:${userId}:${notification.id}`;
      await unifiedStore.setCache(cacheKey, notification, 86400 * 30); // 30 days

      // Add to user's notification list
      await this.addToUserNotifications(userId, notification.id);

      // Send notifications through specified channels
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Get user notifications with pagination and filtering
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = null,
        isRead = null,
        priority = null
      } = options;

      const cacheKey = `notifications:user:${userId}:${page}:${limit}:${type}:${isRead}:${priority}`;
      
      // Try cache first
      const cached = await unifiedStore.getCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get user's notification IDs
      const userNotificationsKey = `user_notifications:${userId}`;
      const notificationIds = await unifiedStore.getCache(userNotificationsKey) || [];

      if (notificationIds.length === 0) {
        const emptyResult = {
          notifications: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
          hasPrevPage: false
        };
        
        await unifiedStore.setCache(cacheKey, emptyResult, 300); // Cache for 5 minutes
        return emptyResult;
      }

      // Fetch notification details
      const notifications = [];
      for (const notificationId of notificationIds) {
        const notification = await unifiedStore.getCache(`notifications:${userId}:${notificationId}`);
        if (notification) {
          notifications.push(notification);
        }
      }

      // Apply filters
      let filteredNotifications = notifications;

      if (type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === type);
      }

      if (isRead !== null) {
        filteredNotifications = filteredNotifications.filter(n => n.isRead === isRead);
      }

      if (priority) {
        filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
      }

      // Sort by creation date (newest first)
      filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination
      const total = filteredNotifications.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

      const result = {
        notifications: paginatedNotifications,
        total,
        totalPages,
        currentPage: page,
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1
      };

      // Cache the result
      await unifiedStore.setCache(cacheKey, result, 300); // Cache for 5 minutes

      return result;
    } catch (error) {
      throw new Error(`Error getting user notifications: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const cacheKey = `notifications:${userId}:${notificationId}`;
      const notification = await unifiedStore.getCache(cacheKey);

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Update notification
      notification.isRead = true;
      notification.readAt = new Date();
      notification.updatedAt = new Date();

      // Update cache
      await unifiedStore.setCache(cacheKey, notification, 86400 * 30); // 30 days

      // Invalidate user notifications cache
      await this.invalidateUserNotificationsCache(userId);

      return notification;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const userNotificationsKey = `user_notifications:${userId}`;
      const notificationIds = await unifiedStore.getCache(userNotificationsKey) || [];

      const updatePromises = notificationIds.map(async (notificationId) => {
        const cacheKey = `notifications:${userId}:${notificationId}`;
        const notification = await unifiedStore.getCache(cacheKey);
        
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date();
          notification.updatedAt = new Date();
          
          await unifiedStore.setCache(cacheKey, notification, 86400 * 30);
        }
      });

      await Promise.all(updatePromises);

      // Invalidate user notifications cache
      await this.invalidateUserNotificationsCache(userId);

      return { message: 'All notifications marked as read' };
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const cacheKey = `notifications:${userId}:${notificationId}`;
      const notification = await unifiedStore.getCache(cacheKey);

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Remove from user's notification list
      await this.removeFromUserNotifications(userId, notificationId);

      // Delete notification cache
      await unifiedStore.deleteCache(cacheKey);

      // Invalidate user notifications cache
      await this.invalidateUserNotificationsCache(userId);

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const cacheKey = `notifications:unread_count:${userId}`;
      
      // Try cache first
      const cached = await unifiedStore.getCache(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const userNotificationsKey = `user_notifications:${userId}`;
      const notificationIds = await unifiedStore.getCache(userNotificationsKey) || [];

      let unreadCount = 0;
      for (const notificationId of notificationIds) {
        const notification = await unifiedStore.getCache(`notifications:${userId}:${notificationId}`);
        if (notification && !notification.isRead) {
          unreadCount++;
        }
      }

      // Cache the count for 5 minutes
      await unifiedStore.setCache(cacheKey, unreadCount, 300);

      return unreadCount;
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  // Create order status notification
  async createOrderStatusNotification(userId, orderData, status) {
    try {
      const statusMessages = {
        'pending': 'Your order has been placed and is being processed',
        'confirmed': 'Your order has been confirmed and is being prepared',
        'processing': 'Your order is being prepared for shipment',
        'shipped': 'Your order has been shipped and is on its way',
        'delivered': 'Your order has been delivered successfully',
        'cancelled': 'Your order has been cancelled',
        'refunded': 'Your order has been refunded'
      };

      const message = statusMessages[status] || `Your order status has been updated to: ${status}`;
      
      const notification = await this.createNotification({
        userId,
        type: this.notificationTypes.ORDER_STATUS,
        title: `Order ${orderData.orderNumber || orderData.id} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message,
        priority: status === 'cancelled' || status === 'refunded' ? this.priorityLevels.HIGH : this.priorityLevels.NORMAL,
        channels: [this.deliveryChannels.IN_APP, this.deliveryChannels.EMAIL],
        metadata: {
          orderId: orderData.id,
          orderNumber: orderData.orderNumber,
          status,
          total: orderData.total
        }
      });

      return notification;
    } catch (error) {
      throw new Error(`Error creating order status notification: ${error.message}`);
    }
  }

  // Create payment notification
  async createPaymentNotification(userId, paymentData) {
    try {
      const { status, amount, orderId, orderNumber } = paymentData;
      
      let title, message, priority;
      
      switch (status) {
        case 'successful':
          title = 'Payment Successful';
          message = `Your payment of $${amount} for order ${orderNumber} has been processed successfully.`;
          priority = this.priorityLevels.NORMAL;
          break;
        case 'failed':
          title = 'Payment Failed';
          message = `Your payment of $${amount} for order ${orderNumber} has failed. Please try again.`;
          priority = this.priorityLevels.HIGH;
          break;
        case 'pending':
          title = 'Payment Pending';
          message = `Your payment of $${amount} for order ${orderNumber} is being processed.`;
          priority = this.priorityLevels.NORMAL;
          break;
        default:
          title = 'Payment Update';
          message = `Your payment status has been updated to: ${status}`;
          priority = this.priorityLevels.NORMAL;
      }

      const notification = await this.createNotification({
        userId,
        type: this.notificationTypes.PAYMENT,
        title,
        message,
        priority,
        channels: [this.deliveryChannels.IN_APP, this.deliveryChannels.EMAIL],
        metadata: {
          orderId,
          orderNumber,
          amount,
          status
        }
      });

      return notification;
    } catch (error) {
      throw new Error(`Error creating payment notification: ${error.message}`);
    }
  }

  // Create security notification
  async createSecurityNotification(userId, securityEvent) {
    try {
      const { type, details, ipAddress, location } = securityEvent;
      
      let title, message, priority;
      
      switch (type) {
        case 'login':
          title = 'New Login Detected';
          message = `New login from ${location || 'unknown location'} (IP: ${ipAddress}). If this wasn't you, please secure your account.`;
          priority = this.priorityLevels.HIGH;
          break;
        case 'password_change':
          title = 'Password Changed';
          message = 'Your password has been changed successfully. If this wasn't you, please contact support immediately.';
          priority = this.priorityLevels.HIGH;
          break;
        case 'suspicious_activity':
          title = 'Suspicious Activity Detected';
          message = 'We detected suspicious activity on your account. Please review and secure your account.';
          priority = this.priorityLevels.URGENT;
          break;
        default:
          title = 'Security Alert';
          message = 'A security event has occurred on your account.';
          priority = this.priorityLevels.HIGH;
      }

      const notification = await this.createNotification({
        userId,
        type: this.notificationTypes.SECURITY,
        title,
        message,
        priority,
        channels: [this.deliveryChannels.IN_APP, this.deliveryChannels.EMAIL],
        metadata: {
          securityEvent: type,
          ipAddress,
          location,
          timestamp: new Date()
        }
      });

      return notification;
    } catch (error) {
      throw new Error(`Error creating security notification: ${error.message}`);
    }
  }

  // Create promotional notification
  async createPromotionalNotification(userId, promoData) {
    try {
      const { type, title, message, discount, expiryDate } = promoData;
      
      const notification = await this.createNotification({
        userId,
        type: this.notificationTypes.PROMOTIONAL,
        title: title || 'Special Offer Just for You!',
        message: message || `Don't miss out on this exclusive offer! ${discount ? `Save ${discount} on your next purchase.` : ''}`,
        priority: this.priorityLevels.LOW,
        channels: [this.deliveryChannels.IN_APP, this.deliveryChannels.EMAIL],
        metadata: {
          promoType: type,
          discount,
          expiryDate,
          isPromotional: true
        },
        expiresAt: expiryDate
      });

      return notification;
    } catch (error) {
      throw new Error(`Error creating promotional notification: ${error.message}`);
    }
  }

  // Send notification through specified channels
  async sendNotification(notification) {
    try {
      const sendPromises = notification.channels.map(async (channel) => {
        switch (channel) {
          case this.deliveryChannels.EMAIL:
            return await this.sendEmailNotification(notification);
          case this.deliveryChannels.SMS:
            return await this.sendSMSNotification(notification);
          case this.deliveryChannels.PUSH:
            return await this.sendPushNotification(notification);
          default:
            console.log(`Unknown delivery channel: ${channel}`);
            return false;
        }
      });

      const results = await Promise.allSettled(sendPromises);
      
      // Log delivery results
      results.forEach((result, index) => {
        const channel = notification.channels[index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${channel} notification sent for user ${notification.userId}`);
        } else {
          console.error(`❌ ${channel} notification failed for user ${notification.userId}:`, result.reason);
        }
      });

      return results;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send email notification
  async sendEmailNotification(notification) {
    try {
      // Get user email from user service
      const UserService = require('./userService');
      const userService = new UserService();
      const user = await userService.getUserById(notification.userId);
      
      if (!user || !user.email) {
        console.warn(`No email found for user ${notification.userId}`);
        return false;
      }

      const emailData = {
        to: user.email,
        subject: notification.title,
        template: 'notification',
        context: {
          userName: user.firstName || user.name || 'User',
          notificationTitle: notification.title,
          notificationMessage: notification.message,
          notificationType: notification.type,
          priority: notification.priority,
          createdAt: notification.createdAt,
          actionUrl: this.generateActionUrl(notification),
          unsubscribeUrl: this.generateUnsubscribeUrl(user.id)
        }
      };

      await emailService.sendEmail(emailData);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Send SMS notification (placeholder for future implementation)
  async sendSMSNotification(notification) {
    try {
      // TODO: Implement SMS service integration
      console.log(`SMS notification would be sent: ${notification.message}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }

  // Send push notification (placeholder for future implementation)
  async sendPushNotification(notification) {
    try {
      // TODO: Implement push notification service integration
      console.log(`Push notification would be sent: ${notification.message}`);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Generate action URL for notification
  generateActionUrl(notification) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    switch (notification.type) {
      case this.notificationTypes.ORDER_STATUS:
        return `${baseUrl}/orders/${notification.metadata?.orderId}`;
      case this.notificationTypes.PAYMENT:
        return `${baseUrl}/orders/${notification.metadata?.orderId}`;
      case this.notificationTypes.SECURITY:
        return `${baseUrl}/profile/security`;
      case this.notificationTypes.PROMOTIONAL:
        return `${baseUrl}/products?promo=${notification.metadata?.promoType}`;
      default:
        return baseUrl;
    }
  }

  // Generate unsubscribe URL
  generateUnsubscribeUrl(userId) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return `${baseUrl}/profile/notifications?unsubscribe=${userId}`;
  }

  // Add notification to user's notification list
  async addToUserNotifications(userId, notificationId) {
    try {
      const userNotificationsKey = `user_notifications:${userId}`;
      let notificationIds = await unifiedStore.getCache(userNotificationsKey) || [];
      
      // Add to beginning of array (newest first)
      notificationIds.unshift(notificationId);
      
      // Limit to 1000 notifications per user
      if (notificationIds.length > 1000) {
        notificationIds = notificationIds.slice(0, 1000);
      }
      
      await unifiedStore.setCache(userNotificationsKey, notificationIds, 86400 * 30); // 30 days
    } catch (error) {
      console.error('Error adding notification to user list:', error);
    }
  }

  // Remove notification from user's notification list
  async removeFromUserNotifications(userId, notificationId) {
    try {
      const userNotificationsKey = `user_notifications:${userId}`;
      let notificationIds = await unifiedStore.getCache(userNotificationsKey) || [];
      
      notificationIds = notificationIds.filter(id => id !== notificationId);
      
      await unifiedStore.setCache(userNotificationsKey, notificationIds, 86400 * 30); // 30 days
    } catch (error) {
      console.error('Error removing notification from user list:', error);
    }
  }

  // Invalidate user notifications cache
  async invalidateUserNotificationsCache(userId) {
    try {
      const patterns = [
        `notifications:user:${userId}:*`,
        `notifications:unread_count:${userId}`
      ];
      
      for (const pattern of patterns) {
        await unifiedStore.clearCache(pattern);
      }
    } catch (error) {
      console.error('Error invalidating user notifications cache:', error);
    }
  }

  // Generate unique notification ID
  generateNotificationId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `notif_${timestamp}_${random}`;
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      // This would need to be implemented based on your data structure
      // For now, we'll just log that cleanup is needed
      console.log('Cleanup of expired notifications would run here');
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats(userId = null) {
    try {
      const stats = {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {},
        byChannel: {}
      };

      if (userId) {
        // Get user-specific stats
        const userNotificationsKey = `user_notifications:${userId}`;
        const notificationIds = await unifiedStore.getCache(userNotificationsKey) || [];
        
        for (const notificationId of notificationIds) {
          const notification = await unifiedStore.getCache(`notifications:${userId}:${notificationId}`);
          if (notification) {
            stats.total++;
            if (!notification.isRead) stats.unread++;
            
            // Count by type
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
            
            // Count by priority
            stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
            
            // Count by channel
            notification.channels.forEach(channel => {
              stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
            });
          }
        }
      }

      return stats;
    } catch (error) {
      throw new Error(`Error getting notification stats: ${error.message}`);
    }
  }
}

module.exports = NotificationService;
