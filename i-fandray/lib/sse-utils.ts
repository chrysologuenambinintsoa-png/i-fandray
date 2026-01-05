// SSE utility functions for real-time notifications and online status
const clients = new Map<string, (data: string) => void>();

export { clients };

// Function to send notification to specific user
export function sendNotificationToUser(userId: string, notification: any) {
  const sendFunction = clients.get(userId);
  if (sendFunction) {
    try {
      sendFunction(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    } catch (error) {
      console.error('Error sending notification:', error);
      clients.delete(userId);
    }
  }
}

// Function to send online status update to friends
export function sendOnlineStatusUpdateToFriends(userId: string, isOnline: boolean, friends: string[]) {
  const message = isOnline ? "is now online" : "went offline";
  friends.forEach(friendId => {
    const sendFunction = clients.get(friendId);
    if (sendFunction) {
      try {
        sendFunction(JSON.stringify({
          type: 'online_status_update',
          data: { userId, isOnline, message }
        }));
      } catch (error) {
        console.error('Error sending online status update:', error);
        clients.delete(friendId);
      }
    }
  });
}

// Function to send unread count update to user
export function sendUnreadCountToUser(userId: string, unreadCount: number) {
  const sendFunction = clients.get(userId);
  if (sendFunction) {
    try {
      sendFunction(JSON.stringify({
        type: 'unread_count',
        data: { unreadCount }
      }));
    } catch (error) {
      console.error('Error sending unread count:', error);
      clients.delete(userId);
    }
  }
}