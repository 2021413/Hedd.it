import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPlusCircle, FiUsers, FiClock, FiTrendingUp, FiChevronDown } from 'react-icons/fi';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface Community {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description: string;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

interface SidebarProps {
  showBurgerButton: boolean;
  onBurgerClick?: () => void;
  isMenuOpen?: boolean;
  isOpen: boolean;
  width: number;
  strokeLeft: number;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ showBurgerButton, onBurgerClick, isMenuOpen, isOpen, width, strokeLeft }) => {
  const pathname = usePathname();
  const [showBottomItems, setShowBottomItems] = useState(false);
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/communities?populate=*`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des communautés');
        }
        
        const responseData = await response.json();
        
        if (!responseData.data) {
          setCommunities([]);
          return;
        }
        
        if (Array.isArray(responseData.data)) {
          const validCommunities = responseData.data.filter((community: Partial<Community>) => 
            community && 
            community.attributes && 
            (community.attributes.name || community.attributes.slug)
          );
          
          setCommunities(validCommunities as Community[]);
        } else {
          setCommunities([]);
        }
      } catch (error) {
        setCommunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCommunities();
    }
  }, [isOpen]);
  
  // Gestion de l'affichage des éléments du bas avec délai
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen) {
      // Attendre que la transition d'ouverture soit terminée avant d'afficher les éléments du bas
      timer = setTimeout(() => {
        setShowBottomItems(true);
      }, 300); // Même durée que la transition
    } else {
      // Masquer immédiatement les éléments du bas lors de la fermeture
      setShowBottomItems(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);
  
  const menuItems = [
    { icon: <FiHome size={20} />, label: 'Accueil', href: '/' },
    { icon: <FiPlusCircle size={20} />, label: 'Créer un post', href: '/create-post' },
    { icon: <FiUsers size={20} />, label: 'Communautés', href: '/communities', hasDropdown: true },
    { icon: <FiClock size={20} />, label: 'Récent', href: '/recent' },
    { icon: <FiTrendingUp size={20} />, label: 'Populaires', href: '/popular' },
  ];

  // Calculer la largeur exacte pour s'arrêter à la stroke
  const sidebarWidth = isOpen ? `${strokeLeft}px` : '0';

  return (
    <div 
      className={`fixed top-[85px] left-0 h-[calc(100vh-90px)] bg-[#1E1E1E] z-10 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ width: sidebarWidth }}
    >
      <nav className="py-4 h-full flex flex-col w-full">
        <ul className="space-y-2 w-full">
          {menuItems.map((item, index) => (
            <li key={index} className="w-full">
              {item.hasDropdown ? (
                <div>
                  <button 
                    onClick={() => setIsCommunitiesOpen(!isCommunitiesOpen)}
                    className="flex items-center justify-between px-6 py-3 text-gray-300 hover:bg-[#252525] hover:text-white transition-colors w-full"
                  >
                    <div className="flex items-center">
                      <span className="mr-4">{item.icon}</span>
                      <span className="text-lg whitespace-nowrap">{item.label}</span>
                    </div>
                    <FiChevronDown 
                      size={20} 
                      className={`transition-transform duration-200 ${isCommunitiesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isCommunitiesOpen && (
                    <div className="pl-14 py-2 space-y-2">
                      {isLoading ? (
                        <div className="text-gray-400">Chargement...</div>
                      ) : communities.length > 0 ? (
                        communities.map((community) => {
                          const communitySlug = community.attributes?.slug || 
                            community.attributes?.name?.toLowerCase().replace(/\s+/g, '-');
                          const communityName = community.attributes?.name || 'Sans nom';
                          
                          return (
                            <Link 
                              key={community.id}
                              href={`/community/${communitySlug}`}
                              className="block text-gray-300 hover:text-white transition-colors"
                            >
                              {communityName}
                            </Link>
                          );
                        })
                      ) : (
                        <div className="text-gray-400">Aucune communauté trouvée</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href} className="flex items-center px-6 py-3 text-gray-300 hover:bg-[#252525] hover:text-white transition-colors w-full">
                  <span className="mr-4">{item.icon}</span>
                  <span className="text-lg whitespace-nowrap">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
        
        {showBottomItems && (
          <div 
            className="mt-auto w-full transition-opacity duration-500"
            style={{ animation: 'fadeIn 0.5s ease-in-out forwards' }}
          >
            <ul className="w-full">
              <li className="w-full">
                <Link
                  href="/settings"
                  className={`flex items-center px-6 py-3 text-gray-300 hover:bg-[#252525] hover:text-white transition-colors w-full ${
                    pathname === '/settings' ? 'bg-[#252525]' : ''
                  }`}
                >
                  <span className="mr-4"><Cog6ToothIcon className="h-5 w-5" /></span>
                  <span className="text-lg whitespace-nowrap">Paramètres</span>
                </Link>
              </li>
            </ul>
            
            <div className="p-4 border-t border-[#333333] text-center text-sm text-gray-400 w-full">
              © {new Date().getFullYear()} Hedd.it
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </nav>
    </div>
  );
};

export default Sidebar; 