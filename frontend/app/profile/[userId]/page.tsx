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
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/profile/${targetUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`Utilisateur non trouvé (${userResponse.status})`);
        }

        const userData = await userResponse.json();

        const avatarUrl = userData.avatar
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${userData.avatar.hash}${userData.avatar.ext}`
          : null;
        const bannerUrl = userData.banner
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${userData.banner.hash}${userData.banner.ext}`
          : null;

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
          joinDate: new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          communities: (userData.communities ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            banner: c.banner?.url
              ? c.banner.url.startsWith('http')
                ? c.banner.url
                : `${process.env.NEXT_PUBLIC_STRAPI_URL}${c.banner.url}`
              : null,
            avatar: c.avatar?.url
              ? c.avatar.url.startsWith('http')
                ? c.avatar.url
                : `${process.env.NEXT_PUBLIC_STRAPI_URL}${c.avatar.url}`
              : null,
            creatorId: c.creator?.id,
            moderators: c.moderators?.map((m: any) => m.id) ?? [],
            members: c.members?.map((m: any) => m.id) ?? [],
          })) || [],
          posts: userData.createdPosts?.map((p: any) => ({ id: p.id, title: p.title, content: p.content })) || [],
          comments: userData.authoredComments?.map((c: any) => ({ id: c.id, content: c.content, postId: c.post?.id, postTitle: c.post?.title })) || [],
          isCurrentUser,
          isSubscribed: false,
        };

        setUser(userProfile);
      } catch (error) {
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
      <ProfileContent user={user} loading={loading} />
    </Suspense>
  );
}
