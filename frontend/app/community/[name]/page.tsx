import CommunityClient from '@/components/community/CommunityClient';

async function getData(name: string) {
  if (!name) {
    return null;
  }

  const apiUrl = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
  
  try {
    const url = `${apiUrl}/api/communities?filters[name][$eq]=${encodeURIComponent(decodeURIComponent(name))}&populate[0]=posts.media&populate[1]=avatar&populate[2]=banner&populate[3]=creator&populate[4]=members&populate[5]=moderators`;

    const response = await fetch(
      url,
      { 
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Accès non autorisé - Configuration Strapi requise');
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return null;
    }

    const community = data.data[0];
    const rawData = community.attributes || community;

    const processedData = {
      id: community.id,
      documentId: (community.documentId || community.id).toString(),
      name: rawData.name || 'Sans nom',
      description: rawData.description || '',
      isPrivate: typeof rawData.isPrivate === 'boolean' ? rawData.isPrivate : false,
      avatar: rawData.avatar,
      banner: rawData.banner,
      createdAt: rawData.createdAt || new Date().toISOString(),
      posts: rawData.posts || [],
      members: rawData.members || [],
      moderators: rawData.moderators || [],
      creator: rawData.creator || { id: 0, username: 'Inconnu' },
      rules: rawData.rules || null,
      slug: rawData.slug || null
    };

    return processedData;
  } catch (error: any) {
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

    // Ensure data integrity before passing to the client component
    const validatedData = {
      ...communityData,
      // Ensure these fields are not undefined
      posts: communityData.posts || [],
      members: communityData.members || [],
      moderators: communityData.moderators || [],
      rules: communityData.rules || null,
      slug: communityData.slug || null
    };

    return <CommunityClient community={validatedData} />;
  } catch (error: any) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Une erreur est survenue</h1>
        <p className="text-gray-400">
          {error.message.includes('Configuration Strapi requise') 
            ? 'Configuration des permissions Strapi nécessaire. Veuillez contacter l\'administrateur.'
            : error.message === 'Nom de communauté manquant'
              ? 'Veuillez spécifier un nom de communauté valide.'
              : `Impossible de charger les données: ${error.message}`}
        </p>
      </div>
    );
  }
} 