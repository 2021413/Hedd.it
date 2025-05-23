"use client"

import React from "react";
import { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiLink, FiX } from "react-icons/fi";
import CommentThread, { Comment } from "@/components/comments/CommentThread";
import CommentForm from "@/components/comments/CommentForm";
import Link from "next/link";
import { toast } from "react-hot-toast";
import LoginForm from "../auth/LoginForm";
import { useVote } from '@/hooks/usePostVote';
import { useRouter } from "next/navigation";

interface PostDetailProps {
  postId: number;
}

interface PostData {
  id: number;
  attributes: {
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    media?: Array<{
      id: number;
      url: string;
    }>;
    author?: {
      data: {
        id: number;
        attributes: {
          username: string;
          avatar?: {
            url: string;
          };
          banner?: {
            url: string;
          };
        };
      };
    };
    community?: {
      data: {
        id: number;
        attributes: {
          name: string;
          avatar?: {
            url: string;
          } | string;
        };
      };
    };
    comments?: Array<{
      id: number;
      attributes: {
        content: string;
        createdAt: string;
        author: {
          data: {
            id: number;
            attributes: {
              username: string;
            };
          };
        };
      };
    }>;
    upvotes?: Array<any>;
    downvotes?: Array<any>;
  };
}

interface ApiResponse {
  data: PostData[];
  meta: {
    pagination: any;
  };
}

function formatDateToNow(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "récemment";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);
    
    const formatValue = (value: number, unit: string, singularUnit?: string) => {
      if (value === 0) return null;
      const finalUnit = value === 1 ? (singularUnit || unit.replace(/s$/, '')) : unit;
      return `il y a ${value} ${finalUnit}`;
    };
    
    return (
      formatValue(diffYear, 'ans', 'an') ||
      formatValue(diffMonth, 'mois') ||
      formatValue(diffDay, 'jours', 'jour') ||
      formatValue(diffHour, 'heures', 'heure') ||
      formatValue(diffMin, 'minutes', 'minute') ||
      'à l\'instant'
    );
  } catch (error) {
    return "récemment";
  }
}

