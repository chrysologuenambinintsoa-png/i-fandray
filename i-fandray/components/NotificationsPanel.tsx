'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/TranslationProvider';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setLocalNotifications(data.notifications.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        })));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action: 'markAsRead' }),
      });
      markAsRead(notificationId);
      setLocalNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' }),
      });
      markAllAsRead();
      setLocalNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      removeNotification(notificationId);
      setLocalNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like_post':
      case 'like_comment':
      case 'like_story':
        return '❤️';
      case 'comment':
      case 'reply_comment':
        return '💬';
      case 'share':
        return '🔗';
      case 'follow':
      case 'friend_request':
      case 'friend_accepted':
        return '👥';
      case 'friend_suggestion':
        return '💡';
      case 'story_reaction':
      case 'comment_reaction':
        return '🎉';
      case 'message':
        return '✉️';
      case 'mention':
        return '@';
      case 'post':
        return '📝';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const senderName = notification.sender
      ? `${notification.sender.firstName} ${notification.sender.lastName}`
      : 'Quelqu\'un';

    switch (notification.type) {
      case 'like_post':
        return `${senderName} a aimé votre publication`;
      case 'like_comment':
        return `${senderName} a aimé votre commentaire`;
      case 'like_story':
        return `${senderName} a aimé votre story`;
      case 'comment':
        return `${senderName} a commenté votre publication`;
      case 'reply_comment':
        return `${senderName} a répondu à votre commentaire`;
      case 'share':
        return `${senderName} a partagé votre publication`;
      case 'follow':
        return `${senderName} vous suit`;
      case 'friend_request':
        return `${senderName} vous a envoyé une demande d'ami`;
      case 'friend_accepted':
        return `${senderName} a accepté votre demande d'ami`;
      case 'friend_suggestion':
        return `Suggestion d'ami : ${senderName}`;
      case 'story_reaction':
        return `${senderName} a réagi à votre story`;
      case 'comment_reaction':
        return `${senderName} a réagi à votre commentaire`;
      case 'message':
        return `${senderName} vous a envoyé un message`;
      case 'mention':
        return `${senderName} vous a mentionné`;
      case 'post':
        return `${senderName} a publié quelque chose`;
      default:
        return notification.content;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div className="card w-96 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary/80 flex items-center space-x-1"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-card-foreground p-1 rounded-full hover:bg-muted"
              title={t('notifications.closeNotifications')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : localNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.sender?.avatar ? (
                        <img
                          src={notification.sender.avatar}
                          alt={notification.sender.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-semibold">
                          {notification.sender?.firstName?.[0] || '?'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-card-foreground">
                        {getNotificationMessage(notification)}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-primary hover:text-primary/80 p-1 rounded"
                          title={t('notifications.markAsRead')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title={t('notifications.delete')}
                      >
                        <X className="w-4 h-4" />
                      </button>
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
}