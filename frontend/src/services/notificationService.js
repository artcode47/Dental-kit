import api from './api';
import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.isInitialized = false;
    this.pollingInterval = null;
    this.listeners = new Set();
  }

  // Initialize the notification service
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load initial notifications
      await this.loadNotifications();
      
      // Start polling for new notifications
      this.startPolling();
      
      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  // Load notifications from backend
  async loadNotifications(options = {}) {
    try {
      const response = await api.get('/notifications', { params: options });
      
      if (response?.data) {
        this.notifications = response.data.notifications || [];
        this.unreadCount = response.data.total || 0;
        this.notifyListeners();
      }
      
      return response.data || { notifications: [], total: 0 };
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
      // Rethrow so callers (e.g., UI) can react (disable polling on 404)
      throw error;
    }
  }

  // Get notifications with caching
  async getNotifications(options = {}) {
    // Return cached notifications if available and recent
    if (this.notifications.length > 0 && !options.forceRefresh) {
      return {
        notifications: this.notifications,
        total: this.notifications.length,
        totalPages: 1,
        currentPage: 1
      };
    }

    return await this.loadNotifications(options);
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.success) {
        this.unreadCount = response.data.count || 0;
        this.notifyListeners();
        return this.unreadCount;
      }
      return 0;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      
      if (response.success) {
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.notifyListeners();
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/read-all');
      
      if (response.success) {
        // Update local state
        this.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
          }
        });
        
        this.unreadCount = 0;
        this.notifyListeners();
        
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response.success) {
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.notifyListeners();
        
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      throw error;
    }
  }

  // Create a local notification (for immediate feedback)
  createLocalNotification(data) {
    const notification = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      isRead: false,
      createdAt: new Date(),
      isLocal: true
    };

    this.notifications.unshift(notification);
    if (!notification.isRead) {
      this.unreadCount++;
    }
    
    this.notifyListeners();
    
    // Show toast notification
    if (data.showToast !== false) {
      toast.success(data.message || data.title);
    }
    
    return notification;
  }

  // Start polling for new notifications
  startPolling(interval = 30000) { // 30 seconds
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(async () => {
      try {
        await this.loadNotifications({ forceRefresh: true });
      } catch (error) {
        console.error('❌ Notification polling error:', error);
        // Stop polling if backend doesn't support notifications
        if (error?.response?.status === 404) {
          this.stopPolling();
        }
      }
    }, interval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Subscribe to notification updates
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({
          notifications: this.notifications,
          unreadCount: this.unreadCount
        });
      } catch (error) {
        console.error('❌ Notification listener error:', error);
      }
    });
  }

  // Get notification statistics
  async getStats() {
    try {
      const response = await api.get('/notifications/stats');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('❌ Failed to get notification stats:', error);
      return null;
    }
  }

  // Update notification preferences
  async updatePreferences(preferences) {
    try {
      const response = await api.patch('/notifications/preferences', preferences);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('❌ Failed to update notification preferences:', error);
      throw error;
    }
  }

  // Cleanup
  cleanup() {
    this.stopPolling();
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
