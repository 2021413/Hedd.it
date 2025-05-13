import { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiShare2, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CommunityForm from '@/components/community/CommunityForm';
import { useRouter } from 'next/navigation';

interface CommunityMenuProps {
  community: {
    id: number;
    name: string;
    description: string;
    isPrivate: boolean;
    avatar: any;
    banner: any;
    slug: string | null;
    rules?: string[];
  };
  isModerator: boolean;
  onUpdate: (updatedCommunity: any) => void;
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
    if (!uploadResponse.ok) throw new Error("Erreur lors de l'upload de l'image");
    const uploadResult = await uploadResponse.json();
    return uploadResult[0].id;
  } catch {
    return null;
  }
}

export default function CommunityMenu({ community, isModerator, onUpdate }: CommunityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/community/${community.name}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié dans le presse-papier !');
    } catch (err) {
      toast.error('Impossible de copier le lien');
    }
    setIsOpen(false);
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setIsOpen(false);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setPosting(true);
      const token = localStorage.getItem('jwt');
      let avatarId = null;
      let bannerId = null;
      // Avatar
      if (data.avatar) {
        if (typeof data.avatar === 'string' && data.avatar.startsWith('data:')) {
          avatarId = await uploadImage(data.avatar, token!);
        } else if (typeof data.avatar === 'string' && data.avatar.startsWith('http')) {
          avatarId = community.avatar?.id || null;
        } else if (typeof data.avatar === 'number') {
          avatarId = data.avatar;
        }
      }
      // Banner
      if (data.banner) {
        if (typeof data.banner === 'string' && data.banner.startsWith('data:')) {
          bannerId = await uploadImage(data.banner, token!);
        } else if (typeof data.banner === 'string' && data.banner.startsWith('http')) {
          bannerId = community.banner?.id || null;
        } else if (typeof data.banner === 'number') {
          bannerId = data.banner;
        }
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/communities/custom-update/${community.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name: data.name,
            description: data.description,
            isPrivate: data.visibility === "private",
            avatar: avatarId,
            banner: bannerId,
            slug: data.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
            ...(data.rules && data.rules.length > 0 ? { rules: data.rules } : {})
          }
        }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la communauté');
      }
      const updatedData = await response.json();
      onUpdate(updatedData.data);
      toast.success('Communauté mise à jour avec succès !');
      setShowEditForm(false);
      setPosting(false);
      // Fermer la sidebar si elle est ouverte
      window.dispatchEvent(new Event('close-sidebar'));
      if (updatedData.data.slug && updatedData.data.slug !== community.slug) {
        router.push(`/community/${updatedData.data.slug}`);
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la communauté');
      setPosting(false);
    }
  };

  // Suppression de la communauté
  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/communities/${community.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || 'Erreur lors de la suppression de la communauté');
      toast.success(result?.message || 'Communauté supprimée avec succès !');
      // Fermer la sidebar si elle est ouverte
      window.dispatchEvent(new Event('close-sidebar'));
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de la communauté');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
      >
        <FiMoreHorizontal size={24} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={handleShare}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700"
          >
            <FiShare2 className="mr-2" />
            Partager
          </button>
          {isModerator && (
            <button
              onClick={handleEdit}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700"
            >
              <FiEdit2 className="mr-2" />
              Modifier
            </button>
          )}
          {isModerator && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" />
              Supprimer
            </button>
          )}
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="relative bg-neutral-900 p-6 rounded-lg w-[90%] max-w-xl max-h-[80vh] overflow-y-auto mt-[85px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-neutral-500">
            <h2 className="text-2xl font-bold mb-4">Modifier la communauté</h2>
            <CommunityForm
              onSubmit={handleFormSubmit}
              initialData={{
                name: community.name,
                description: community.description,
                visibility: community.isPrivate ? "private" : "public",
                avatar: community.avatar && typeof community.avatar === 'object' && community.avatar.url
                  ? (community.avatar.url.startsWith('http') ? community.avatar.url : strapiBaseUrl + community.avatar.url)
                  : null,
                banner: community.banner && typeof community.banner === 'object' && community.banner.url
                  ? (community.banner.url.startsWith('http') ? community.banner.url : strapiBaseUrl + community.banner.url)
                  : null,
                rules: (Array.isArray(community.rules)
                  ? (typeof community.rules[0] === 'string'
                      ? community.rules.map((r: string) => ({ title: r, description: '' }))
                      : community.rules)
                  : []) as { title: string; description: string }[]
              }}
            />
            <button
              onClick={() => { setShowEditForm(false); setPosting(false); }}
              className="mt-4 w-full bg-neutral-700 text-white py-2 px-4 rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Annuler
            </button>
            {posting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-neutral-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                  <p className="text-white">Modification de la communauté en cours...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <p className="text-white mb-4">Voulez-vous vraiment supprimer cette communauté ? Cette action est irréversible.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 