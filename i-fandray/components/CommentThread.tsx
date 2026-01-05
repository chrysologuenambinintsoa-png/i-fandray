'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/TranslationProvider';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
  parentId?: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
  };
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  onCommentAdded?: () => void;
}

function CommentItem({
  comment,
  postId,
  depth = 0,
  onReply,
}: {
  comment: Comment;
  postId: string;
  depth?: number;
  onReply?: (parentId: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId: comment.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      setReplyContent('');
      setShowReplyForm(false);
      // Refresh comments would be handled by parent component
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxDepth = 3; // Limit nesting depth
  const canReply = depth < maxDepth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex space-x-3 ${depth > 0 ? 'ml-8 mt-3' : 'mt-3'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {comment.author?.firstName?.[0] || 'U'}
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <p className="text-sm font-semibold text-gray-900">
            {comment.author?.firstName} {comment.author?.lastName}
            {comment.author?.isVerified && (
              <span className="ml-1 text-blue-500">✓</span>
            )}
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{formatDate(comment.createdAt)}</span>
          {canReply && (
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="hover:text-gray-700 transition-colors"
              aria-label={t('comment.reply') || 'Reply to comment'}
            >
              {t('comment.reply') || 'Reply'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex space-x-3"
            >
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {user?.firstName?.[0] || 'Y'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleReply()}
                  placeholder={t('comment.writeReply') || 'Write a reply...'}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('comment.sendReply') || 'Post reply'}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showReplies ? (t('comment.hideReplies') || 'Hide replies') : `${t('comment.viewReplies') || 'View'} ${comment.replies?.length || 0} ${t('comment.replies') || 'replies'}`}
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  <span>{t('comment.hideReplies') || 'Hide replies'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>
                    {t('comment.viewReplies') || 'View'} {comment.replies.length} {t('comment.replies') || 'replies'}
                  </span>
                </>
              )}
            </button>

            <AnimatePresence>
              {showReplies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-3"
                >
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      depth={depth + 1}
                      onReply={onReply}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CommentThread({ comments, postId, onCommentAdded }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0] || 'Y'}
            </div>
          )}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleAddComment()}
            placeholder={t('comment.writeComment') || 'Write a comment...'}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={isSubmitting ? (t('post.posting') || 'Posting comment...') : (t('post.post') || 'Post comment')}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t('post.post') || 'Post'
            )}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
          />
        ))}
      </div>
    </div>
  );
}
