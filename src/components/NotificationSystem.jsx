import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../utils/api';

const NotificationSystem = ({ isOpen, onClose, userType = 'traveler' }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch real notifications from backend
  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) return;

      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      } else {
        // Fallback to mock notifications if API fails
        setNotifications(getMockNotifications());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock notifications
      setNotifications(getMockNotifications());
    }
  };

  const getMockNotifications = () => {
    return userType === 'traveler' ? [
      {
        id: 1,
        type: 'message',
        title: 'New Message from Safari Lodge',
        content: 'Your booking confirmation for Serengeti Safari Lodge is ready.',
        timestamp: new Date(Date.now() - 1800000),
        read: false,
        urgent: false,
        icon: 'MessageCircle'
      },
      {
        id: 2,
        type: 'booking',
        title: 'Booking Confirmed',
        content: 'Your Kilimanjaro trek booking has been confirmed for March 15-20.',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        urgent: true,
        icon: 'CheckCircle'
      },
      {
        id: 3,
        type: 'ai',
        title: 'AI Recommendation',
        content: 'Based on your interests, we found 3 new cultural experiences you might like.',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        urgent: false,
        icon: 'Bot'
      },
      {
        id: 4,
        type: 'system',
        title: 'Travel Document Reminder',
        content: 'Don\'t forget to upload your passport copy for your upcoming trip.',
        timestamp: new Date(Date.now() - 86400000),
        read: false,
        urgent: false,
        icon: 'FileText'
      },
      {
        id: 5,
        type: 'message',
        title: 'Response from Tour Guide',
        content: 'Your tour guide has answered your question about the itinerary.',
        timestamp: new Date(Date.now() - 172800000),
        read: true,
        urgent: false,
        icon: 'MessageCircle'
      }
    ] : [
      {
        id: 1,
        type: 'order',
        title: 'New Booking Request',
        content: 'John Doe has requested to book your Serengeti Safari package.',
        timestamp: new Date(Date.now() - 900000),
        read: false,
        urgent: true,
        icon: 'Calendar'
      },
      {
        id: 2,
        type: 'message',
        title: 'Customer Message',
        content: 'Sarah Johnson sent you a message about accommodation options.',
        timestamp: new Date(Date.now() - 2700000),
        read: false,
        urgent: false,
        icon: 'MessageCircle'
      },
      {
        id: 3,
        type: 'order',
        title: 'Unanswered Booking',
        content: 'Booking request from Mike Wilson is still pending your response.',
        timestamp: new Date(Date.now() - 5400000),
        read: false,
        urgent: true,
        icon: 'AlertCircle'
      },
      {
        id: 4,
        type: 'payment',
        title: 'Payment Received',
        content: 'Payment of $1,250 received for Zanzibar Beach Resort booking.',
        timestamp: new Date(Date.now() - 10800000),
        read: true,
        urgent: false,
        icon: 'DollarSign'
      },
      {
        id: 5,
        type: 'system',
        title: 'Service Performance',
        content: 'Your Kilimanjaro Trek service has received 5 new positive reviews.',
        timestamp: new Date(Date.now() - 86400000),
        read: true,
        urgent: false,
        icon: 'Star'
      },
      {
        id: 6,
        type: 'message',
        title: 'Customer Inquiry',
        content: 'Emma Thompson is asking about group discounts for your safari package.',
        timestamp: new Date(Date.now() - 172800000),
        read: false,
        urgent: false,
        icon: 'MessageCircle'
      }
    ];
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'urgent') return notification.urgent;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getFilterOptions = () => {
    if (userType === 'traveler') {
      return [
        { value: 'all', label: 'All', icon: 'List' },
        { value: 'unread', label: 'Unread', icon: 'Mail' },
        { value: 'urgent', label: 'Urgent', icon: 'AlertTriangle' },
        { value: 'message', label: 'Messages', icon: 'MessageCircle' },
        { value: 'booking', label: 'Bookings', icon: 'Calendar' },
        { value: 'ai', label: 'AI Tips', icon: 'Bot' }
      ];
    } else {
      return [
        { value: 'all', label: 'All', icon: 'List' },
        { value: 'unread', label: 'Unread', icon: 'Mail' },
        { value: 'urgent', label: 'Urgent', icon: 'AlertTriangle' },
        { value: 'order', label: 'Orders', icon: 'ShoppingBag' },
        { value: 'message', label: 'Messages', icon: 'MessageCircle' },
        { value: 'payment', label: 'Payments', icon: 'DollarSign' }
      ];
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="Bell" size={24} className="text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {notifications.filter(n => !n.read).length} unread notifications
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {getFilterOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon name={option.icon} size={14} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Icon name="Bell" size={48} className="text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">No notifications</h4>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You're all caught up!" 
                  : `No ${filter} notifications found.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      notification.urgent 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon name={notification.icon} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block"></span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Icon name="Check" size={14} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
