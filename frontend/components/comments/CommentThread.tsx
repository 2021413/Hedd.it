import { ThumbsUp, ThumbsDown, MessageCircle, Link2, ChevronDown } from "lucide-react";
import { useState } from "react";
import CommentForm from "./CommentForm";
import { useCommentVote } from "../../hooks/useCommentVote";

export interface Comment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  avatarUrl?: string;
  replies?: Comment[];
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
}

interface CommentThreadProps {
  comment: Comment;
  postId: number;
  onCommentAdded?: () => void;
  /** @description Current depth level (root = 0). Internal use only. */
  depth?: number;
}

/**
 * A recursive comment thread component that cleanly indents replies beneath their parents.
 * - Uses lucide-react for icons.
 * - Supports unlimited nesting.
 * - Keeps a consistent, compact visual rhythm using Tailwind utilities.
 */
export default function CommentThread({
  comment,
  postId,
  onCommentAdded,
  depth = 0,
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const hasReplies = Boolean(comment.replies?.length);
  const containerIndent = depth * 36; // 36px extra left‑margin par niveau

  const {
    voteScore,
    hasUpvoted,
    hasDownvoted,
    isVoting,
    handleVote
  } = useCommentVote({
    commentId: comment.id,
    initialVoteScore: comment.likes,
    initialHasUpvoted: comment.hasUpvoted ?? false,
    initialHasDownvoted: comment.hasDownvoted ?? false,
  });

  return (
    <div className="w-full">
      <div
        className={`flex items-start gap-3 px-2 py-2`}
        style={depth > 0 ? { marginLeft: containerIndent } : {}}
      >
        {/* Avatar */}
        <div className="relative">
          <img
            src={comment.avatarUrl || "/default-avatar.png"}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border border-neutral-700 bg-gray-700"
          />
        </div>

        {/* Comment body */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center mb-1 gap-2">
            <span className="font-semibold text-green-400 text-sm">u/{comment.author}</span>
            <span className="text-xs text-gray-400">• {comment.timeAgo}</span>
          </div>

          {/* Content */}
          <p className="text-gray-200 mb-2 whitespace-pre-line leading-relaxed text-[15px]">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-gray-400 mb-1 select-none">
            {/* Flèche pour afficher/masquer les réponses */}
            {hasReplies && (
              <button
                className="flex items-center text-gray-400 hover:text-green-500 transition-colors"
                onClick={() => setShowReplies((prev) => !prev)}
                aria-label={showReplies ? "Masquer les réponses" : "Afficher les réponses"}
              >
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${showReplies ? "rotate-180" : "rotate-0"}`}
                />
                <span className="ml-1 text-xs font-medium">{comment.replies!.length}</span>
              </button>
            )}
            <button
              className={`flex items-center gap-1 transition-colors duration-200
                ${hasUpvoted ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}
                ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleVote('upvote')}
              disabled={isVoting}
              aria-label="Like"
            >
              <ThumbsUp size={16} />
              {voteScore > 0 && <span className="text-green-500">{voteScore}</span>}
            </button>
            <button
              className={`transition-colors duration-200
                ${hasDownvoted ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}
                ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleVote('downvote')}
              disabled={isVoting}
              aria-label="Dislike"
            >
              <ThumbsDown size={16} />
            </button>
            <button
              className="hover:text-green-500 text-sm font-medium"
              onClick={() => setShowReplyForm((prev) => !prev)}
              aria-label="Reply to comment"
            >
              <MessageCircle size={16} className="inline mr-1" />
              {showReplyForm ? "Annuler" : "Répondre"}
            </button>
            <button className="hover:text-green-500" aria-label="Copy comment link">
              <Link2 size={16} />
            </button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 animate-fade-in-reply">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                isReply
                onCommentAdded={() => {
                  setShowReplyForm(false);
                  onCommentAdded?.();
                }}
                placeholder={`Répondre à u/${comment.author}...`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Réponses (affichées seulement si showReplies est true) */}
      {hasReplies && showReplies && (
        <div className="mt-2 space-y-2">
          {comment.replies!.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Optional subtle fade‑in animations
// .animate-fade-in { animation: fadeIn 0.3s ease-out; }
// .animate-fade-in-reply { animation: fadeInReply 0.3s ease-out; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: none; } }
// @keyframes fadeInReply { from { opacity: 0; transform: translateX(6px);} to { opacity: 1; transform: none; } }