import { useState, useCallback, useEffect } from 'react';

interface UseVoteProps {
  postId: number;
  initialVoteScore?: number;
  initialHasUpvoted?: boolean;
  initialHasDownvoted?: boolean;
  onVoteSuccess?: () => void;
}

export const useVote = ({
  postId,
  initialVoteScore = 0,
  initialHasUpvoted = false,
  initialHasDownvoted = false,
  onVoteSuccess
}: UseVoteProps) => {
  const [voteScore, setVoteScore] = useState(initialVoteScore);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [hasDownvoted, setHasDownvoted] = useState(initialHasDownvoted);
  const [isVoting, setIsVoting] = useState(false);

  // Mettre à jour les états quand les valeurs initiales changent
  useEffect(() => {
    setVoteScore(initialVoteScore);
    setHasUpvoted(initialHasUpvoted);
    setHasDownvoted(initialHasDownvoted);
  }, [initialVoteScore, initialHasUpvoted, initialHasDownvoted]);

  const handleVote = useCallback(async (action: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('jwt');
    if (!token || isVoting) return;

    setIsVoting(true);

    // Sauvegarder l'état initial pour restauration en cas d'erreur
    const previousState = {
      voteScore,
      hasUpvoted,
      hasDownvoted
    };

    try {
      // Mise à jour optimiste immédiate
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${postId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // En cas d'erreur, on restaure l'état précédent
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
  }, [postId, voteScore, hasUpvoted, hasDownvoted, isVoting, onVoteSuccess]);

  return {
    voteScore,
    hasUpvoted,
    hasDownvoted,
    isVoting,
    handleVote
  };
}; 