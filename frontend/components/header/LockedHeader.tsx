"use client"

import { Bell, Plus, MessageCircle, Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import AuthModal from "../auth/AuthModal";
import { FiMenu } from 'react-icons/fi';

interface LockedHeaderProps {
    showBurgerButton?: boolean;
    onBurgerClick?: () => void;
    isMenuOpen?: boolean;
    user?: {
        id: number;
        username: string;
        email: string;
    } | null;
}

export default function LockedHeader({ showBurgerButton, onBurgerClick, isMenuOpen }: LockedHeaderProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <>
            <header className="w-full bg-[#1E1E1E] text-white px-2 sm:px-4 py-4 flex items-center justify-between shadow border-b-2 border-[#003E1C]">
                <div className="flex items-center">
                    {showBurgerButton && <FiMenu size={24} className="mr-4 cursor-pointer" onClick={onBurgerClick} />}
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#75BB99]">Hedd.it</h1>
                    </Link>
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
                <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-[#003E1C] text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-[#002814] transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                    Se connecter
                </button>
            </header>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
