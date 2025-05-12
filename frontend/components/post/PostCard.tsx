'use client';

import { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiLink } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { toast } from "react-hot-toast";
import LoginForm from "../auth/LoginForm";
import { useVote } from '@/hooks/usePostVote';

interface PostCardProps {
  subName: string;
  timeAgo: string;
  title: string;
  imageUrl?: string;
  postUrl: string;
  subAvatar: string;
  createdAt?: string;
  postId: number;
  voteScore?: number;
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
  isLoading?: boolean;
  onVoteSuccess?: () => void;
}

export default function PostCard({ 
  subName, 
  timeAgo, 
  title, 
  imageUrl, 
  postUrl, 
  subAvatar, 
  createdAt,
  postId,
  voteScore = 0,
  hasUpvoted = false,
  hasDownvoted = false,
  isLoading = false,
  onVoteSuccess
}: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [voteAction, setVoteAction] = useState<'upvote' | 'downvote' | null>(null);
  const router = useRouter();

  const { voteScore: currentVoteScore, hasUpvoted: currentHasUpvoted, hasDownvoted: currentHasDownvoted, isVoting, handleVote } = useVote({
    postId,
    initialVoteScore: voteScore,
    initialHasUpvoted: hasUpvoted,
    initialHasDownvoted: hasDownvoted,
    onVoteSuccess: () => {
      if (onVoteSuccess) {
        setTimeout(() => onVoteSuccess(), 100);
      }
    }
  });

  const displayTime = createdAt ? formatRelativeTime(new Date(createdAt)) : timeAgo;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = () => {
    const postId = postUrl.split('/').pop();
    router.push(`/post/${postId}`);
  };

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/community/${subName}`);
  };

  const handleVoteClick = async (e: React.MouseEvent, action: 'upvote' | 'downvote') => {
    e.stopPropagation();
    
    const token = localStorage.getItem('jwt');
    if (!token) {
      setVoteAction(action);
      setShowLoginModal(true);
      return;
    }

    try {
      await handleVote(action);
    } catch (error) {
      console.error('Erreur dans handleVote:', error);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (voteAction) {
      handleVoteClick({ stopPropagation: () => {} } as React.MouseEvent, voteAction);
      setVoteAction(null);
    }
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className="bg-transparent hover:bg-neutral-900 transition-colors duration-200 text-white p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto cursor-pointer"
      >
        <div className="text-base mb-2 flex items-center gap-2">
          <img 
            src={subAvatar || "https://picsum.photos/200/200?random=" + subName} 
            alt={`h/${subName}`} 
            className="w-8 h-8 rounded-full object-cover"
          />
          <span 
            onClick={handleCommunityClick}
            className="font-semibold text-lg text-white hover:text-green-500 transition-colors cursor-pointer"
          >
            h/{subName}
          </span>
          <span className="text-base text-gray-400">• {displayTime}</span>
        </div>
        <h2 className="text-2xl font-extrabold mb-5 leading-tight">{title}</h2>
        {imageUrl && (
          <div className="rounded-xl overflow-hidden mb-5">
            <img src={imageUrl} alt="post" className="w-full object-cover aspect-square max-h-[480px]" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            <button 
              className={`flex items-center gap-1 transition-colors duration-200 ${
                currentHasUpvoted ? 'text-green-500' : 'text-gray-300 hover:text-green-500'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => handleVoteClick(e, 'upvote')}
              disabled={isVoting}
              aria-label="Like"
            >
              <FiThumbsUp size={28} />
              {currentVoteScore > 0 && <span className="text-green-500">{currentVoteScore}</span>}
            </button>
            <button 
              className={`transition-colors duration-200 ${
                currentHasDownvoted ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => handleVoteClick(e, 'downvote')}
              disabled={isVoting}
              aria-label="Dislike"
            >
              <FiThumbsDown size={28} />
            </button>
          </div>
          <button 
            onClick={handleShare} 
            className="hover:text-green-500 flex items-center gap-2 text-lg" 
            aria-label="Partager"
          >
            <FiLink size={22} /> {copied ? "Copié !" : "Partager"}
          </button>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <LoginForm
              onModeChange={() => {}}
              onSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}
