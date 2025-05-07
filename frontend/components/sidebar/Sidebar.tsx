import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPlusCircle, FiList, FiUsers, FiClock, FiTrendingUp } from 'react-icons/fi';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

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
    { icon: <FiList size={20} />, label: 'Subreddits', href: '/subreddits' },
    { icon: <FiUsers size={20} />, label: 'Communautés', href: '/communities' },
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
              <Link href={item.href} className="flex items-center px-6 py-3 text-gray-300 hover:bg-[#252525] hover:text-white transition-colors w-full">
                <span className="mr-4">{item.icon}</span>
                <span className="text-lg whitespace-nowrap">{item.label}</span>
              </Link>
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