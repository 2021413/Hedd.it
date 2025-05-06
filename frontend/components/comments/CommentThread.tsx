import {
  FiThumbsUp,
  FiThumbsDown,
  FiMessageCircle,
  FiLink,
} from "react-icons/fi";
import { useState } from "react";

export interface Comment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  replies?: Comment[];
}

export default function CommentThread({
  comment,
  isReply = false
}: {
  comment: Comment;
  isReply?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`${isReply ? "mb-5" : "mb-8"}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-700" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-200 text-sm">u/{comment.author}</span>
            <span className="text-xs text-gray-400 ml-2">• {comment.timeAgo}</span>
          </div>

          {/* Comment text */}
          <div className="text-gray-300 mb-2">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 text-gray-400">
            <button className="flex items-center gap-1.5 hover:text-white">
              <FiThumbsUp size={16} />
              {comment.likes > 0 && (
                <span className="text-sm">{comment.likes}</span>
              )}
            </button>
            <button className="hover:text-white">
              <FiThumbsDown size={16} />
            </button>
            <button className="hover:text-white">
              <FiMessageCircle size={16} />
            </button>
            <button className="hover:text-green-500">
              <FiLink size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && expanded && (
        <div className="mt-4 ml-12 space-y-4">
          {comment.replies?.map((reply) => (
            <CommentThread key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
}  