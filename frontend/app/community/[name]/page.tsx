import CommunityClient from '@/components/community/CommunityClient';

async function getData(name: string) {
  if (!name) return null;

  const apiUrl = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
  const decodedName = decodeURIComponent(name);
  
  try {
    const url = `${apiUrl}/api/communities/by-name/${encodeURIComponent(decodedName)}`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const { data } = await response.json();
    if (!data) return null;

    return {
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
    };
  } catch (error) {
    throw error;
  }
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function CommunityPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams.name) {
      throw new Error('Nom de communauté manquant');
    }

    const communityData = await getData(resolvedParams.name);
    
    if (!communityData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">Communauté introuvable</h1>
          <p className="text-gray-400">La communauté que vous recherchez n'existe pas.</p>
        </div>
      );
    }

    return <CommunityClient community={communityData} />;
  } catch (error: any) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Une erreur est survenue</h1>
        <p className="text-gray-400">
          {error.message === 'Nom de communauté manquant'
            ? 'Veuillez spécifier un nom de communauté valide.'
            : `Impossible de charger les données: ${error.message}`}
        </p>
      </div>
    );
  }
} 