"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PostForm from "@/components/post/PostForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";

// Type pour les données du post
interface PostData {
  data: {
    title: string;
    content: string;
    author: string | number;
    community: any; // Format flexible pour tester différentes approches
    media?: any; // Format flexible pour tester différentes approches
  }
}

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
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(`Erreur lors de l'upload de l'image: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult[0].id;
  } catch (error) {
    return null;
  }
}

export default function CreatePostPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<{
    id: number;
    name: string;
    avatar: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer la liste des communautés depuis l'API
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          toast.error('Vous devez être connecté pour créer un post');
          router.push('/login');
          return;
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/communities?populate=*&filters[members][id][$eq]=${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des communautés');
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          const allCommResponse = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/communities?populate=*`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (!allCommResponse.ok) {
            throw new Error('Erreur lors de la récupération des communautés alternatives');
          }
          
          const allCommData = await allCommResponse.json();
          if (!allCommData.data) {
            throw new Error('Format de données incorrect');
          }
          
          data.data = allCommData.data;
        }
        
        const formattedCommunities = data.data.map((comm: any) => {
          let id = comm.id;
          let name = "";
          let avatarUrl = "";
          
          if (comm.attributes) {
            name = comm.attributes.name || `Communauté ${id}`;
            
            if (comm.attributes.avatar && comm.attributes.avatar.data) {
              const avatarData = comm.attributes.avatar.data;
              if (avatarData.attributes && avatarData.attributes.url) {
                avatarUrl = avatarData.attributes.url;
              }
            }
          } else {
            name = comm.name || `Communauté ${id}`;
            
            if (comm.avatar) {
              if (typeof comm.avatar === 'object') {
                if (comm.avatar.url) {
                  avatarUrl = comm.avatar.url;
                } else if (comm.avatar.data && comm.avatar.data.attributes) {
                  avatarUrl = comm.avatar.data.attributes.url;
                }
              } else if (typeof comm.avatar === 'string') {
                avatarUrl = comm.avatar;
              }
            }
          }
          
          if (!avatarUrl) {
            avatarUrl = `https://placehold.co/100x100/191919/39FF14?text=${name.charAt(0).toUpperCase()}`;
          } else if (avatarUrl.startsWith('/')) {
            avatarUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}${avatarUrl}`;
          }
          
          return {
            id,
            name,
            avatar: avatarUrl
          };
        });
        
        setCommunities(formattedCommunities);
      } catch (error) {
        toast.error("Impossible de charger les communautés");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [router]);
  
  const handleSubmit = async (data: {
    title: string;
    content: string;
    selectedImage: string | null;
    selectedSub: string;
  }) => {
    try {
      setPosting(true);
      setError(null);
      
      const token = localStorage.getItem('jwt');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Vous devez être connecté pour créer un post');
        router.push('/login');
        return;
      }

      let mediaId = null;
      if (data.selectedImage) {
        mediaId = await uploadImage(data.selectedImage, token);
      }

      const communityId = parseInt(data.selectedSub, 10);
      
      if (isNaN(communityId)) {
        throw new Error("ID de communauté invalide");
      }

      const postData: PostData = {
        data: {
          title: data.title,
          content: data.content,
          author: userId,
          community: {
            set: [communityId]
          }
        }
      };

      if (mediaId) {
        postData.data.media = {
          set: [mediaId]
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: 'Erreur lors de la création du post' } };
        }
        
        throw new Error(errorData.error?.message || `Erreur ${response.status}: Impossible de créer le post`);
      }

      const result = await response.json();
      const postId = result.data?.id;
      
      if (!postId) {
        toast.success('Post créé avec succès!');
        router.push('/');
        return;
      }

      try {
        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${postId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              data: {
                community: communityId
              }
            })
          }
        );
        
        let successMessage = "Post créé avec succès!";
        
        if (updateResponse.ok) {
          successMessage += " Relation communauté établie.";
        } else {
          successMessage += " (Note: La relation avec la communauté n'a pas pu être renforcée)";
        }
        
        toast.success(successMessage);
        router.push('/');
      } catch (error) {
        toast.success('Post créé avec succès!');
        router.push('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du post';
      setError(errorMessage);
      toast.error(errorMessage);
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
        <h1 className="text-3xl font-bold mb-2">Créer un post</h1>
        <p className="text-gray-400">Partagez quelque chose d'intéressant avec la communauté</p>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg mb-4 text-white">
          <h3 className="font-bold mb-1">Erreur:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-8 bg-neutral-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Aucune communauté disponible</h3>
          <p className="text-gray-400 mb-4">Vous n'avez rejoint aucune communauté ou aucune communauté n'existe encore.</p>
          <Link href="/create-community" className="px-6 py-3 rounded-full bg-green-900 hover:bg-green-800 transition-colors inline-block">
            Créer une communauté
          </Link>
        </div>
      ) : (
        <PostForm 
          onSubmit={handleSubmit}
          subreddits={communities} 
        />
      )}
      
      {posting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-white">Création du post en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
} 