"use client";
import React, { useState, useEffect } from "react";
import "./globals.css";
import Header from "../components/header/Header";
import LockedHeader from "../components/header/LockedHeader";
import BurgerButton from "../components/ui/BurgerButton";
import Sidebar from "../components/sidebar/Sidebar";
import { FiMenu } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

interface User {
    id: number;
    username: string;
    email: string;
    avatar?: {
        id: number;
        hash: string;
        ext: string;
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const menuWidth = 240;
    const strokeLeft = menuOpen ? menuWidth + 50 : 50;
    const burgerSize = 64;
    const burgerTop = 50;
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Vérifier l'authentification au chargement
        const checkAuth = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('jwt');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[avatar][fields][0]=hash&populate[avatar][fields][1]=ext`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const userData = await response.json();
                const userToStore = {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    avatar: userData.avatar ? {
                        id: userData.avatar.id,
                        hash: userData.avatar.hash,
                        ext: userData.avatar.ext
                    } : undefined
                };

                localStorage.setItem('user', JSON.stringify(userToStore));
                setUser(userToStore);
                setIsAuthenticated(true);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors de la vérification du token:', error);
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
            }
        };

        // Vérifier l'auth au montage
        checkAuth();

        // Écouter l'événement auth-change
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('auth-change', handleAuthChange);

        // Écouter les changements de storage pour la synchronisation multi-onglets
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'jwt' || e.key === 'user') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Vérifier toutes les 5 minutes
        const interval = setInterval(checkAuth, 5 * 60 * 1000);

        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setIsMobile(window.innerWidth <= 1200);
        
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1200);
            if (window.innerWidth <= 1200 && menuOpen) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [menuOpen]);

    const mainStyle = {
        transition: 'margin-left 0.3s ease, width 0.3s ease',
        marginLeft: menuOpen ? `${menuWidth}px` : '0',
        width: menuOpen ? `calc(100% - ${menuWidth}px)` : '100%',
    };

    return (
        <html lang="fr">
            <body>
                <div className="bg-[#1E1E1E] text-white min-h-screen relative">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="fixed top-0 left-0 right-0 z-[100]">
                                {isAuthenticated ? (
                                    <Header 
                                        showBurgerButton={isMobile} 
                                        onBurgerClick={() => setMenuOpen(!menuOpen)}
                                        isMenuOpen={menuOpen}
                                        user={user}
                                    />
                                ) : (
                                    <LockedHeader 
                                        showBurgerButton={isMobile} 
                                        onBurgerClick={() => setMenuOpen(!menuOpen)}
                                        isMenuOpen={menuOpen}
                                        user={user}
                                    />
                                )}
                            </div>
                            
                            <Sidebar 
                                isOpen={menuOpen} 
                                width={menuWidth} 
                                strokeLeft={strokeLeft} 
                                showBurgerButton={isMobile}
                                onBurgerClick={() => setMenuOpen(!menuOpen)}
                                isMenuOpen={menuOpen}
                                user={user}
                            />
                            
                            <main className="p-4 relative min-h-[calc(100vh-56px)] pt-[76px]" style={mainStyle}>
                                {!isMobile && (
                                    <div
                                        className="fixed w-[2px] bg-[#003E1C] transition-all duration-300"
                                        style={{ left: strokeLeft, top: 0, height: '100vh', zIndex: 40 }}
                                    ></div>
                                )}
                                {!isMobile && (
                                    <BurgerButton
                                        left={`calc(${strokeLeft}px - ${burgerSize / 2 - 1}px)`}
                                        top={burgerTop + 56}
                                        onClick={() => setMenuOpen((v) => !v)}
                                        isOpen={menuOpen}
                                    />
                                )}
                                {children}
                            </main>
                        </>
                    )}
                </div>
                <Toaster position="bottom-right" />
            </body>
        </html>
    );
}


