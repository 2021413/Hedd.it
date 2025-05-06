"use client";
import React, { useState, useEffect } from "react";
import "./globals.css";
import Header from "../components/header/Header";
import LockedHeader from "../components/header/LockedHeader";
import BurgerButton from "../components/ui/BurgerButton";
import Sidebar from "../components/sidebar/Sidebar";
import { FiMenu } from 'react-icons/fi';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuWidth = 240;
    const strokeLeft = menuOpen ? menuWidth + 50 : 50;
    const burgerSize = 64;
    const burgerTop = 50; // 50px sous le haut du main
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth <= 1200);
        
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1200);
            if (window.innerWidth <= 1200 && menuOpen) {
                setMenuOpen(false); // Close the menu if the screen is resized to a larger mobile size
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
                    <div className="fixed top-0 left-0 right-0 z-[100]">
                        <Header 
                            showBurgerButton={isMobile} 
                            onBurgerClick={() => setMenuOpen(!menuOpen)}
                            isMenuOpen={menuOpen}
                        />
                    </div>
                    
                    {/* Intégration du Sidebar */}
                    <Sidebar 
                        isOpen={menuOpen} 
                        width={menuWidth} 
                        strokeLeft={strokeLeft} 
                        showBurgerButton={isMobile}
                        onBurgerClick={() => setMenuOpen(!menuOpen)}
                        isMenuOpen={menuOpen}
                    />
                    
                    <main className="p-4 relative min-h-[calc(100vh-56px)] pt-[76px]" style={mainStyle}>
                        {/* Conditionally render stroke and BurgerButton */}
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
                </div>
            </body>
        </html>
    );
}


