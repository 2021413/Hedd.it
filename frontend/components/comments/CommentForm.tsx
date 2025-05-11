'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import LoginForm from '../auth/LoginForm';

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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const submitComment = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setShowLoginModal(true);
      return false;
    }

    const commentData = {
      data: {
        content,
        post: postId,
        ...(parentCommentId && { parent: parentCommentId })
      }
    };
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`.trim()
      },
      body: JSON.stringify(commentData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du commentaire');
    }
    
    const responseData = await response.json();
    
    if (!responseData.data) {
      throw new Error('Format de réponse invalide');
    }
    
    setContent('');
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.classList.add('animate-success');
      setTimeout(() => textarea.classList.remove('animate-success'), 600);
    }
    toast.success(isReply ? 'Réponse envoyée' : 'Commentaire ajouté');
    
    if (onCommentAdded) {
      setTimeout(() => onCommentAdded(), 100);
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await submitComment();
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    try {
      setIsSubmitting(true);
      const success = await submitComment();
      if (!success) {
        setShowLoginModal(true);
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className={`${isReply ? 'mt-3' : 'mb-8'}`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-neutral-800 text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 border border-neutral-700 focus:border-green-500"
          rows={isReply ? 3 : 5}
          disabled={isSubmitting}
          style={{ minHeight: isReply ? 60 : 100 }}
        />
        <div className="mt-2 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`
              bg-green-900 text-white px-5 py-2 rounded-full hover:bg-green-800 transition-colors
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              ${!content.trim() ? 'opacity-50 cursor-not-allowed' : ''}
              shadow-md hover:shadow-green-700
            `}
          >
            {isSubmitting ? 'Envoi...' : isReply ? 'Répondre' : 'Commenter'}
          </button>
        </div>
      </form>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <LoginForm
              onModeChange={() => {}}
              onSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
} 