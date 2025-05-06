"use client"

import { useState } from "react";
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiLink, FiArrowLeft } from "react-icons/fi";
import CommentThread, { Comment } from "@/components/comments/CommentThread";
import Link from "next/link";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const [copied, setCopied] = useState(false);
  
  // Exemple de structure imbriquée pour les commentaires
  const post = {
    subName: "nature",
    subAvatar: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80",
    timeAgo: "2h",
    title: "Magnifique lever de soleil",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    postUrl: "https://heddit.fr/post/1",
    content: "Voici un magnifique lever de soleil capturé ce matin. Les couleurs sont vraiment incroyables !",
    author: "Jean Dupont",
    comments: [
      {
        id: 1,
        author: "username",
        content: "Ceci est un commentaire",
        timeAgo: "1h",
        likes: 5,
        replies: [
          {
            id: 2,
            author: "username",
            content: "Ceci est une réponse au commentaire ci-dessus",
            timeAgo: "1h",
            likes: 2,
            replies: []
          }
        ]
      }
    ] satisfies Comment[]
  };

  const handleShare = () => {
    navigator.clipboard.writeText(post.postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête du post */}
      <div className="bg-transparent hover:bg-neutral-900 transition-colors duration-200 text-white p-8 rounded-2xl shadow-lg relative">
        <div className="flex items-center mb-8">
          <Link href="/" className="text-gray-300 hover:text-white">
            <FiArrowLeft size="1.5em" />
          </Link>
        </div>
        <div className="flex items-center mb-2">
          <div className="flex items-center gap-2">
            <img 
              src={post.subAvatar} 
              alt={`h/${post.subName}`} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-lg text-white">h/{post.subName}</span>
            <span className="text-base text-gray-400">• il y a {post.timeAgo}</span>
            <span className="text-base text-gray-400">• par {post.author}</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-5 leading-tight">{post.title}</h1>
        
        <p className="text-lg mb-5">{post.content}</p>
        
        <div className="rounded-xl overflow-hidden mb-5">
          <img src={post.imageUrl} alt="post" className="w-full object-cover aspect-square max-h-[600px]" />
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

      {/* Section des commentaires */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Commentaires</h2>
        
        {/* Zone de commentaire */}
        <div className="mb-8">
          <textarea
            placeholder="Ajouter un commentaire..."
            className="w-full bg-neutral-800 text-white p-4 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="mt-2 bg-green-900 text-white px-6 py-2 rounded-full hover:bg-green-800">
            Commenter
          </button>
        </div>

        {/* Liste des commentaires imbriqués */}
        <div className="space-y-6">
          {post.comments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
} 