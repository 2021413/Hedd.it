'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiInfo, FiPlus, FiMoreHorizontal, FiGlobe, FiLock } from 'react-icons/fi';
import PostCard from '@/components/post/PostCard';
import CommunityRules from '@/components/community/CommunityRules';
import Link from 'next/link';

// Type pour les données d'un post
interface Post {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  postUrl: string;
}

// Type pour les règles
interface Rule {
  id: number;
  title: string;
  description: string;
}

// Type pour les données d'une communauté
interface Community {
  name: string;
  description: string;
  memberCount: number;
  connectedMembers: number;
  createdAt: string;
  posts: Post[];
  rules: Rule[];
  avatar: string;
  bannerImage: string;
  visibility: 'public' | 'private';
  creationDate: string;
}

export default function CommunityPage({ params }: { params: { name: string } }) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Définir isMobile basé sur la largeur de la fenêtre
    setIsMobile(window.innerWidth <= 768);
    
    // Simule le chargement des données de la communauté
    // Dans une vraie application, vous feriez un appel API ici
    const fetchCommunity = async () => {
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCommunity: Community = {
          name: params.name,
          description: "Ceci est une description de la communauté. Vous pouvez y trouver des discussions sur divers sujets liés à " + params.name,
          memberCount: 1000,
          connectedMembers: 300,
          createdAt: "2 ans",
          avatar: "https://picsum.photos/200/200?random=" + params.name,
          bannerImage: "https://picsum.photos/1000/300?random=" + params.name,
          visibility: 'public',
          creationDate: "1 jan, 2023",
          posts: [
            {
              id: "1",
              title: "Titre du post",
              imageUrl: "https://picsum.photos/800/600?random=1",
              createdAt: "1 jour",
              postUrl: "/post/1"
            },
            {
              id: "2",
              title: "Un autre post intéressant",
              imageUrl: "https://picsum.photos/800/600?random=2",
              createdAt: "3 jours",
              postUrl: "/post/2"
            }
          ],
          rules: [
            {
              id: 1,
              title: "Respect mutuel",
              description: "Traitez les autres membres avec respect et courtoisie."
            },
            {
              id: 2,
              title: "Contenu pertinent",
              description: "Les publications doivent être en rapport avec le thème de la communauté."
            },
            {
              id: 3,
              title: "Pas de spam",
              description: "Les publicités non sollicitées et le spam sont interdits."
            }
          ]
        };
        
        setCommunity(mockCommunity);
      } catch (err) {
        setError("Impossible de charger les données de la communauté");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunity();
  }, [params.name]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Composant pour la section "À propos"
  const AboutSection = () => (
    <div className="bg-neutral-900 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4">À propos</h3>
      <div className="text-gray-300 mb-4">{community?.description}</div>
      <div className="space-y-3 text-gray-400">
        <div className="flex items-center">
          <FiCalendar className="mr-2" />
          <span>Créé le {community?.creationDate}</span>
        </div>
        <div className="flex items-center">
          {community?.visibility === 'public' ? (
            <FiGlobe className="mr-2 text-green-500" />
          ) : (
            <FiLock className="mr-2 text-yellow-500" />
          )}
          <span>Visibilité: {community?.visibility === 'public' ? 'Publique' : 'Privée'}</span>
        </div>
      </div>
      <div className="mt-4 border-t border-neutral-800 pt-4 flex justify-between">
        <div>
          <div className="text-lg font-bold">{community?.memberCount}</div>
          <div className="text-gray-400 text-sm">Membres</div>
        </div>
        <div className="flex items-center flex-col">
          <div className="text-lg font-bold self-start">{community?.connectedMembers}</div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1" />
            <div className="text-gray-400 text-sm">Connectés</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

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

  return (
    <div className={`flex justify-center p-4 ${isMobile ? 'flex-col' : ''}`}>
      <div className="w-full max-w-[1000px]">
        {/* Community banner and info */}
        <div className="relative mb-8">
          <div className="w-full h-36 overflow-hidden rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${community.bannerImage})` }}></div>
          <div className="absolute -bottom-14 left-8">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#1E1E1E]">
              <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" loading="eager" />
            </div>
          </div>
        </div>

        {/* Community text and buttons */}
        <div className={`flex justify-between items-center mb-4 ${isMobile ? 'flex-col items-start' : ''}`}>
          <div className="flex items-center">
            <h1 className={`text-2xl font-bold text-white ${isMobile ? 'ml-0 mt-[-15px] mb-4' : 'ml-40 -mt-8'}`}>h/{community.name}</h1>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'flex-row w-full justify-end mt-2' : ''}`}>
            <Link href="/create-post" className="inline-flex items-center border border-green-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              <FiPlus className="mr-2" /> Créer un post
            </Link>
            <button className="bg-green-700 hover:bg-green-800 transition-colors text-white px-6 py-2 rounded-lg font-medium flex items-center">
              <span>Rejoindre</span>
            </button>
            <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
              <FiMoreHorizontal size={24} />
            </button>
          </div>
        </div>

        {/* Reorder sections for mobile */}
        {isMobile && (
          <div className="w-full space-y-6 mb-8">
            <AboutSection />
            <CommunityRules communityName={community.name} rules={community.rules} />
          </div>
        )}

        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-8`}>
          {/* Main column - Posts */}
          <div className="flex-grow">
            <div className="space-y-6">
              {community.posts.map((post) => (
                <PostCard
                  key={post.id}
                  subName={community.name}
                  timeAgo={post.createdAt}
                  title={post.title}
                  imageUrl={post.imageUrl}
                  postUrl={post.postUrl}
                  subAvatar={community.avatar}
                />
              ))}
            </div>
            {community.posts.length === 0 && (
              <div className="text-center py-20 bg-neutral-900 rounded-2xl">
                <FiInfo size={48} className="mx-auto mb-4 text-gray-500" />
                <p className="text-xl text-gray-400">Aucune publication dans cette communauté pour le moment</p>
              </div>
            )}
          </div>

          {/* Sidebar column - Info */}
          {!isMobile && (
            <div className="w-full md:w-80 space-y-6">
              <AboutSection />
              <CommunityRules communityName={community.name} rules={community.rules} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 