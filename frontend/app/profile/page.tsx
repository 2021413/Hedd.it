"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiShare2, FiCalendar, FiMail, FiBell } from "react-icons/fi";

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  stats: {
    posts: number;
    comments: number;
  };
  joinDate: string;
  communities: string[];
  isCurrentUser: boolean;
  isSubscribed: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

  useEffect(() => {
    // Simuler le chargement des données utilisateur
    setTimeout(() => {
      setUser({
        id: "1",
        username: "utilisateur123",
        displayName: "Jean Dupont",
        avatar: "/placeholder-avatar.jpg",
        banner: "/placeholder-banner.jpg",
        stats: {
          posts: 5,
          comments: 12,
        },
        joinDate: "16 Oct 2023",
        communities: ["Technologie", "Programmation", "Gaming"],
        isCurrentUser: false, // Simuler que c'est un autre utilisateur
        isSubscribed: false
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubscribe = () => {
    if (user) {
      setUser({
        ...user,
        isSubscribed: !user.isSubscribed
      });
    }
  };

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

  const tabs = [
    { id: "posts", label: "Publications" },
    { id: "comments", label: "Commentaires" },
    { id: "communities", label: "Communautés" },
  ];

  return (
    <div className="max-w-[1000px] mx-auto p-4 relative">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-gray-300 hover:text-white">
          <FiArrowLeft size="1.5em" />
        </Link>
      </div>
      
      {/* Banner and Avatar */}
      <div className="relative mb-6">
        <div className="h-36 bg-neutral-900 rounded-2xl overflow-hidden">
          {user.banner && (
            <Image 
              src={user.banner} 
              alt="Bannière" 
              fill 
              className="object-cover rounded-2xl"
            />
          )}
        </div>
        
        <div className="absolute -bottom-14 left-8">
          <div className="w-28 h-28 rounded-full border-4 border-[#1E1E1E] overflow-hidden bg-neutral-800">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                alt={user.displayName} 
                width={112} 
                height={112} 
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-3xl text-gray-400">
                {user.displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="pt-16 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">u/{user.username}</h1>
            <p className="text-gray-400">{user.displayName}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {user.isCurrentUser ? (
              // Boutons pour son propre profil
              <>
                <Link href="/profile/edit" className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
                  Modifier le profil
                </Link>
                <button className="px-4 py-2 border border-green-700 text-white rounded-lg hover:bg-green-700">
                  <FiShare2 className="inline mr-2" /> Partager
                </button>
              </>
            ) : (
              // Boutons pour le profil d'un autre utilisateur
              <>
                <button 
                  onClick={handleSubscribe}
                  className={`px-4 py-2 ${user.isSubscribed ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-green-700 hover:bg-green-800'} text-white rounded-lg flex items-center`}
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
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 p-4 rounded-2xl">
          <p className="text-2xl font-bold text-white">{user.stats.posts}</p>
          <p className="text-gray-400">Publications</p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl">
          <p className="text-2xl font-bold text-white">{user.stats.comments}</p>
          <p className="text-gray-400">Commentaires</p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl">
          <p className="text-2xl font-bold text-white">{user.communities.length}</p>
          <p className="text-gray-400">Communautés</p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl">
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-gray-400">Abonnés</p>
        </div>
      </div>
      
      {/* Tabs */}
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
      
      {/* Content */}
      <div className="min-h-[300px]">
        {activeTab === "posts" && (
          <div>
            {user.stats.posts > 0 ? (
              <div className="space-y-6">
                {/* Exemple de publication */}
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Titre de la publication</h3>
                  <p className="text-gray-400 mb-3">
                    Ceci est un exemple de contenu de publication. Dans une implémentation réelle, 
                    vous afficheriez ici le contenu réel des publications de l'utilisateur.
                  </p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <span>il y a 2 jours</span>
                    <span className="mx-2">•</span>
                    <span>5 commentaires</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-24 h-24 mb-6 bg-neutral-800 rounded-full flex items-center justify-center">
                  <FiEdit size={32} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Aucune publication pour le moment
                </h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Commencez à partager vos idées et créez votre première publication dans une communauté
                </p>
                <Link href="/create-post" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
                  Créer une publication
                </Link>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "comments" && (
          <div>
            {user.stats.comments > 0 ? (
              <div className="space-y-6">
                {/* Exemple de commentaire */}
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="text-sm text-gray-400 mb-2">
                    En réponse à <span className="text-green-500">Titre de la publication</span> dans <span className="text-green-500">Technologie</span>
                  </div>
                  <p className="text-gray-300 mb-2">
                    Ceci est un exemple de commentaire. Dans une implémentation réelle, 
                    vous afficheriez ici le contenu réel des commentaires de l'utilisateur.
                  </p>
                  <div className="text-gray-500 text-sm">
                    il y a 3 jours
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <p className="text-gray-400">Aucun commentaire pour le moment</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "communities" && (
          <div>
            {user.communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.communities.map((community, index) => (
                  <div key={index} className="bg-neutral-900 rounded-2xl p-4 flex items-center">
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
              <div className="flex flex-col items-center justify-center text-center py-10">
                <p className="text-gray-400">Aucune communauté rejointe</p>
                <Link href="/" className="mt-4 text-green-500 hover:text-green-400">
                  Découvrir des communautés
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 