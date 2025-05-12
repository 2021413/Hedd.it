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
  communities: {
    id: string;
    name: string;
    banner?: string | null;
    avatar?: string | null;
    creatorId?: number;
    moderators?: number[];
    members?: number[];
  }[];
  posts: { id: string; title: string; content: string }[];
  comments: { id: string; content: string; postId: string; postTitle?: string }[];
  isCurrentUser: boolean;
  isSubscribed: boolean;
}

interface Props {
  user: UserProfile | null;
  loading: boolean;
}

export default function ProfileContent({ user, loading }: Props) {
  const [activeTab, setActiveTab] = useState("posts");

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
            <div className="max-w-[600px] w-full mx-auto">
              {(user.posts?.length ?? 0) === 0 ? (
                <p className="text-gray-400">Aucune publication pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {(user.posts ?? []).map((post) => (
                    <Link href={`/post/${post.id}`} key={post.id} className="block bg-neutral-900 rounded-2xl p-4 hover:bg-neutral-800 transition">
                      <h3 className="text-white font-semibold">{post.title}</h3>
                      <p className="text-gray-300 mt-2">{post.content}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "comments" && (
            <div className="max-w-[600px] w-full mx-auto">
              {(user.comments?.length ?? 0) === 0 ? (
                <p className="text-gray-400">Aucun commentaire pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {(user.comments ?? []).map((comment) => (
                    <Link href={`/post/${comment.postId}`} key={comment.id} className="block bg-neutral-900 rounded-2xl p-4 hover:bg-neutral-800 transition">
                      <p className="text-gray-300">{comment.content}</p>
                      {comment.postTitle && (
                        <p className="text-gray-500 text-sm mt-2">Sur le post : {comment.postTitle}</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "communities" && (
            <div>
              {(user.communities?.length ?? 0) === 0 ? (
                <p className="text-gray-400">Aucune communauté rejointe</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.communities.map((community) => {
                    // Génération de l'avatar placeholder si pas de bannière ni d'avatar
                    const communityAvatar =
                      !community.banner && !community.avatar && community.name
                        ? `https://placehold.co/100x100/191919/39FF14?text=${community.name.charAt(0).toUpperCase()}`
                        : community.avatar || undefined;
                    return (
                      <Link
                        href={`/community/${community.name}`}
                        key={community.id}
                        className="flex items-center bg-neutral-900 rounded-2xl p-4 hover:bg-neutral-800 transition"
                      >
                        {community.banner ? (
                          <img
                            src={community.banner}
                            alt={`Bannière de ${community.name}`}
                            className="w-16 h-12 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <img
                            src={communityAvatar}
                            alt={`Avatar de ${community.name}`}
                            className="w-12 h-12 object-cover rounded-full mr-4"
                          />
                        )}
                        <div>
                          <h3 className="text-white font-medium">{community.name}</h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}