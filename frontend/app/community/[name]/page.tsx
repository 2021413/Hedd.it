"use client";

import CommunityClient from '@/components/community/CommunityClient';
import { useEffect, useState, use as usePromise } from 'react';

interface PageProps {
  params: Promise<{ name: string }>;
}

function CommunityCSRFetcher({ name }: { name: string }) {
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setError('Nom de communauté manquant');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
        const decodedName = decodeURIComponent(name);
        const url = `${apiUrl}/api/communities/by-name/${encodeURIComponent(decodedName)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          if (response.status === 404) {
            setCommunity(null);
            setLoading(false);
            return;
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const { data } = await response.json();
        if (!data) {
          setCommunity(null);
        } else {
          setCommunity({
            id: data.id,
            documentId: data.id.toString(),
            name: data.name || 'Sans nom',
            description: data.description || '',
            isPrivate: data.isPrivate || false,
            avatar: data.avatar,
            banner: data.banner,
            createdAt: data.createdAt,
            posts: data.posts || [],
            members: data.members || [],
            moderators: data.moderators || [],
            creator: data.creator || { id: 0, username: 'Utilisateur supprimé' },
            rules: data.rules || null,
            slug: data.slug || null
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [name]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Une erreur est survenue</h1>
        <p className="text-gray-400">
          {error === 'Nom de communauté manquant'
            ? 'Veuillez spécifier un nom de communauté valide.'
            : `Impossible de charger les données: ${error}`}
        </p>
      </div>
    );
  }
  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Communauté introuvable</h1>
        <p className="text-gray-400">La communauté que vous recherchez n'existe pas.</p>
      </div>
    );
  }
  return <CommunityClient community={community} />;
}

export default function CommunityPage({ params }: PageProps) {
  const { name } = usePromise(params);
  return <CommunityCSRFetcher name={name} />;
} 