export default function PostDetail({ postId }: PostDetailProps) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentTree, setCommentTree] = useState<Comment[]>([]);
  const [copied, setCopied] = useState(false);
  const [availablePosts, setAvailablePosts] = useState<{id: number, title: string}[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [voteAction, setVoteAction] = useState<'upvote' | 'downvote' | null>(null);
  const [voteState, setVoteState] = useState({
    voteScore: 0,
    hasUpvoted: false,
    hasDownvoted: false
  });
  
  const { isVoting, handleVote: hookHandleVote } = useVote({
    postId,
    initialVoteScore: voteState.voteScore,
    initialHasUpvoted: voteState.hasUpvoted,
    initialHasDownvoted: voteState.hasDownvoted,
    onVoteSuccess: () => {
      // On ne fait plus d'appel à refreshVotes ici
    }
  });

  const router = useRouter();

  const handleVote = async (action: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setVoteAction(action);
      setShowLoginModal(true);
      return;
    }

    try {
      // Mise à jour optimiste
      setVoteState(prevState => {
        const newState = { ...prevState };
        if (action === 'upvote') {
          if (newState.hasUpvoted) {
            newState.voteScore--;
            newState.hasUpvoted = false;
          } else {
            newState.voteScore++;
            newState.hasUpvoted = true;
            if (newState.hasDownvoted) {
              newState.voteScore++;
              newState.hasDownvoted = false;
            }
          }
        } else {
          if (newState.hasDownvoted) {
            newState.voteScore++;
            newState.hasDownvoted = false;
          } else {
            newState.voteScore--;
            newState.hasDownvoted = true;
            if (newState.hasUpvoted) {
              newState.voteScore--;
              newState.hasUpvoted = false;
            }
          }
        }
        return newState;
      });

      await hookHandleVote(action);
    } catch (error) {
      // En cas d'erreur, on restaure l'état précédent
      const token = localStorage.getItem('jwt');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
      
      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${postId}?populate[0]=upvotes&populate[1]=downvotes`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        const post = data.data;
        
        const upvotes = post.attributes?.upvotes?.data || [];
        const downvotes = post.attributes?.downvotes?.data || [];
        
        const voteScore = upvotes.length - downvotes.length;
        const hasUpvoted = userId ? upvotes.some((vote: any) => vote.id === userId) : false;
        const hasDownvoted = userId ? downvotes.some((vote: any) => vote.id === userId) : false;
        
        setVoteState({
          voteScore,
          hasUpvoted,
          hasDownvoted
        });
      }
    }
  };

  const fetchPost = async () => {
    try {
      if (isNaN(postId)) {
        throw new Error("ID de post invalide");
      }
      
      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${postId}`;
      const token = localStorage.getItem('jwt');
      
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          const availablePostsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?sort=id:desc&pagination[pageSize]=5`, 
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            }
          );
          
          if (availablePostsResponse.ok) {
            const result = await availablePostsResponse.json();
            setAvailablePosts(result.data.map((p: PostData) => ({
              id: p.id,
              title: p.attributes.title
            })));
          }
          
          throw new Error(`Le post avec l'ID ${postId} n'existe pas`);
        }
        
        throw new Error(`Impossible de charger le post: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result?.data?.attributes) {
        throw new Error("Structure de données invalide reçue du serveur");
      }
      
      setPost(result.data);

      // Mettre à jour l'état des votes uniquement au chargement initial
      if (voteState.voteScore === 0 && !voteState.hasUpvoted && !voteState.hasDownvoted) {
        const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
        const upvotes = result.data.attributes.upvotes || [];
        const downvotes = result.data.attributes.downvotes || [];
        
        const voteScore = upvotes.length - downvotes.length;
        const hasUpvoted = userId ? upvotes.some((vote: any) => vote.id === userId) : false;
        const hasDownvoted = userId ? downvotes.some((vote: any) => vote.id === userId) : false;
        
        setVoteState({
          voteScore,
          hasUpvoted,
          hasDownvoted
        });
      }
      
      // Récupération des commentaires via route thread
      const commentsUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments/thread?post=${postId}`;
      const commentsResponse = await fetch(commentsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      
      if (commentsResponse.ok) {
        const commentTree = await commentsResponse.json();
        const adaptedComments = commentTree.map((comment: any) => adaptCommentFromApi(comment));
        setCommentTree(adaptedComments);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
      toast.error("Impossible de charger le post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);
  
  const handleRefreshComments = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments/thread?post=${postId}`;
      
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error("Impossible de rafraîchir les commentaires");
      }
      
      const commentTree = await response.json();
      const adaptedComments = commentTree.map((comment: any) => adaptCommentFromApi(comment));
      setCommentTree(adaptedComments);
    } catch (error) {
      toast.error("Impossible de rafraîchir les commentaires");
    }
  };

  const adaptCommentFromApi = (comment: any): Comment => {
    // Récupérer l'ID utilisateur courant (côté client uniquement)
    let userId: number | null = null;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          userId = JSON.parse(atob(token.split('.')[1])).id;
        } catch {}
      }
    }
    const upvotes = comment.upvotes || [];
    const downvotes = comment.downvotes || [];
    const hasUpvoted = userId ? upvotes.some((vote: any) => vote.id === userId) : false;
    const hasDownvoted = userId ? downvotes.some((vote: any) => vote.id === userId) : false;
    return {
      id: comment.id,
      author: comment.author?.username || "Utilisateur inconnu",
      authorId: comment.author?.id,
      content: comment.content,
      timeAgo: formatDateToNow(comment.createdAt),
      likes: upvotes.length - downvotes.length,
      avatarUrl: comment.author?.avatar?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${comment.author.avatar.url}`
        : undefined,
      hasUpvoted,
      hasDownvoted,
      replies: comment.replies?.length > 0
        ? comment.replies.map((reply: any) => adaptCommentFromApi(reply))
        : undefined
    };
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (voteAction) {
      handleVote(voteAction);
      setVoteAction(null);
    }
  };
  
  // Fonction de suppression du post
  const handleDeletePost = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce post ? Cette action est irréversible.")) return;
    const token = localStorage.getItem('jwt');
    let decoded = null;
    if (token) {
      try {
        decoded = JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        decoded = null;
      }
    }
    if (!token) {
      toast.error("Vous devez être connecté pour supprimer un post.");
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success("Post supprimé avec succès.");
        router.push("/");
      } else {
        let data = null;
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
        toast.error((data && (data.error?.message || data.message)) || "Erreur lors de la suppression du post.");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression du post.");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error || !post || !post.attributes) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-neutral-900 p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="mb-4">{error || "Post non trouvé ou données invalides"}</p>
          
          {availablePosts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Posts disponibles:</h2>
              <ul className="space-y-2">
                {availablePosts.map(post => (
                  <li key={post.id}>
                    <Link href={`/post/${post.id}`} className="text-green-500 hover:underline">
                      {post.title} (ID: {post.id})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-green-900 rounded-full hover:bg-green-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
  
  const {
    title = '',
    content = '',
    createdAt = '',
    media = [],
    author = null,
    community = null,
  } = post.attributes || {};
  
  const imageUrl = media && media[0]?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${media[0].url}`
    : null;
  
  let communityAvatar = community?.data?.attributes?.name 
    ? `https://placehold.co/100x100/191919/39FF14?text=${community.data.attributes.name.charAt(0).toUpperCase()}`
    : `https://placehold.co/100x100/191919/39FF14?text=?`;
  
  if (community?.data?.attributes?.avatar) {
    const avatar = community.data.attributes.avatar;
    if (typeof avatar === 'string') {
      communityAvatar = avatar.startsWith('http') 
        ? avatar 
        : `${process.env.NEXT_PUBLIC_STRAPI_URL}${avatar}`;
    } else if (avatar?.url) {
      communityAvatar = `${process.env.NEXT_PUBLIC_STRAPI_URL}${avatar.url}`;
    }
  }
  
  // Génération du slug si absent
  let communitySlug = (community?.data as any)?.attributes?.slug;
  if (!communitySlug && community?.data?.attributes?.name) {
    communitySlug = community.data.attributes.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\u0000-\u007F]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (!communitySlug && community?.data?.id) {
    communitySlug = community.data.id;
  }
  
  // Ajout pour récupérer l'id utilisateur courant
  let currentUserId: number | null = null;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        currentUserId = JSON.parse(atob(token.split('.')[1])).id;
      } catch {}
    }
  }
  
  return (
    <>
      <div className="bg-transparent hover:bg-neutral-900 transition-colors duration-200 text-white p-8 rounded-2xl shadow-lg relative">
        {/* Croix de suppression visible uniquement pour le créateur du post */}
        {author?.data?.id && currentUserId === author.data.id && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-neutral-800 rounded-full p-2 z-10"
            title="Supprimer le post"
            onClick={handleDeletePost}
          >
            <FiX size={24} />
          </button>
        )}
        <div className="flex items-center mb-2">
          <div className="flex items-center gap-2">
            <Link 
              href={`/community/${communitySlug}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src={communityAvatar} 
                alt={`h/${community?.data?.attributes?.name || 'communauté'}`} 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-lg text-white hover:text-green-500 transition-colors">
                h/{community?.data?.attributes?.name || 'communauté'}
              </span>
            </Link>
            <span className="text-base text-gray-400">
              • {formatDateToNow(createdAt)}
            </span>
            <span className="text-base text-gray-400">
              • par {author?.data?.attributes?.username || 'utilisateur inconnu'}
            </span>
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-5 leading-tight">{title}</h1>
        <p className="text-lg mb-5">{content}</p>
        
        {imageUrl && (
          <div className="rounded-xl overflow-hidden mb-5">
            <img src={imageUrl} alt={title} className="w-full object-cover aspect-square max-h-[600px]" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-6">
            <button 
              className={`flex items-center gap-1 transition-colors duration-200 ${
                voteState.hasUpvoted ? 'text-green-500' : 'text-gray-300 hover:text-green-500'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote('upvote')}
              disabled={isVoting}
              aria-label="Like"
            >
              <FiThumbsUp size={28} />
              {voteState.voteScore > 0 && <span className="text-green-500">{voteState.voteScore}</span>}
            </button>
            <button 
              className={`transition-colors duration-200 ${
                voteState.hasDownvoted ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote('downvote')}
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

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Commentaires</h2>
        
        <CommentForm 
          postId={postId}
          onCommentAdded={() => {
            setTimeout(() => handleRefreshComments(), 100);
          }}
        />

        {commentTree.length > 0 ? (
          <div className="space-y-6">
            {commentTree.map((comment) => (
              <CommentThread 
                key={comment.id} 
                comment={comment} 
                onCommentAdded={() => {
                  setTimeout(() => handleRefreshComments(), 100);
                }}
                postId={postId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Soyez le premier à commenter cette publication
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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