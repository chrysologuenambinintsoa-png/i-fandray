import { NotificationType } from '../types/index';

// Test script to verify notification types and imports
console.log('Testing notification system...');

// Test notification types
const testNotificationTypes: NotificationType[] = [
  'like_post',
  'like_comment',
  'like_story',
  'comment_post',
  'comment_story',
  'reply_comment',
  'share_post',
  'friend_request',
  'friend_accepted',
  'mention',
  'follow',
  'unfollow',
  'post_tag',
  'story_tag',
  'group_invite'
];

console.log('Available notification types:', testNotificationTypes.length);
console.log('All types:', testNotificationTypes);

console.log('✅ Notification types imported successfully');