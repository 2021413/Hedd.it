"use client"
import PostCard from "../components/post/PostCard";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import AuthModal from "../components/auth/AuthModal";

const fakePosts = [
  {
    subName: "nature",
    timeAgo: "2h",
    title: "Magnifique lever de soleil",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    postUrl: "https://heddit.fr/post/1"
  },
  {
    subName: "tech",
    timeAgo: "30min",
    title: "Nouveau framework JS",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
    postUrl: "https://heddit.fr/post/2"
  }
];

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ouvrir le modal si showAuth est présent dans l'URL
    if (searchParams.get('showAuth') === 'true') {
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

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
      
      {fakePosts.map((post, idx) => (
        <React.Fragment key={idx}>
          <PostCard {...post} />
          {idx < fakePosts.length - 1 && (
            <div className="w-full h-[2px] bg-[#003E1C] my-2 max-w-2xl mx-auto rounded"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
