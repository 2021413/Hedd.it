"use client";
import React, { useState } from 'react';
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import ProfileSettings from "@/components/settings/ProfileSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PasswordSettings from "@/components/settings/PasswordSettings";

type SettingsTab = 'profile' | 'password' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profil' },
    { id: 'password' as SettingsTab, label: 'Mot de passe' },
    { id: 'notifications' as SettingsTab, label: 'Notifications' }
  ];

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
          {tabs.map(tab => (
          <button
              key={tab.id}
            className={`px-4 py-3 font-medium ${
                activeTab === tab.id 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
              onClick={() => setActiveTab(tab.id)}
          >
              {tab.label}
          </button>
          ))}
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'password' && <PasswordSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
} 
