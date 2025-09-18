import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import notificationService from '../../services/notificationService';
import { toast } from 'react-hot-toast';

const NotificationBell = () => {
  const { t } = useTranslation('ecommerce');
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // Load notifications when component mounts
  useEffect(() => {
    let unsubscribe;
    if (user && !disabled) {
      loadNotifications();
      initializeNotificationService().then((fn) => {
        unsubscribe = fn;
      });
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user, disabled]);

  // Initialize notification service
  const initializeNotificationService = useCallback(async () => {
    try {
      await notificationService.initialize();
      
      // Subscribe to notification updates
      const unsubscribe = notificationService.subscribe(({ notifications: updatedNotifications, unreadCount: updatedUnreadCount }) => {
        setNotifications(updatedNotifications);
        setUnreadCount(updatedUnreadCount);
      });

      // Cleanup subscription on unmount
      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await notificationService.getNotifications();
      setNotifications(result.notifications || []);
      setUnreadCount(result.total || 0);
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
      if (error?.response?.status === 404) {
        setDisabled(true);
        notificationService.cleanup();
      } else {
        toast.error('Failed to load notifications');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.metadata?.actionUrl) {
      window.location.href = notification.metadata.actionUrl;
    }

    setIsOpen(false);
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_status':
        return '📦';
      case 'payment':
        return '💳';
      case 'shipping':
        return '🚚';
      case 'security':
        return '🔒';
      case 'promotional':
        return '🎉';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  // Get notification priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (!user || disabled) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('notifications.title')}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                      !notification.isRead ? getPriorityColor(notification.priority) : 'border-l-transparent'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete notification"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                          {notification.priority !== 'normal' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  {t('notifications.markAllRead')}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 