"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiEdit } from "react-icons/fi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import TabContent from "@/components/profile/TabContent";

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
  userId: string;
}

export default function ProfileContent({ userId }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          router.push("/?showAuth=true");
          return;
        }

        const meResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!meResponse.ok) {
          throw new Error("Erreur d'authentification");
        }

        const currentUser = await meResponse.json();
        const targetUserId = userId === "me" ? currentUser.id : userId;
        const isCurrentUser = userId === "me" || currentUser.id.toString() === userId;

        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${targetUserId}?populate[avatar][fields][0]=hash&populate[avatar][fields][1]=ext&populate[banner][fields][0]=hash&populate[banner][fields][1]=ext`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`Utilisateur non trouvé (${userResponse.status})`);
        }

        const userData = await userResponse.json();

        const avatarUrl = userData.avatar ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${userData.avatar.hash}${userData.avatar.ext}` : null;
        const bannerUrl = userData.banner ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${userData.banner.hash}${userData.banner.ext}` : null;

        const userProfile: UserProfile = {
          id: userData.id,
          username: userData.username,
          displayName: userData.username,
          avatar: avatarUrl,
          banner: bannerUrl,
          bio: userData.bio || '',
          stats: {
            posts: userData.createdPosts?.length || 0,
            comments: userData.authoredComments?.length || 0,
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
      } catch (error) {
        console.error(error);
        let errorMessage = "Une erreur est survenue";
        
        if (error instanceof Error) {
          if (error.message.includes("Erreur d'authentification")) {
            errorMessage = "Veuillez vous connecter pour accéder à cette page";
          } else if (error.message.includes("500")) {
            errorMessage = "Erreur serveur - Veuillez réessayer plus tard";
          } else if (error.message.includes("404")) {
            errorMessage = "Utilisateur non trouvé";
          }
        }
        
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [userId, router]);

  const handleSubscribe = async () => {
    if (!user) return;
    // TODO: Implémenter la logique d'abonnement
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
        <Link href="/" className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "posts", label: "Publications" },
    { id: "comments", label: "Commentaires" },
    { id: "communities", label: "Communautés" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader user={user} onSubscribe={handleSubscribe} />
      
      <div className="mt-8">
        <div className="flex space-x-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab.id
                  ? "bg-green-700 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="min-h-[300px]">
          {activeTab === "posts" && (
            <TabContent
              activeTab={activeTab}
              userId={user.id}
              hasData={user.stats.posts > 0}
              emptyMessage="Aucune publication pour le moment"
              icon={<FiEdit size={32} className="text-gray-500" />}
              actionLabel="Créer une publication"
              actionLink="/create-post"
            />
          )}
          {activeTab === "comments" && (
            <TabContent
              activeTab={activeTab}
              userId={user.id}
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
                  activeTab={activeTab}
                  userId={user.id}
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
    </div>
  );
}