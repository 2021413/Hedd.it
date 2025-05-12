"use client";

import { Suspense, useEffect, useState, use } from 'react';
import ProfileContent from '../../../components/profile/ProfileContent';
import { useRouter } from 'next/navigation';

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

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

        // Construct URLs for avatar and banner using hash and ext
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

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    }>
      <ProfileContent userId={userId} />
    </Suspense>
  );
}
