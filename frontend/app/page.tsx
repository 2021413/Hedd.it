"use client"
import PostCard from "../components/post/PostCard";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import AuthModal from "../components/auth/AuthModal";
import { toast } from "react-hot-toast";

interface PostData {
  id: number;
  attributes: {
    documentId?: string;
    title?: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    media?: Array<{
      id: number;
      url: string;
    }>;
    community?: {
      data?: {
        id: number;
        attributes?: {
          name?: string;
          avatar?: {
            url?: string;
          } | string;
        };
      };
    };
    upvotes?: Array<any>;
    downvotes?: Array<any>;
  };
}

interface NormalizedPost {
  id: number;
  documentId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  media?: Array<{
    id: number;
    url: string;
  }>;
  community?: {
    id: number;
    name: string;
    avatar?: string;
  };
  upvotes: Array<any>;
  downvotes: Array<any>;
}

interface PostAttributes {
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  documentId?: string;
  media?: Array<{
    id: number;
    url: string;
  }>;
  community?: {
    data: {
      id: number;
      attributes: {
        name?: string;
        avatar?: string | { url: string };
      };
    };
  };
  upvotes?: any[];
  downvotes?: any[];
}

interface Post {
  id: number;
  documentId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  media?: Array<{
    id: number;
    url: string;
  }>;
  community?: {
    id: number;
    name: string;
    avatar?: string;
  };
  upvotes: Array<any>;
  downvotes: Array<any>;
  voteScore: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

const normalizePost = (post: PostData): NormalizedPost => {
  const attributes = post.attributes || {};
  const community = attributes.community?.data;
  
  return {
    id: post.id,
    documentId: attributes.documentId,
    title: attributes.title || '',
    content: attributes.content || '',
    createdAt: attributes.createdAt || '',
    updatedAt: attributes.updatedAt || '',
    publishedAt: attributes.publishedAt || '',
    media: attributes.media || [],
    community: community ? {
      id: community.id,
      name: community.attributes?.name || '',
      avatar: typeof community.attributes?.avatar === 'string' 
        ? community.attributes.avatar 
        : community.attributes?.avatar?.url
    } : undefined,
    upvotes: attributes.upvotes || [],
    downvotes: attributes.downvotes || []
  };
};

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [postIds, setPostIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('showAuth') === 'true') {
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPostIds = async () => {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?fields[0]=id&sort[0]=createdAt:desc`;
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
          throw new Error(`Erreur: ${response.status}`);
        }
        const data = await response.json();
        const uniqueIds = Array.from(new Set(data.data.map((post: { id: number }) => post.id))) as number[];
        setPostIds(uniqueIds);
      } catch (error) {
        toast.error("Impossible de charger les posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPostIds();
  }, []);

  useEffect(() => {
    if (postIds.length === 0) return;
    setLoading(true);

    const fetchAllPosts = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

        const results = await Promise.all(
          postIds.map(async (id) => {
            const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${id}?populate[0]=community&populate[1]=community.avatar&populate[2]=media&populate[3]=upvotes&populate[4]=downvotes`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              cache: 'no-store'
            });
            if (!response.ok) return null;
            const data = await response.json();
            const post = normalizePost(data.data);
            
            const upvotes = post.upvotes || [];
            const downvotes = post.downvotes || [];
            const voteScore = upvotes.length - downvotes.length;
            const hasUpvoted = userId ? upvotes.some((vote: any) => vote.id === userId) : false;
            const hasDownvoted = userId ? downvotes.some((vote: any) => vote.id === userId) : false;

            return {
              ...post,
              voteScore,
              hasUpvoted,
              hasDownvoted
            };
          })
        );

        const validResults = results
          .filter((result): result is Post => result !== null)
          .filter((post, index, self) => 
            index === self.findIndex((p) => p.id === post.id)
          );

        setPosts(validResults);
      } catch (error) {
        toast.error("Impossible de charger les posts complets");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [postIds]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  function getAttr<T = any>(post: any, key: string, fallback: T | undefined = undefined): T | undefined {
    if (post[key] !== undefined) return post[key];
    if (post.attributes && post.attributes[key] !== undefined) return post.attributes[key];
    return fallback;
  }

  const refreshPost = async (postId: number) => {
    try {
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
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      const post = data.data;
      
      // Extraire les votes
      const upvotes = post.attributes?.upvotes?.data || [];
      const downvotes = post.attributes?.downvotes?.data || [];
      
      // Calculer le score et l'état des votes
      const voteScore = upvotes.length - downvotes.length;
      const hasUpvoted = userId ? upvotes.some((vote: any) => vote.id === userId) : false;
      const hasDownvoted = userId ? downvotes.some((vote: any) => vote.id === userId) : false;
      
      setPosts(prevPosts => {
        return prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              upvotes,
              downvotes,
              voteScore,
              hasUpvoted,
              hasDownvoted
            };
          }
          return p;
        });
      });
    } catch (error) {
      // Gérer l'erreur silencieusement
    }
  };

  return (
    <div className="p-6 flex flex-col gap-0">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          window.history.replaceState({}, '', '/');
        }} 
      />
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-400">Aucun post pour le moment</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {posts.map((post) => (
            <div key={`post-${post.id}-${post.createdAt}`} className="flex flex-col">
              <PostCard
                subName={post.community?.name || "communauté"}
                timeAgo={formatTimeAgo(post.createdAt)}
                title={post.title}
                imageUrl={post.media && post.media.length > 0 ? 
                  (post.media[0].url.startsWith("/") ? 
                    `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.media[0].url}` : 
                    post.media[0].url) : 
                  ""}
                postUrl={`${window.location.origin}/post/${post.id}`}
                subAvatar={post.community?.avatar ? 
                  (post.community.avatar.startsWith("http") ? 
                    post.community.avatar : 
                    `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.community.avatar}`) : 
                  `https://placehold.co/100x100/191919/39FF14?text=${(post.community?.name || "C").charAt(0).toUpperCase()}`}
                createdAt={post.createdAt}
                postId={post.id}
                voteScore={post.voteScore}
                hasUpvoted={post.hasUpvoted}
                hasDownvoted={post.hasDownvoted}
                onVoteSuccess={() => refreshPost(post.id)}
              />
              {post !== posts[posts.length - 1] && (
                <div className="w-full h-[2px] bg-[#003E1C] my-2 max-w-2xl mx-auto rounded"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
