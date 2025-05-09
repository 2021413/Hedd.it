"use client"
import PostCard from "../components/post/PostCard";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import AuthModal from "../components/auth/AuthModal";
import { toast } from "react-hot-toast";

// Mise à jour de l'interface pour correspondre au format réel des données
interface Post {
  id: number;
  documentId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  community?: {
    id: number;
    name: string;
    avatar?: any;
  };
  media?: any[];
}

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ouvrir le modal si showAuth est présent dans l'URL
    if (searchParams.get('showAuth') === 'true') {
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Utiliser la même approche que dans PostDetail.tsx
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?populate=*&sort=createdAt:desc&pagination[limit]=10`;
        
        // Récupérer le token d'authentification s'il existe
        const token = localStorage.getItem('jwt');
        
        const response = await fetch(
          url,
          { 
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Ajouter le token d'authentification s'il est disponible
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            cache: 'no-store'
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data.data || []);
      } catch (error) {
        toast.error("Impossible de charger les posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  return (
    <div className="p-6 flex flex-col gap-0">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          // Nettoyer l'URL
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
        posts.map((post, idx) => {
          // Gérer le cas où community est undefined
          const communityName = post.community?.name || "communauté";
          
          // Traiter l'avatar de la communauté
          let communityAvatar = "";
          if (post.community?.avatar) {
            if (typeof post.community.avatar === 'string') {
              communityAvatar = post.community.avatar;
            } else if (post.community.avatar.url) {
              communityAvatar = post.community.avatar.url;
            }
          }
          
          // Placeholder si pas d'avatar
          if (!communityAvatar) {
            communityAvatar = `https://placehold.co/100x100/191919/39FF14?text=${communityName.charAt(0).toUpperCase()}`;
          } else if (communityAvatar.startsWith('/')) {
            communityAvatar = `${process.env.NEXT_PUBLIC_STRAPI_URL}${communityAvatar}`;
          }
          
          // Traiter l'URL du média
          let mediaUrl = "";
          if (post.media && post.media.length > 0) {
            if (typeof post.media[0] === 'string') {
              mediaUrl = post.media[0];
            } else if (post.media[0].url) {
              mediaUrl = post.media[0].url;
            }
          }
          
          if (mediaUrl && mediaUrl.startsWith('/')) {
            mediaUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}${mediaUrl}`;
          }
          
          return (
            <React.Fragment key={post.id}>
              <PostCard 
                subName={communityName}
                timeAgo=""
                title={post.title}
                imageUrl={mediaUrl || undefined}
                postUrl={`${window.location.origin}/post/${post.id}`}
                subAvatar={communityAvatar}
                createdAt={post.createdAt}
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
