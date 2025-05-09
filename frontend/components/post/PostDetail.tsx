"use client"

import React from "react";
import { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiLink } from "react-icons/fi";
import CommentThread, { Comment } from "@/components/comments/CommentThread";
import CommentForm from "@/components/comments/CommentForm";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface PostDetailProps {
  postId: number;
}

interface PostData {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  documentId: string;
  media?: any[];
  author?: {
    id: number;
    username: string;
    email?: string;
    provider?: string;
    documentId?: string;
  };
  community?: {
    id: number;
    name: string;
    description?: string;
    isPrivate?: boolean;
    documentId?: string;
    avatar?: any;
  };
  comments: any[];
  upvotes: any[];
  downvotes: any[];
}

interface ApiResponse {
  data: PostData[];
  meta: {
    pagination: any;
  };
}

function mapApiCommentsToTree(comments: any[]): Comment[] {
  if (!comments || comments.length === 0) return [];

  const rootComments = comments.filter(comment => 
    !comment.parent || !comment.parent.id
  );
  
  const commentMap = comments.reduce((acc, comment) => {
    acc[comment.id] = comment;
    return acc;
  }, {} as Record<number, any>);
  
  function buildCommentTree(comment: any): Comment {
    const replyIds = comment.replies 
      ? (Array.isArray(comment.replies) ? comment.replies.map((r: any) => r.id) : [])
      : [];
      
    const replies = replyIds
      .map((id: number) => commentMap[id])
      .filter(Boolean)
      .map(buildCommentTree);
    
    const upvotes = comment.upvotes?.length || 0;
    const downvotes = comment.downvotes?.length || 0;
    
    return {
      id: comment.id,
      author: comment.author?.username || "Utilisateur inconnu",
      content: comment.content,
      timeAgo: formatDateToNow(comment.createdAt),
      likes: upvotes - downvotes,
      replies: replies.length > 0 ? replies : undefined
    };
  }
  
  return rootComments.map(buildCommentTree);
}

function formatDateToNow(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "récemment";
    }
    
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
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (isNaN(postId)) {
          throw new Error("ID de post invalide");
        }
        
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?filters[id][$eq]=${postId}&populate=*`;
        
        const token = localStorage.getItem('jwt');
        
        const response = await fetch(
          url,
          { 
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            cache: 'no-store'
          }
        );
        
        if (!response.ok) {
          const errorResponse = await response.text();
          
          if (response.status === 404) {
            try {
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
                
                if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                  const formattedPosts = result.data.map((p: any) => {
                    return {
                      id: p.id,
                      title: p.attributes?.title || p.title || `Post ${p.id}`
                    };
                  });
                  
                  setAvailablePosts(formattedPosts);
                }
              }
            } catch (error) {
              // Gestion silencieuse des erreurs pour les posts disponibles
            }
            
            throw new Error(`Le post avec l'ID ${postId} n'existe pas`);
          }
          
          throw new Error(`Impossible de charger le post: ${response.status} ${response.statusText}`);
        }
        
        const result: ApiResponse = await response.json();
        
        if (!result.data || result.data.length === 0) {
          throw new Error("Format de réponse invalide de l'API ou post non trouvé");
        }
        
        const postData = result.data[0];
        
        setPost(postData);
        
        if (postData.comments && Array.isArray(postData.comments)) {
          const commentTree = mapApiCommentsToTree(postData.comments);
          setCommentTree(commentTree);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Une erreur est survenue");
        toast.error("Impossible de charger le post");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);
  
  const handleRefreshComments = async () => {
    try {
      const token = localStorage.getItem('jwt');
      
      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?filters[id][$eq]=${postId}&populate=*`;
      
      const response = await fetch(
        url,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          cache: 'no-store'
        }
      );
      
      if (!response.ok) {
        throw new Error("Impossible de rafraîchir les commentaires");
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.data && result.data.length > 0) {
        const postData = result.data[0];
        
        if (postData.comments && Array.isArray(postData.comments)) {
          const newCommentTree = mapApiCommentsToTree(postData.comments);
          setCommentTree(newCommentTree);
        }
      }
    } catch (error) {
      toast.error("Impossible de rafraîchir les commentaires");
    }
  };

  const handleShare = () => {
    const postUrl = window.location.href;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-neutral-900 p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="mb-4">{error || "Post non trouvé"}</p>
          
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
    title,
    content,
    createdAt,
    media,
    author,
    community,
    upvotes,
    downvotes,
  } = post;
  
  const imageUrl = media && media[0]?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${media[0].url}`
    : null;
  
  let communityAvatar = `https://placehold.co/100x100/191919/39FF14?text=${community?.name?.charAt(0).toUpperCase() || '?'}`;
  
  if (community?.avatar) {
    if (typeof community.avatar === 'string') {
      communityAvatar = community.avatar.startsWith('http') 
        ? community.avatar 
        : `${process.env.NEXT_PUBLIC_STRAPI_URL}${community.avatar}`;
    } else if (community.avatar.url) {
      communityAvatar = `${process.env.NEXT_PUBLIC_STRAPI_URL}${community.avatar.url}`;
    }
  }
  
  const upvoteCount = upvotes?.length || 0;
  const downvoteCount = downvotes?.length || 0;
  const voteScore = upvoteCount - downvoteCount;

  return (
    <>
      <div className="bg-transparent hover:bg-neutral-900 transition-colors duration-200 text-white p-8 rounded-2xl shadow-lg relative">
        <div className="flex items-center mb-2">
          <div className="flex items-center gap-2">
            <img 
              src={communityAvatar} 
              alt={`h/${community?.name || 'communauté'}`} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-lg text-white">
              h/{community?.name || 'communauté'}
            </span>
            <span className="text-base text-gray-400">
              • {formatDateToNow(createdAt)}
            </span>
            <span className="text-base text-gray-400">
              • par {author?.username || 'utilisateur inconnu'}
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
            <button className="hover:text-white flex items-center gap-1" aria-label="Like">
              <FiThumbsUp size={28} />
              {voteScore > 0 && <span>{voteScore}</span>}
            </button>
            <button className="hover:text-white" aria-label="Dislike">
              <FiThumbsDown size={28} />
            </button>
            <button className="hover:text-white" aria-label="Comment">
              <FiMessageCircle size={28} />
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
          onCommentAdded={handleRefreshComments}
        />

        {commentTree.length > 0 ? (
          <div className="space-y-6">
            {commentTree.map((comment) => (
              <CommentThread 
                key={comment.id} 
                comment={comment} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Soyez le premier à commenter cette publication
          </div>
        )}
      </div>
    </>
  );
} 