"use client";
import React, { useState } from 'react';
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

type SettingsTab = 'profile' | 'password' | 'notifications' | 'communities' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // États pour le profil utilisateur
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // États pour le mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // États pour les notifications
  const [realTimeNotifications, setRealTimeNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [voteNotifications, setVoteNotifications] = useState(true);
  const [replyNotifications, setReplyNotifications] = useState(true);
  
  // Simuler des communautés suivies
  const [followedCommunities, setFollowedCommunities] = useState([
    { id: '1', name: 'Programmation', isFollowed: true },
    { id: '2', name: 'Design', isFollowed: true },
    { id: '3', name: 'Gaming', isFollowed: true },
  ]);
  
  const handleUnfollow = (communityId: string) => {
    setFollowedCommunities(followedCommunities.map(community => 
      community.id === communityId 
        ? { ...community, isFollowed: false } 
        : community
    ));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ username, bio, email, profileImage });
    alert('Profil mis à jour avec succès !');
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    console.log({ currentPassword, newPassword });
    alert('Mot de passe mis à jour avec succès !');
  };
  
  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ 
      realTimeNotifications, 
      commentNotifications, 
      voteNotifications, 
      replyNotifications 
    });
    alert('Paramètres de notification mis à jour avec succès !');
  };
  
  const handleLogoutAllSessions = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter de toutes les sessions ?')) {
      // Logique pour déconnecter toutes les sessions
      console.log('Déconnexion de toutes les sessions');
      alert('Vous avez été déconnecté de toutes les sessions');
    }
  };
  
  const handleDeleteAccount = () => {
    if (confirm('ATTENTION : Cette action est irréversible. Êtes-vous sûr de vouloir supprimer votre compte ?')) {
      if (confirm('Toutes vos données seront perdues. Confirmez-vous la suppression de votre compte ?')) {
        // Logique pour supprimer le compte
        console.log('Suppression du compte');
        alert('Votre compte a été supprimé');
      }
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-gray-300 hover:text-white mr-4">
          <FiArrowLeft size="1.5em" />
        </Link>
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === 'profile' 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profil
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === 'password' 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Mot de passe
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === 'notifications' 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === 'communities' 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('communities')}
          >
            Communautés
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === 'security' 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Sécurité
          </button>
        </div>
        
        {/* Contenu principal - sans fond */}
        <div className="p-6">
          {/* Profil utilisateur */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Profil utilisateur</h2>
              <form onSubmit={handleProfileSubmit}>
                {/* Photo de profil */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photo de profil
                  </label>
                  <div className="flex items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-700/30 overflow-hidden mr-4 border border-gray-600">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Photo
                        </div>
                      )}
                    </div>
                    <label className="px-4 py-2 bg-gray-700/30 text-white rounded-md hover:bg-gray-600/50 cursor-pointer border border-gray-600">
                      Changer la photo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
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
                  className="px-4 py-2 bg-green-600/80 text-white rounded-md hover:bg-green-700/90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Sauvegarder
                </button>
              </form>
            </div>
          )}
          
          {/* Mot de passe */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Modifier le mot de passe</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-700/30 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-700/30 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-700/30 text-white"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600/80 text-white rounded-md hover:bg-green-700/90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Mettre à jour le mot de passe
                </button>
              </form>
            </div>
          )}
          
          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Paramètres de notification</h2>
              <form onSubmit={handleNotificationsSubmit} className="bg-gray-700/30 border border-gray-600 rounded-md p-4">
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-green-500 border-gray-600"
                      checked={realTimeNotifications}
                      onChange={(e) => setRealTimeNotifications(e.target.checked)}
                    />
                    <span className="ml-2 text-gray-300">Notifications en temps réel</span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-green-500 border-gray-600"
                      checked={commentNotifications}
                      onChange={(e) => setCommentNotifications(e.target.checked)}
                    />
                    <span className="ml-2 text-gray-300">Notifications de commentaires</span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-green-500 border-gray-600"
                      checked={voteNotifications}
                      onChange={(e) => setVoteNotifications(e.target.checked)}
                    />
                    <span className="ml-2 text-gray-300">Notifications de votes</span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-green-500 border-gray-600"
                      checked={replyNotifications}
                      onChange={(e) => setReplyNotifications(e.target.checked)}
                    />
                    <span className="ml-2 text-gray-300">Notifications de réponses</span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600/80 text-white rounded-md hover:bg-green-700/90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Sauvegarder
                </button>
              </form>
            </div>
          )}
          
          {/* Communautés */}
          {activeTab === 'communities' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Communautés suivies</h2>
              <div className="space-y-4">
                {followedCommunities.filter(c => c.isFollowed).map(community => (
                  <div key={community.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-md bg-gray-700/30">
                    <span>{community.name}</span>
                    <button
                      onClick={() => handleUnfollow(community.id)}
                      className="px-3 py-1 bg-red-600/70 text-white text-sm rounded hover:bg-red-700/90"
                    >
                      Se désabonner
                    </button>
                  </div>
                ))}
                {followedCommunities.filter(c => c.isFollowed).length === 0 && (
                  <p className="text-gray-400">Vous ne suivez aucune communauté.</p>
                )}
              </div>
            </div>
          )}
          
          {/* Sécurité */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sécurité</h2>
              <div className="space-y-6">
                <div className="bg-gray-700/30 border border-gray-600 rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Sessions</h3>
                  <p className="text-gray-400 mb-3">
                    Déconnectez-vous de toutes les sessions actives sur tous vos appareils.
                  </p>
                  <button
                    onClick={handleLogoutAllSessions}
                    className="px-4 py-2 bg-yellow-600/70 text-white rounded-md hover:bg-yellow-700/90 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Déconnexion de toutes les sessions
                  </button>
                </div>
                
                <div className="bg-gray-700/30 border border-gray-600 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-500 mb-2">Zone dangereuse</h3>
                  <p className="text-gray-400 mb-3">
                    Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière. Soyez certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600/70 text-white rounded-md hover:bg-red-700/90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 