import { useState, useCallback, useEffect, useRef } from 'react';

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
  const isInitialMount = useRef(true);

  // Mettre à jour les états uniquement lors du montage initial
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
          // Annulation du upvote
          setVoteScore(prev => prev - 1);
          setHasUpvoted(false);
        } else {
          // Nouveau upvote
          setVoteScore(prev => prev + 1);
          setHasUpvoted(true);
          if (hasDownvoted) {
            // Si on avait downvoté, on annule le downvote
            setVoteScore(prev => prev + 1);
            setHasDownvoted(false);
          }
        }
      } else {
        if (hasDownvoted) {
          // Annulation du downvote
          setVoteScore(prev => prev + 1);
          setHasDownvoted(false);
        } else {
          // Nouveau downvote
          setVoteScore(prev => prev - 1);
          setHasDownvoted(true);
          if (hasUpvoted) {
            // Si on avait upvoté, on annule l'upvote
            setVoteScore(prev => prev - 1);
            setHasUpvoted(false);
          }
        }
      }

      // Déterminer la route à appeler en fonction de l'état actuel
      let endpoint = '';
      if (action === 'upvote') {
        // Si on a déjà upvoté, on veut annuler le vote
        endpoint = hasUpvoted ? 'remove-upvote' : 'upvote';
      } else {
        // Si on a déjà downvoté, on veut annuler le vote
        endpoint = hasDownvoted ? 'remove-downvote' : 'downvote';
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${postId}/${endpoint}`, {
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

      // Attendre que l'état soit mis à jour avant de déclencher le callback
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