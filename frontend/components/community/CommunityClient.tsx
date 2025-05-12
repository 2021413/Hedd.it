'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiInfo, FiPlus, FiMoreHorizontal, FiGlobe, FiLock } from 'react-icons/fi';
import PostCard from '@/components/post/PostCard';
import CommunityRules from '@/components/community/CommunityRules';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import AuthModal from '@/components/auth/AuthModal';

// Types
interface Post {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  postUrl: string;
}

interface Rule {
  id: number;
  title: string;
  description: string;
}

interface Community {
  id: number;
  documentId: string;
  name: string;
  description: string;
  isPrivate: boolean;
  avatar: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
  banner: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
  createdAt: string;
  posts: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    media?: Array<{
      url: string;
    }>;
  }>;
  members: Array<{ id: number }>;
  moderators: Array<{ id: number }>;
  creator: {
    id: number;
    username: string;
  };
  rules: any;
  slug: string | null;
}

interface CommunityClientProps {
  community: Community;
}

export default function CommunityClient({ community: initialCommunity }: CommunityClientProps) {
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(initialCommunity);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initial load effect
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const userId = localStorage.getItem('userId');

        // Vérification du token
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // Token invalide, on nettoie le localStorage
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            setCurrentUserId(null);
            setIsAuthenticated(false);
            setIsMember(false);
            setIsModerator(false);
          } else {
            setCurrentUserId(userId);
            setIsAuthenticated(true);
          }
        } else {
          setCurrentUserId(null);
          setIsAuthenticated(false);
          setIsMember(false);
          setIsModerator(false);
        }

        if (initialCommunity) {
          setCommunity(initialCommunity);
          updateImageUrls(initialCommunity);
        } else {
          setError('Données de communauté non fournies');
        }
      } catch (e) {
        setError('Erreur lors du chargement des données');
        setIsAuthenticated(false);
        setCurrentUserId(null);
        setIsMember(false);
        setIsModerator(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [initialCommunity]);

  useEffect(() => {
    if (community && currentUserId && isAuthenticated) {
      const isCreator = community.creator?.id === parseInt(currentUserId);
      const isMemberOfCommunity = community.members?.some((member) => member.id === parseInt(currentUserId)) || false;
      setIsMember(isCreator || isMemberOfCommunity);
      
      if (community.moderators) {
        setIsModerator(community.moderators.some((mod) => mod.id === parseInt(currentUserId)));
      }
    } else {
      setIsMember(false);
      setIsModerator(false);
    }
  }, [community, currentUserId, isAuthenticated]);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to update image URLs safely
  const updateImageUrls = (communityData: Community) => {
    const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Safely extract avatar URL
    if (communityData.avatar && typeof communityData.avatar === 'object') {
      if (communityData.avatar.url) {
        const newAvatarUrl = communityData.avatar.url.startsWith('http') 
          ? communityData.avatar.url 
          : `${strapiBaseUrl}${communityData.avatar.url}`;
        setAvatarUrl(newAvatarUrl);
      }
    }
    
    // Safely extract banner URL
    if (communityData.banner && typeof communityData.banner === 'object') {
      if (communityData.banner.url) {
        const newBannerUrl = communityData.banner.url.startsWith('http') 
          ? communityData.banner.url 
          : `${strapiBaseUrl}${communityData.banner.url}`;
        setBannerUrl(newBannerUrl);
      }
    }
  };

  const handleCreatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!isMember) {
      toast.error("Vous devez être membre de la communauté pour créer un post");
      return;
    }
    router.push(`/create-post?community=${community?.id}`);
  };

  const handleJoinCommunity = async () => {
    if (!currentUserId || !community) {
      setShowAuthModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const currentMembers = community.members?.map(member => member.id) || [];
      
      if (parseInt(currentUserId) === community.creator.id) {
        toast.error('Le créateur ne peut pas quitter sa communauté');
        return;
      }

      let updatedMembers = isMember
        ? currentMembers.filter(id => id !== parseInt(currentUserId))
        : [...currentMembers, parseInt(currentUserId)];

      const updateUrl = `${strapiUrl}/api/communities/${community.documentId}`;
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            members: updatedMembers
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `Erreur lors de la mise à jour de la communauté (${response.status})`
        );
      }

      setIsMember(!isMember);
      toast.success(isMember ? 'Vous avez quitté la communauté' : 'Vous avez rejoint la communauté');

      const refreshUrl = `${strapiUrl}/api/communities?filters[name][$eq]=${community.name}&populate=*`;
      
      const updatedCommunityResponse = await fetch(refreshUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (updatedCommunityResponse.ok) {
        const data = await updatedCommunityResponse.json();
        if (data.data && data.data.length > 0) {
          setCommunity(data.data[0]);
        }
      }

    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la mise à jour');
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-2xl text-red-500 bg-neutral-900 p-6 rounded-2xl">
          <FiInfo className="inline-block mr-2" />
          {error}
        </div>
      </div>
    );
  }

  // Fallback if no community data is available after loading
  if (!community) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-2xl bg-neutral-900 p-6 rounded-2xl">
          <FiInfo className="inline-block mr-2" />
          Communauté non trouvée
        </div>
      </div>
    );
  }

  const posts = community.posts || [];
  const totalMembers = community.members?.length || 0;

  const AboutSection = () => {
    return (
      <div className="bg-neutral-900 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">À propos</h3>
        <div className="text-gray-300 mb-4">{community.description}</div>
        <div className="space-y-3 text-gray-400">
          <div className="flex items-center">
            <FiCalendar className="mr-2" />
            <span>Créé le {new Date(community.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center">
            {!community.isPrivate ? (
              <FiGlobe className="mr-2 text-green-500" />
            ) : (
              <FiLock className="mr-2 text-yellow-500" />
            )}
            <span>Visibilité: {!community.isPrivate ? 'Publique' : 'Privée'}</span>
          </div>
          <div className="flex items-center">
            <FiUsers className="mr-2" />
            <span>Créé par {community.creator.username}</span>
          </div>
        </div>
        <div className="mt-4 border-t border-neutral-800 pt-4">
          <div className="text-lg font-bold">{totalMembers}</div>
          <div className="text-gray-400 text-sm">Membre{totalMembers > 1 ? 's' : ''}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`flex justify-center p-4 ${isMobile ? 'flex-col' : ''}`}>
        <div className="w-full max-w-[1000px]">
          <div className="relative mb-8">
            <div 
              className="w-full h-36 overflow-hidden rounded-2xl bg-neutral-900" 
            >
              {bannerUrl && (
                <img 
                  src={bannerUrl}
                  alt={`Bannière de ${community.name}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute -bottom-14 left-8">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#1E1E1E] bg-neutral-800 flex items-center justify-center">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl}
                    alt={community.name} 
                    className="w-full h-full object-cover" 
                    loading="eager" 
                  />
                ) : (
                  <span className="text-4xl font-bold text-green-500">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`flex justify-between items-center mb-4 ${isMobile ? 'flex-col items-start' : ''}`}>
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold text-white ${isMobile ? 'ml-0 mt-[-15px] mb-4' : 'ml-40 -mt-8'}`}>
                h/{community.name}
              </h1>
            </div>
            <div className={`flex gap-2 ${isMobile ? 'flex-row w-full justify-end mt-2' : ''}`}>
              <Link 
                href="#" 
                onClick={handleCreatePost}
                className="inline-flex items-center border border-green-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <FiPlus className="mr-2" /> Créer un post
              </Link>
              {currentUserId && (
                <button 
                  onClick={handleJoinCommunity}
                  className={`${isMember ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-green-700 hover:bg-green-800'} transition-colors text-white px-6 py-2 rounded-lg font-medium flex items-center`}
                >
                  <span>{isMember ? 'Quitter' : 'Rejoindre'}</span>
                </button>
              )}
              {(isModerator || (currentUserId && parseInt(currentUserId) === community.creator.id)) && (
                <Link href={`/community/${community.name}/settings`} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
                  <FiMoreHorizontal size={24} />
                </Link>
              )}
            </div>
          </div>

          {isMobile && (
            <div className="w-full space-y-6 mb-8">
              <AboutSection />
              <CommunityRules 
                communityName={community.name} 
                rules={community.rules || []}
              />
            </div>
          )}

          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
            <div className="flex-grow">
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    subName={community.name}
                    timeAgo=""
                    title={post.title}
                    imageUrl={post.media && post.media.length > 0 
                      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.media[0].url}` 
                      : undefined}
                    postUrl={`/post/${post.id}`}
                    subAvatar={avatarUrl}
                    createdAt={post.createdAt}
                  />
                ))}
              </div>
              {posts.length === 0 && (
                <div className="text-center py-20 bg-neutral-900 rounded-2xl">
                  <FiInfo size={48} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-xl text-gray-400">Aucune publication dans cette communauté pour le moment</p>
                </div>
              )}
            </div>

            {!isMobile && (
              <div className="w-full md:w-80 space-y-6">
                <AboutSection />
                <CommunityRules 
                  communityName={community.name} 
                  rules={community.rules || []}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
} 