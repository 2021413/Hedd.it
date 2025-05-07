import { Bell, Plus, MessageCircle, Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FiMenu } from 'react-icons/fi';

interface HeaderProps {
    showBurgerButton: boolean;
    onBurgerClick: () => void;
    isMenuOpen: boolean;
    user: {
        id: number;
        username: string;
        email: string;
    } | null;
}

const Header: React.FC<HeaderProps> = ({ showBurgerButton, onBurgerClick, isMenuOpen, user }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="w-full bg-[#1E1E1E] text-white px-2 sm:px-4 py-4 flex items-center justify-between shadow border-b-2 border-[#003E1C]">
            <div className="flex items-center">
                {showBurgerButton && <FiMenu size={24} className="mr-4 cursor-pointer" onClick={onBurgerClick} />}
                <h1 className="text-xl sm:text-2xl font-bold text-[#75BB99]">Hedd.it</h1>
            </div>
            <div className="flex-1 flex justify-center mx-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher dans Hedd.it"
                        className="bg-green-100 text-black rounded-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 focus:outline-none w-[200px] sm:w-[300px] md:w-[400px] border-2 border-[#75BB99] text-sm sm:text-base"
                    />
                    <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-black">
                        <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <MessageCircle size={18} className="sm:w-[20px] sm:h-[20px]" />
                <div className="relative" ref={dropdownRef}>
                    <button 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <Plus size={18} className="sm:w-[20px] sm:h-[20px]" />
                        <span className="hidden sm:inline">Créer</span>
                        <ChevronDown size={14} className="hidden sm:inline" />
                    </button>
                    
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50">
                            <Link 
                                href="/create-post" 
                                className="block px-4 py-2 text-sm hover:bg-zinc-700"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Créer un post
                            </Link>
                            <Link 
                                href="/create-community" 
                                className="block px-4 py-2 text-sm hover:bg-zinc-700"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Créer une communauté
                            </Link>
                        </div>
                    )}
                </div>
                <Bell size={18} className="sm:w-[20px] sm:h-[20px]" />
                <div className="relative" ref={profileMenuRef}>
                    <button 
                        className="cursor-pointer"
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        aria-label="Menu profil"
                    >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white relative">
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                        </div>
                    </button>
                    
                    {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50 border border-[#003E1C]">
                            <div className="px-4 py-2 text-sm border-b border-zinc-700">
                                Connecté en tant que<br />
                                <span className="font-semibold">{user?.username}</span>
                            </div>
                            <Link 
                                href="/profile" 
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700"
                                onClick={() => setProfileMenuOpen(false)}
                            >
                                <User size={16} />
                                Profil
                            </Link>
                            <Link 
                                href="/settings" 
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700"
                                onClick={() => setProfileMenuOpen(false)}
                            >
                                <Settings size={16} />
                                Paramètres
                            </Link>
                            <div className="border-t border-zinc-700 my-1"></div>
                            <button 
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700 w-full text-left text-red-400"
                                onClick={() => {
                                    setProfileMenuOpen(false);
                                    handleLogout();
                                }}
                            >
                                <LogOut size={16} />
                                Se déconnecter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
