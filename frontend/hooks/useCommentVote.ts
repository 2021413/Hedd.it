import { useState, useCallback, useEffect, useRef } from 'react';

interface UseCommentVoteProps {
  commentId: number;
  initialVoteScore?: number;
  initialHasUpvoted?: boolean;
  initialHasDownvoted?: boolean;
  onVoteSuccess?: () => void;
}

export const useCommentVote = ({
  commentId,
  initialVoteScore = 0,
  initialHasUpvoted = false,
  initialHasDownvoted = false,
  onVoteSuccess
}: UseCommentVoteProps) => {
  const [voteScore, setVoteScore] = useState(initialVoteScore);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [hasDownvoted, setHasDownvoted] = useState(initialHasDownvoted);
  const [isVoting, setIsVoting] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      setVoteScore(initialVoteScore);
      setHasUpvoted(initialHasUpvoted);
      setHasDownvoted(initialHasDownvoted);
      isInitialMount.current = false;
    }
  }, []);

  const handleVote = useCallback(async (action: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('jwt');
    if (!token || isVoting) return;

    setIsVoting(true);

    const previousState = {
      voteScore,
      hasUpvoted,
      hasDownvoted
    };

    try {
      if (action === 'upvote') {
        if (hasUpvoted) {
          setVoteScore(prev => prev - 1);
          setHasUpvoted(false);
        } else {
          setVoteScore(prev => prev + 1);
          setHasUpvoted(true);
          if (hasDownvoted) {
            setVoteScore(prev => prev + 1);
            setHasDownvoted(false);
          }
        }
      } else {
        if (hasDownvoted) {
          setVoteScore(prev => prev + 1);
          setHasDownvoted(false);
        } else {
          setVoteScore(prev => prev - 1);
          setHasDownvoted(true);
          if (hasUpvoted) {
            setVoteScore(prev => prev - 1);
            setHasUpvoted(false);
          }
        }
      }

      let endpoint = '';
      if (action === 'upvote') {
        endpoint = hasUpvoted ? 'remove-upvote' : 'upvote';
      } else {
        endpoint = hasDownvoted ? 'remove-downvote' : 'downvote';
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments/${commentId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setVoteScore(previousState.voteScore);
        setHasUpvoted(previousState.hasUpvoted);
        setHasDownvoted(previousState.hasDownvoted);
        throw new Error('Erreur lors du vote');
      }

      if (onVoteSuccess) {
        onVoteSuccess();
      }

    } catch (error) {
      // Gérer l'erreur silencieusement
    } finally {
      setIsVoting(false);
    }
  }, [commentId, voteScore, hasUpvoted, hasDownvoted, isVoting, onVoteSuccess]);

  return {
    voteScore,
    hasUpvoted,
    hasDownvoted,
    isVoting,
    handleVote
  };
}; 