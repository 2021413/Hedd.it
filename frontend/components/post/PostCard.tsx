'use client';

import { useState } from "react";
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiLink } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface PostCardProps {
  subName: string;
  timeAgo: string;
  title: string;
  imageUrl?: string;
  postUrl: string;
  subAvatar: string;
}

export default function PostCard({ subName, timeAgo, title, imageUrl, postUrl, subAvatar }: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = () => {
    // Extraire l'ID du post de l'URL
    const postId = postUrl.split('/').pop();
    router.push(`/post/${postId}`);
  };

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/community/${subName}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-transparent hover:bg-neutral-900 transition-colors duration-200 text-white p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto cursor-pointer"
    >
      <div className="text-base mb-2 flex items-center gap-2">
        <img 
          src={subAvatar || "https://picsum.photos/200/200?random=" + subName} 
          alt={`h/${subName}`} 
          className="w-8 h-8 rounded-full object-cover"
        />
        <span 
          onClick={handleCommunityClick}
          className="font-semibold text-lg text-white hover:text-green-500 transition-colors cursor-pointer"
        >
          h/{subName}
        </span>
        <span className="text-base text-gray-400">• il y a {timeAgo}</span>
      </div>
      <h2 className="text-2xl font-extrabold mb-5 leading-tight">{title}</h2>
      <div className="rounded-xl overflow-hidden mb-5">
        <img src={imageUrl} alt="post" className="w-full object-cover aspect-square max-h-[480px]" />
      </div>
      <div className="flex items-center justify-between text-gray-300 mt-4">
        <div className="flex space-x-6">
          <button className="hover:text-white" aria-label="Like"><FiThumbsUp size={28} /></button>
          <button className="hover:text-white" aria-label="Dislike"><FiThumbsDown size={28} /></button>
          <button className="hover:text-white" aria-label="Comment"><FiMessageCircle size={28} /></button>
        </div>
        <button onClick={handleShare} className="hover:text-green-500 flex items-center gap-2 text-lg" aria-label="Partager">
          <FiLink size={22} /> {copied ? "Copié !" : "Partager"}
        </button>
      </div>
    </div>
  );
}
