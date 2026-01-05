'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageCircle, Share2, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { Post } from '@/types';
import { formatNumber, formatDate, getMediaExtension, isVideo, isImage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/TranslationProvider';
import { ReactionButton } from './ReactionButton';
import { CommentThread } from './CommentThread';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string, type?: 'message' | 'group') => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showFullContent?: boolean;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onReport,
  showFullContent = false,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState<number>(post._count?.likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  const reactions = [
    { emoji: '👍', label: t('reactions.like') || 'Like', color: 'text-blue-600' },
    { emoji: '🤝', label: t('reactions.solidarity') || 'Solidarity', color: 'text-green-600' },
    { emoji: '❤️', label: t('reactions.love') || 'Love', color: 'text-red-600' },
    { emoji: '😢', label: t('reactions.sad') || 'Sad', color: 'text-blue-500' },
    { emoji: '😲', label: t('reactions.wow') || 'Wow', color: 'text-purple-600' },
  ];

  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleReaction = async (reaction: string) => {
    const previousReaction = selectedReaction;
    const wasLiked = selectedReaction !== null;

    if (selectedReaction === reaction) {
      // Remove reaction
      setSelectedReaction(null);
      setLikes(prev => Math.max(0, prev - 1));
    } else {
      // Change or add reaction
      if (selectedReaction) {
        setLikes(prev => Math.max(0, prev - 1));
      }
      setSelectedReaction(reaction);
      setLikes(prev => prev + 1);
    }
    setShowReactions(false);

    // API call for reaction
    try {
      const response = await fetch(`/api/posts/${post.id}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: selectedReaction === reaction ? null : reaction }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert on error
      setSelectedReaction(previousReaction);
      setLikes(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    }

    onLike?.(post.id);
  };

  const handleLike = () => {
    setShowReactions(!showReactions);
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const handleDelete = async () => {
    const ok = confirm('Supprimer cette publication ? Cette action est irréversible.');
    if (!ok) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onDelete?.(post.id);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Impossible de supprimer la publication.');
    }
  };

  const handleCommentAdded = () => {
    // Refresh comments
    fetchComments();
  };

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, comments.length, fetchComments]);

  return (
    <article className="card fancy-gradient overflow-hidden mb-4">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
              {post.author?.firstName?.[0] || 'U'}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {post.author?.firstName} {post.author?.lastName}
            </p>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptions((s) => !s)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none"
            title={t('post.moreOptions')}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptions && (
            <div id={`post-options-${post.id}`} role="menu" className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {currentUser?.id === post.author?.id && (
                <button
                  role="menuitem"
                  onClick={() => { setShowOptions(false); handleDelete(); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Supprimer
                </button>
              )}
              {onEdit && currentUser?.id === post.author?.id && (
                <button
                  role="menuitem"
                  onClick={() => { setShowOptions(false); onEdit?.(post.id); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Modifier
                </button>
              )}
              <button
                role="menuitem"
                onClick={() => { setShowOptions(false); onReport?.(post.id); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Signaler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        {post.content && (
          <p className="text-gray-900 mb-3 whitespace-pre-wrap">
            {showFullContent ? post.content : post.content.slice(0, 200)}
            {!showFullContent && post.content.length > 200 && '...'}
          </p>
        )}

        {/* Feeling, Location, Tags */}
        {(post.feeling || post.location || (post.tags && post.tags.length > 0)) && (
          <div className="text-sm text-gray-600 mb-3">
            {post.feeling && (
              <span className="mr-2">
                is feeling <span className="font-medium">{post.feeling}</span>
              </span>
            )}
            {post.location && (
              <span className="mr-2">
                at <span className="font-medium">{post.location}</span>
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <span>
                with <span className="font-medium">{post.tags.join(', ')}</span>
              </span>
            )}
          </div>
        )}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-3">
            {post.media.map((media, index) => (
              <div key={index} className="relative">
                {isVideo(media.url) ? (
                  <video
                    src={media.url}
                    controls
                    className={`post-media rounded-lg`}
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={media.alt || `Post media ${index + 1}`}
                    className={`post-media rounded-lg`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-3 h-3 text-white" />
            </div>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <span>{formatNumber(likes)}</span>
        </div>
        <div className="flex space-x-4">
          <span>{formatNumber(comments.length)} {t('post.comments')}</span>
          <span>{formatNumber(post._count?.shares || 0)} {t('post.shares')}</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <ReactionButton
          reactions={reactions}
          selectedReaction={selectedReaction}
          onReaction={handleReaction}
          showReactions={showReactions}
          onToggleReactions={handleLike}
        />

        <div className="flex items-center justify-around mt-2">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-full transition-transform transform hover:scale-105 shadow-sm',
              selectedReaction ? 'bg-white/10 text-blue-200' : 'bg-white/0 text-gray-700'
            )}
          >
            {selectedReaction ? (
              <span className="text-lg">{selectedReaction}</span>
            ) : (
              <ThumbsUp className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {selectedReaction ? t('post.reacted') : t('post.like')}
            </span>
          </button>

          <button
            onClick={handleComment}
            className="flex items-center space-x-2 px-4 py-2 rounded-full transition-transform transform hover:scale-105 text-gray-700"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full transition-transform transform hover:scale-105 text-gray-700"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
            {showShareOptions && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => { setShowShareOptions(false); onShare?.(post.id, 'message'); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Partager en message
                </button>
                <button
                  onClick={() => { setShowShareOptions(false); onShare?.(post.id, 'group'); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Partager dans un groupe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <CommentThread
              comments={comments}
              postId={post.id}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        )}
      </div>
    </article>
  );
}
