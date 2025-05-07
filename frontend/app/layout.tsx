"use client";
import React, { useState, useEffect } from "react";
import "./globals.css";
import Header from "../components/header/Header";
import LockedHeader from "../components/header/LockedHeader";
import BurgerButton from "../components/ui/BurgerButton";
import Sidebar from "../components/sidebar/Sidebar";
import { FiMenu } from 'react-icons/fi';

interface User {
    id: number;
    username: string;
    email: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const menuWidth = 240;
    const strokeLeft = menuOpen ? menuWidth + 50 : 50;
    const burgerSize = 64;
    const burgerTop = 50;
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Vérifier l'authentification au chargement
        const checkAuth = () => {
            const token = localStorage.getItem('jwt');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                setIsAuthenticated(true);
                setUser(JSON.parse(storedUser));
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        // Vérifier l'auth au montage
        checkAuth();

        // Écouter les changements de storage pour la synchronisation multi-onglets
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'jwt' || e.key === 'user') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
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

    // Vérifier la validité du token périodiquement
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    // Token invalide ou expiré
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du token:', error);
            }
        };

        // Vérifier toutes les 5 minutes
        const interval = setInterval(verifyToken, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <html lang="fr">
            <body>
                <div className="bg-[#1E1E1E] text-white min-h-screen relative">
                    <div className="fixed top-0 left-0 right-0 z-[100]">
                        {isAuthenticated ? (
                            <Header 
                                showBurgerButton={isMobile} 
                                onBurgerClick={() => setMenuOpen(!menuOpen)}
                                isMenuOpen={menuOpen}
                                user={user}
                            />
                        ) : (
                            <LockedHeader />
                        )}
                    </div>
                    
                    {isAuthenticated && (
                        <Sidebar 
                            isOpen={menuOpen} 
                            width={menuWidth} 
                            strokeLeft={strokeLeft} 
                            showBurgerButton={isMobile}
                            onBurgerClick={() => setMenuOpen(!menuOpen)}
                            isMenuOpen={menuOpen}
                            user={user}
                        />
                    )}
                    
                    <main className="p-4 relative min-h-[calc(100vh-56px)] pt-[76px]" style={mainStyle}>
                        {!isMobile && isAuthenticated && (
                            <div
                                className="fixed w-[2px] bg-[#003E1C] transition-all duration-300"
                                style={{ left: strokeLeft, top: 0, height: '100vh', zIndex: 40 }}
                            ></div>
                        )}
                        {!isMobile && isAuthenticated && (
                            <BurgerButton
                                left={`calc(${strokeLeft}px - ${burgerSize / 2 - 1}px)`}
                                top={burgerTop + 56}
                                onClick={() => setMenuOpen((v) => !v)}
                                isOpen={menuOpen}
                            />
                        )}
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}


