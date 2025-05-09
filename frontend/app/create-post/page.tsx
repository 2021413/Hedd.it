"use client";

import { useRouter } from "next/navigation";
import PostForm from "@/components/post/PostForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";

async function uploadImage(base64Image: string, token: string): Promise<number | null> {
  if (!base64Image) return null;

  try {
    const base64Response = await fetch(base64Image);
    const blob = await base64Response.blob();

    const formData = new FormData();
    formData.append('files', blob);

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Erreur lors de l\'upload de l\'image');
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult[0].id;
  } catch (error) {
    console.error('Erreur upload image:', error);
    return null;
  }
}

export default function CreatePostPage() {
  const router = useRouter();
  
  const handleSubmit = async (data: {
    title: string;
    content: string;
    selectedImage: string | null;
    selectedSub: string;
  }) => {
    try {
      const token = localStorage.getItem('jwt');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Vous devez être connecté pour créer un post');
        router.push('/login');
        return;
      }

      // Upload de l'image si présente
      const mediaId = data.selectedImage ? await uploadImage(data.selectedImage, token) : null;

      console.log('Données du formulaire:', data);

      const postData = {
        data: {
          title: data.title,
          content: data.content,
          media: mediaId,
          author: userId,
          community: data.selectedSub
        }
      };

      console.log('Données envoyées à l\'API:', postData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de l\'API:', errorData);
        throw new Error(errorData.error?.message || 'Erreur lors de la création du post');
      }

      const result = await response.json();
      toast.success('Post créé avec succès !');
      router.push('/');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du post');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-gray-300 hover:text-white">
          <FiArrowLeft size="1.5em" />
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer un post</h1>
        <p className="text-gray-400">Partagez quelque chose d'intéressant avec la communauté</p>
      </div>
      
      <PostForm 
        onSubmit={handleSubmit}
        subreddits={[
          { name: "nature", avatar: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80" },
          { name: "tech", avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" },
          { name: "gaming", avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80" },
          { name: "food", avatar: "https://images.unsplash.com/photo-1532980400857-e8d9d275d858?auto=format&fit=crop&w=400&q=80" },
        ]} 
      />
    </div>
  );
} 