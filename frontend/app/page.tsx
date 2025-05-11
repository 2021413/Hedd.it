"use client"
import PostCard from "../components/post/PostCard";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import AuthModal from "../components/auth/AuthModal";
import { toast } from "react-hot-toast";

interface PostData {
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
}

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [postIds, setPostIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
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
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?fields[0]=id`;
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
        const ids = data.data.map((post: { id: number }) => post.id);
        setPostIds(ids);
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
    setPosts([]);

    const fetchAllPosts = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const results = await Promise.all(
          postIds.map(async (id) => {
            const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${id}?populate=*`;
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
            return data.data;
          })
        );
        setPosts(results.filter(Boolean));
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
        [...posts].reverse().map((post, idx) => {
          const community = getAttr(post, 'community')?.data;
          const communityName = community?.attributes?.name || "communauté";
          let communityAvatar = "";
          const avatar = community?.attributes?.avatar;
          
          if (typeof avatar === "string") {
            communityAvatar = avatar.startsWith("http")
              ? avatar
              : `${process.env.NEXT_PUBLIC_STRAPI_URL}${avatar}`;
          } else if (avatar?.url) {
            communityAvatar = avatar.url.startsWith("http")
              ? avatar.url
              : `${process.env.NEXT_PUBLIC_STRAPI_URL}${avatar.url}`;
          }
          
          if (!communityAvatar) {
            communityAvatar = `https://placehold.co/100x100/191919/39FF14?text=${communityName.charAt(0).toUpperCase()}`;
          }

          let mediaUrl = "";
          const media = getAttr(post, 'media');
          if (media && media.length > 0) {
            mediaUrl = media[0].url;
            if (mediaUrl && mediaUrl.startsWith("/")) {
              mediaUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}${mediaUrl}`;
            }
          }

          return (
            <React.Fragment key={post.id}>
              <PostCard
                subName={communityName}
                timeAgo={formatTimeAgo(getAttr(post, 'createdAt') || '')}
                title={getAttr(post, 'title') || ''}
                imageUrl={mediaUrl || ''}
                postUrl={`${window.location.origin}/post/${post.id}`}
                subAvatar={communityAvatar || ''}
                createdAt={getAttr(post, 'createdAt') || ''}
              />
              {idx < posts.length - 1 && (
                <div className="w-full h-[2px] bg-[#003E1C] my-2 max-w-2xl mx-auto rounded"></div>
              )}
            </React.Fragment>
          );
        })
      )}
    </div>
  );
}
