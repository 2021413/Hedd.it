"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiShare2,
  FiCalendar,
  FiMail,
  FiBell,
  FiEdit,
} from "react-icons/fi";

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  banner: string | null;
  bio: string;
  stats: {
    posts: number;
    comments: number;
  };
  joinDate: string;
  communities: string[];
  isCurrentUser: boolean;
  isSubscribed: boolean;
}

interface Props {
  params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: Props) {
  const { userId } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          router.push("/?showAuth=true");
          return;
        }

        const meResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!meResponse.ok) {
          localStorage.removeItem("jwt");
          router.push("/?showAuth=true");
          return;
        }

        const currentUser = await meResponse.json();
        const isCurrentUser = userId === "me" || currentUser.id.toString() === userId;

        const userData = isCurrentUser ? currentUser : null;

        if (!userData) {
          setLoading(false);
          return;
        }

        const avatarUrl = userData.avatar?.url
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${userData.avatar.url}`
          : '/placeholder-avatar.jpg';

        const bannerUrl = userData.banner?.url
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${userData.banner.url}`
          : '/placeholder-banner.jpg';

        const userProfile: UserProfile = {
          id: userData.id,
          username: userData.username,
          displayName: userData.displayName || userData.username,
          avatar: avatarUrl,
          banner: bannerUrl,
          bio: userData.bio || '',
          stats: {
            posts: userData.posts?.length || 0,
            comments: userData.comments?.length || 0,
          },
          joinDate: new Date(userData.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          communities: userData.communities?.map((c: any) => c.name) || [],
          isCurrentUser,
          isSubscribed: false,
        };

        setUser(userProfile);
        setLoading(false);
      } catch (error) {
        console.error("Erreur de chargement de l'utilisateur :", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router]);

  const handleSubscribe = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        router.push("/?showAuth=true");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/user-subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              subscriber: user.id,
              subscribed_to: userId,
            },
          }),
        }
      );

      if (response.ok) {
        setUser({ ...user, isSubscribed: !user.isSubscribed });
      } else {
        localStorage.removeItem("jwt");
        router.push("/?showAuth=true");
      }
    } catch (error) {
      console.error("Erreur lors de l'abonnement :", error);
    }
  };

  const tabs = [
    { id: "posts", label: "Publications" },
    { id: "comments", label: "Commentaires" },
    { id: "communities", label: "Communautés" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 relative">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-gray-300 hover:text-white">
          <FiArrowLeft size="1.5em" />
        </Link>
      </div>

      <div className="relative mb-6">
        <div className="h-36 bg-neutral-900 rounded-2xl overflow-hidden">
          {user.banner && (
            <Image
              src={user.banner}
              alt="Bannière"
              fill
              sizes="100vw"
              priority
              className="object-cover rounded-2xl"
            />
          )}
        </div>

        <div className="absolute -bottom-14 left-8">
          <div className="w-28 h-28 rounded-full border-4 border-[#1E1E1E] overflow-hidden bg-neutral-800">
            {user.avatar && (
              <Image
                src={user.avatar}
                alt={`Avatar de ${user.displayName}`}
                width={112}
                height={112}
                priority
                className="object-cover"
              />
            )}
            {!user.avatar && (
              <div className="flex items-center justify-center h-full text-3xl text-gray-400">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {user.username ? `u/${user.username}` : 'Utilisateur'}
            </h1>
            <p className="text-gray-400">{user.displayName || user.username}</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {user.isCurrentUser ? (
              <>
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                >
                  Modifier le profil
                </Link>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700">
                  <FiShare2 className="inline mr-2" /> Partager
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2 ${
                    user.isSubscribed
                      ? "bg-neutral-800 hover:bg-neutral-700"
                      : "bg-green-700 hover:bg-green-800"
                  } text-white rounded-lg flex items-center`}
                >
                  <FiBell className="inline mr-2" />
                  {user.isSubscribed ? "Abonné" : "S'abonner"}
                </button>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <FiMail className="inline mr-2" /> Message
                </button>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700">
                  <FiShare2 className="inline mr-2" /> Partager
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-400 mt-4">
          <FiCalendar className="mr-2" />
          <span>Membre depuis: {user.joinDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Publications" value={user.stats.posts} />
        <StatCard label="Commentaires" value={user.stats.comments} />
        <StatCard label="Communautés" value={user.communities.length} />
        <StatCard label="Abonnés" value={0} />
      </div>

      <div className="border-b border-neutral-800 mb-6">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">
        {activeTab === "posts" && (
          <TabContent
            hasData={user.stats.posts > 0}
            emptyMessage="Aucune publication pour le moment"
            icon={<FiEdit size={32} className="text-gray-500" />}
            actionLabel="Créer une publication"
            actionLink="/create-post"
          />
        )}
        {activeTab === "comments" && (
          <TabContent
            hasData={user.stats.comments > 0}
            emptyMessage="Aucun commentaire pour le moment"
          />
        )}
        {activeTab === "communities" && (
          <div>
            {user.communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.communities.map((community, index) => (
                  <div
                    key={index}
                    className="bg-neutral-900 rounded-2xl p-4 flex items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-700 mr-4 flex items-center justify-center text-white font-bold">
                      {community.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{community}</h3>
                      <p className="text-gray-400 text-sm">Membre</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TabContent
                hasData={false}
                emptyMessage="Aucune communauté rejointe"
                actionLabel="Découvrir des communautés"
                actionLink="/"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-neutral-900 p-4 rounded-2xl">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}

function TabContent({
  hasData,
  emptyMessage,
  icon,
  actionLabel,
  actionLink,
}: {
  hasData: boolean;
  emptyMessage: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionLink?: string;
}) {
  if (hasData) {
    return <div className="text-white">Contenu simulé (à implémenter)</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      {icon && <div className="w-24 h-24 mb-6 bg-neutral-800 rounded-full flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-white mb-2">{emptyMessage}</h3>
      {actionLabel && actionLink && (
        <Link
          href={actionLink}
          className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
