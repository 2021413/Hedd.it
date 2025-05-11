"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import CommunityForm from "@/components/subreddit/CommunityForm";
import { toast } from "react-hot-toast";
import { useState } from "react";

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
    return null;
  }
}

export default function CreateCommunityPage() {
  const router = useRouter();
  const [posting, setPosting] = useState(false);
  
  const handleSubmit = async (data: {
    name: string;
    description: string;
    avatar: string | null;
    banner: string | null;
    visibility: string;
  }) => {
    try {
      setPosting(true);
      const token = localStorage.getItem('jwt');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Vous devez être connecté pour créer une communauté');
        router.push('/login');
        return;
      }

      const [avatarId, bannerId] = await Promise.all([
        data.avatar ? uploadImage(data.avatar, token) : Promise.resolve(null),
        data.banner ? uploadImage(data.banner, token) : Promise.resolve(null),
      ]);

      interface CommunityData {
        name: string;
        description: string;
        isPrivate: boolean;
        creator: number;
        avatar?: number | null;
        banner?: number | null;
      }

      const requestBody = {
        data: {
          name: data.name,
          description: data.description,
          isPrivate: data.visibility === "private",
          creator: parseInt(userId),
          ...(avatarId && { avatar: avatarId }),
          ...(bannerId && { banner: bannerId })
        } as CommunityData
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Erreur lors de la création de la communauté');
      }

      toast.success('Communauté créée avec succès !');
      
      if (!responseData.data) {
        throw new Error('Structure de réponse inattendue');
      }

      const communitySlug = responseData.data.slug || responseData.data.name.toLowerCase().replace(/\s+/g, '_');
      router.push(`/community/${communitySlug}`);
    } catch (error) {
      toast.error('Une erreur est survenue lors de la création de la communauté');
    } finally {
      setPosting(false);
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
        <h1 className="text-3xl font-bold mb-2">Créer une communauté</h1>
        <p className="text-gray-400">Créez un espace pour partager vos passions et intérêts</p>
      </div>
      
      <CommunityForm onSubmit={handleSubmit} />

      {posting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-white">Création de la communauté en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
}