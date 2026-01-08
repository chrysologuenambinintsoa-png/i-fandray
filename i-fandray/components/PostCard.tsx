'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageCircle, Share2, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { Post } from '@/types';
import { formatNumber, formatDate, cn, isVideo } from '@/lib/utils';
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
  onShare,
  onEdit,
  onDelete,
  onReport,
  showFullContent = false,
}: PostCardProps) {
  const [likes, setLikes] = useState<number>(post._count?.likes ?? 0);
  const [comments, setComments] = useState(post.comments ?? []);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  const reactions = [
    { emoji: '👍', label: t('reactions.like') ?? 'Like', color: 'text-blue-600' },
    { emoji: '🤝', label: t('reactions.solidarity') ?? 'Solidarity', color: 'text-green-600' },
    { emoji: '❤️', label: t('reactions.love') ?? 'Love', color: 'text-red-600' },
    { emoji: '😢', label: t('reactions.sad') ?? 'Sad', color: 'text-blue-500' },
    { emoji: '😲', label: t('reactions.wow') ?? 'Wow', color: 'text-purple-600' },
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
    <article className="card overflow-hidden mb-4 group relative transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
      {/* Dynamic gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-teal-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

      {/* Animated background elements */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
      </div>

      {/* Main content */}
      <div className="relative">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {post.author?.avatar ? (
            <div className="relative">
              <img
                src={post.author.avatar}
                alt={`${post.author.firstName} ${post.author.lastName}`}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all duration-300">
                {post.author?.firstName?.[0] ?? 'U'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
            </div>
          )}
          <div>
            <p className="font-semibold text-card-foreground group-hover:text-blue-600 transition-colors duration-300">
              {post.author?.firstName} {post.author?.lastName}
            </p>
            <p className="text-sm text-muted-foreground group-hover:text-green-600 transition-colors duration-300">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptions((s) => !s)}
            className="text-muted-foreground hover:text-card-foreground p-1 rounded focus:outline-none"
            title={t('post.moreOptions')}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptions && (
            <div id={`post-options-${post.id}`} role="menu" className="absolute right-0 mt-1 w-40 card py-1 z-50">
              {currentUser?.id === post.author?.id && (
                <button
                  role="menuitem"
                  onClick={() => { setShowOptions(false); handleDelete(); }}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-red-600"
                >
                  Supprimer
                </button>
              )}
              {onEdit && currentUser?.id === post.author?.id && (
                <button
                  role="menuitem"
                  onClick={() => { setShowOptions(false); onEdit?.(post.id); }}
                  className="w-full text-left px-4 py-2 hover:bg-muted"
                >
                  Modifier
                </button>
              )}
              <button
                role="menuitem"
                onClick={() => { setShowOptions(false); onReport?.(post.id); }}
                className="w-full text-left px-4 py-2 hover:bg-muted"
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
          <p className="text-card-foreground mb-3 whitespace-pre-wrap">
            {showFullContent ? post.content : post.content.slice(0, 200)}
            {!showFullContent && post.content.length > 200 && '...'}
          </p>
        )}

        {/* Feeling, Location, Tags */}
        {(post.feeling ?? post.location ?? (post.tags && post.tags.length > 0)) && (
          <div className="text-sm text-muted-foreground mb-3">
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
                    alt={media.alt ?? `Post media ${index + 1}`}
                    className={`post-media rounded-lg`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
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
          <span>{formatNumber(post._count?.shares ?? 0)} {t('post.shares')}</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-border">
        <ReactionButton
          reactions={reactions}
          selectedReaction={selectedReaction}
          onReaction={handleReaction}
          showReactions={showReactions}
          onToggleReactions={handleLike}
        />

        <div className="flex items-center justify-around mt-4">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg border border-white/10',
              selectedReaction
                ? 'bg-gradient-to-r from-green-500/30 via-blue-500/30 to-teal-500/30 text-white backdrop-blur-sm ring-2 ring-green-500/50'
                : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-gradient-to-r hover:from-blue-500/20 hover:via-green-500/20 hover:to-teal-500/20 hover:text-white'
            )}
          >
            {selectedReaction ? (
              <span className="text-lg animate-bounce">{selectedReaction}</span>
            ) : (
              <ThumbsUp className="w-5 h-5 group-hover:text-blue-300 transition-colors duration-300" />
            )}
            <span className="text-sm font-semibold">
              {selectedReaction ? t('post.reacted') : t('post.like')}
            </span>
          </button>

          <button
            onClick={handleComment}
            className="flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-110 bg-white/10 backdrop-blur-sm text-white/80 hover:bg-gradient-to-r hover:from-green-500/20 hover:via-teal-500/20 hover:to-blue-500/20 hover:text-white shadow-lg hover:shadow-xl border border-white/10"
          >
            <MessageCircle className="w-5 h-5 group-hover:text-green-300 transition-colors duration-300" />
            <span className="text-sm font-semibold">Comment</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-110 bg-white/10 backdrop-blur-sm text-white/80 hover:bg-gradient-to-r hover:from-teal-500/20 hover:via-blue-500/20 hover:to-indigo-500/20 hover:text-white shadow-lg hover:shadow-xl border border-white/10"
            >
              <Share2 className="w-5 h-5 group-hover:text-teal-300 transition-colors duration-300" />
              <span className="text-sm font-semibold">Share</span>
            </button>
            {showShareOptions && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 w-48 card py-1 z-50">
                <button
                  onClick={() => { setShowShareOptions(false); onShare?.(post.id, 'message'); }}
                  className="w-full text-left px-4 py-2 hover:bg-muted"
                >
                  Partager en message
                </button>
                <button
                  onClick={() => { setShowShareOptions(false); onShare?.(post.id, 'group'); }}
                  className="w-full text-left px-4 py-2 hover:bg-muted"
                >
                  Partager dans un groupe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t border-border pt-4">
            <CommentThread
              comments={comments}
              postId={post.id}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        )}
      </div>
    </div>
    </article>
  );
}
