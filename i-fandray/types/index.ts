export interface User {
  id: string;
  email?: string;
  mobile?: string;
  firstName: string;
  lastName: string;
  username: string;
  name?: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  gender?: string;
  isVerified: boolean;
  isActive: boolean;
  isOnline: boolean;
  lastSeen?: Date;
  language: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  url: string;
  alt?: string;
  type?: string;
}

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  media?: Media[];
  mediaType: 'text' | 'image' | 'video' | 'mixed';
  visibility: 'public' | 'friends' | 'private';
  location?: string;
  feeling?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  pageId?: string;
  page?: Page;
  comments?: Comment[];
  likes?: Like[];
  shares?: Share[];
  _count?: {
    comments: number;
    likes: number;
    shares: number;
  };
  // Sponsored fields
  type?: 'post' | 'sponsored';
  title?: string;
  image?: string;
  externalUrl?: string;
  sponsorName?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  postId: string;
  parentId?: string;
  replies?: Comment[];
}

export interface Like {
  id: string;
  emoji?: string;
  createdAt: Date;
  userId: string;
  user?: User;
  postId?: string;
  commentId?: string;
  storyId?: string;
}

export interface Share {
  id: string;
  content?: string;
  createdAt: Date;
  userId: string;
  user?: User;
  postId: string;
}

export interface Message {
  id: string;
  content: string;
  mediaUrl?: string; // Legacy field
  mediaType?: 'text' | 'image' | 'video' | 'audio'; // Legacy field
  attachments?: Array<{url: string; type: string; name?: string}>;
  isRead: boolean;
  deletedFor?: string[]; // Array of user IDs who deleted this message for themselves
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  conversationId: string;
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: ConversationParticipant[];
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  lastReadAt?: Date;
  isMuted: boolean;
  joinedAt: Date;
  userId: string;
  user?: User;
  conversationId: string;
}

export interface Notification {
  id: string;
  type: 'like_post' | 'like_comment' | 'like_story' | 'comment' | 'reply_comment' | 'share' | 'follow' | 'message' | 'mention' | 'post' | 'friend_request' | 'friend_accepted' | 'story_reaction' | 'comment_reaction' | 'friend_suggestion';
  content: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
  userId: string;
  senderId?: string;
  sender?: User;
}

export interface Story {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number;
  viewers: number;
  createdAt: Date;
  expiresAt: Date;
  authorId: string;
  author?: User;
  reactions?: Like[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  privacy: 'public' | 'private';
  rules?: string;
  category?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creator?: User;
  members?: GroupMember[];
  posts?: GroupPost[];
}

export interface GroupMember {
  id: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  groupId: string;
  group?: Group;
  userId: string;
  user?: User;
}

export interface GroupPost {
  id: string;
  content: string;
  mediaUrl?: string | null | undefined;
  mediaType: string;
  createdAt: Date;
  updatedAt: Date;
  groupId: string;
  group?: Group;
  authorId: string;
  author?: User;
  // Additional fields for compatibility with PostCard
  mediaUrls?: string[];
  media?: Media[];
  visibility?: 'public' | 'friends' | 'private';
  location?: string;
  feeling?: string;
  tags?: string[];
  comments?: Comment[];
  likes?: Like[];
  shares?: Share[];
  _count?: {
    comments: number;
    likes: number;
    shares: number;
  };
}

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  streamUrl: string;
  thumbnailUrl?: string;
  viewerCount: number;
  isLive: boolean;
  startedAt: Date;
  endedAt?: Date;
  userId: string;
  user?: User;
}

export interface Follow {
  id: string;
  createdAt: Date;
  followerId: string;
  follower?: User;
  followingId: string;
  following?: User;
}

export interface FriendRequest {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
}

export interface Friend {
  id: string;
  createdAt: Date;
  userId: string;
  user?: User;
  friendId: string;
  friend?: User;
}

export interface Block {
  id: string;
  createdAt: Date;
  blockerId: string;
  blocker?: User;
  blockedId: string;
  blocked?: User;
}

export interface SponsoredContent {
  id: string;
  title: string;
  content: string;
  image?: string;
  externalUrl: string;
  placement: 'feed' | 'story' | 'group';
  sponsorName: string;
  isSponsored: boolean;
  campaignStart: Date;
  campaignEnd: Date;
  isActive: boolean;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppSettings {
  language: 'fr' | 'en' | 'mg' | 'de' | 'es' | 'ch';
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    messageRequests: boolean;
    showOnlineStatus: boolean;
  };
}

export interface Page {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  category?: string;
  website?: string;
  isVerified: boolean;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creator?: User;
  admins?: PageAdmin[];
  followers?: PageFollower[];
  posts?: Post[];
  _count?: {
    followers: number;
    posts: number;
  };
}

export interface PageAdmin {
  id: string;
  role: string; // 'admin', 'editor'
  joinedAt: Date;
  pageId: string;
  page?: Page;
  userId: string;
  user?: User;
}

export interface PageFollower {
  id: string;
  joinedAt: Date;
  pageId: string;
  page?: Page;
  userId: string;
  user?: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  privacy: 'public' | 'private';
  rules?: string;
  category?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creator?: User;
  members?: GroupMember[];
  posts?: GroupPost[];
}

export interface GroupMember {
  id: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  groupId: string;
  userId: string;
  user?: User;
}

export interface GroupPost {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType: string;
  createdAt: Date;
  updatedAt: Date;
  groupId: string;
  authorId: string;
  author?: User;
  mediaUrls?: string[];
  media?: Media[];
  tags?: string[];
  _count?: {
    likes: number;
    comments: number;
    shares: number;
  };
  likes?: Like[];
  comments?: Comment[];
  shares?: Share[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}