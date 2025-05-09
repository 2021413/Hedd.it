'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface CommentFormProps {
  postId: number;
  parentCommentId?: number;
  onCommentAdded?: () => void;
  placeholder?: string;
  isReply?: boolean;
}

export default function CommentForm({ 
  postId, 
  parentCommentId, 
  onCommentAdded,
  placeholder = "Ajouter un commentaire...",
  isReply = false
}: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('jwt');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Vous devez être connecté pour commenter');
        router.push('/login');
        return;
      }
      
      const commentData = {
        data: {
          content,
          author: userId,
          post: postId,
          ...(parentCommentId && { parent: parentCommentId })
        }
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de l\'envoi du commentaire');
      }
      
      setContent('');
      toast.success(isReply ? 'Réponse envoyée' : 'Commentaire ajouté');
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Erreur de commentaire:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`${isReply ? 'mt-3' : 'mb-8'}`}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-800 text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
        rows={isReply ? 3 : 5}
        disabled={isSubmitting}
      />
      <div className="mt-2 flex justify-end">
        <button 
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`
            bg-green-900 text-white px-5 py-2 rounded-full hover:bg-green-800 transition-colors
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            ${!content.trim() ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? 'Envoi...' : isReply ? 'Répondre' : 'Commenter'}
        </button>
      </div>
    </form>
  );
} 