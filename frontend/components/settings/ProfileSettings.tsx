"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { User } from "lucide-react";

interface ProfileData {
  username: string;
  email: string;
  bio: string;
  avatar?: number | null;
  banner?: number | null;
}

const ProfileSettings = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [newBannerImage, setNewBannerImage] = useState<File | null>(null);
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [bannerId, setBannerId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          return;
        }

        const userRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[avatar][fields][0]=hash&populate[avatar][fields][1]=ext&populate[banner][fields][0]=hash&populate[banner][fields][1]=ext`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          throw new Error(`Erreur lors de la récupération des données: ${userRes.status}`);
        }

        const userData = await userRes.json();

        setUserId(userData.id);
        setUsername(userData.username || '');
        setEmail(userData.email || '');
        setBio(userData.bio || '');
        
        if (userData.avatar) {
          const avatarUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${userData.avatar.hash}${userData.avatar.ext}`;
          setAvatarId(userData.avatar.id);
          setProfileImage(avatarUrl);
        }

        if (userData.banner) {
          const bannerUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${userData.banner.hash}${userData.banner.ext}`;
          setBannerId(userData.banner.id);
          setBannerImage(bannerUrl);
        }

      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        alert(err instanceof Error ? err.message : "Erreur inconnue");
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      
      if (type === 'avatar') {
        setNewProfileImage(file);
        setProfileImage(tempUrl);
      } else {
        setNewBannerImage(file);
        setBannerImage(tempUrl);
      }
    }
  };

  const deleteImage = async (imageId: number) => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload/files/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'image");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const uploadImage = async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('files', file);
    
    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!uploadRes.ok) throw new Error("Échec de l'upload de l'image");
    const result = await uploadRes.json();
    
    if (!result[0] || !result[0].id) {
      throw new Error("Format de réponse inattendu de l'API d'upload");
    }

    return result[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    
    try {
      const token = localStorage.getItem("jwt");
      if (!token || !userId) {
        alert("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }

      const updateData: any = {
        username,
        email,
        bio
      };

      if (newProfileImage) {
        if (avatarId) {
          await deleteImage(avatarId);
        }
        const uploadedAvatar = await uploadImage(newProfileImage, token);
        updateData.avatar = uploadedAvatar.id;
        setProfileImage(`${process.env.NEXT_PUBLIC_STRAPI_URL}${uploadedAvatar.url}`);
        setAvatarId(uploadedAvatar.id);
      }

      if (newBannerImage) {
        if (bannerId) {
          await deleteImage(bannerId);
        }
        const uploadedBanner = await uploadImage(newBannerImage, token);
        updateData.banner = uploadedBanner.id;
        setBannerImage(`${process.env.NEXT_PUBLIC_STRAPI_URL}${uploadedBanner.url}`);
        setBannerId(uploadedBanner.id);
      }

      const userUpdateRes = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!userUpdateRes.ok) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
      }

      const updatedUser = await userUpdateRes.json();
      localStorage.setItem('user', JSON.stringify({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar ? {
          id: updatedUser.avatar.id,
          hash: updatedUser.avatar.hash,
          ext: updatedUser.avatar.ext
        } : undefined
      }));
      window.dispatchEvent(new Event('auth-change'));

      alert("Profil mis à jour avec succès !");
      setNewProfileImage(null);
      setNewBannerImage(null);

    } catch (err) {
      console.error('Error during update:', err);
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    if (!username.trim()) {
      alert("Le nom d'utilisateur ne peut pas être vide.");
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      alert("Veuillez entrer une adresse e-mail valide.");
      return false;
    }
    return true;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profil utilisateur</h2>
      <form onSubmit={handleSubmit}>
        {/* Bannière */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bannière
          </label>
          <div className="relative h-36 bg-gray-700/30 rounded-2xl overflow-hidden border border-gray-600 mb-4">
            {bannerImage && (
              <Image
                src={bannerImage}
                alt="Bannière"
                fill
                className="object-cover"
                unoptimized
              />
            )}
            {!bannerImage && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Bannière
              </div>
            )}
          </div>
          <div className="mb-8">
            <label className="px-4 py-2 bg-gray-700/30 text-white rounded-md hover:bg-gray-600/50 cursor-pointer border border-gray-600 inline-block">
              Changer la bannière
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'banner')}
              />
            </label>
          </div>
        </div>

        {/* Photo de profil */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Photo de profil
          </label>
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden mr-4 border border-zinc-700">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={40} className="text-zinc-400" />
                </div>
              )}
            </div>
            <label className="px-4 py-2 bg-gray-700/30 text-white rounded-md hover:bg-gray-600/50 cursor-pointer border border-gray-600">
              Changer la photo
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'avatar')}
              />
            </label>
          </div>
        </div>

        {/* Nom d'utilisateur */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-700/30 text-white"
            placeholder="Votre nom d'utilisateur"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Adresse e-mail
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-700/30 text-white"
            placeholder="votre@email.com"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
            Biographie
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-700/30 text-white"
            placeholder="Parlez-nous de vous (facultatif)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600/80 hover:bg-green-700/90'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
        >
          {loading ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings; 