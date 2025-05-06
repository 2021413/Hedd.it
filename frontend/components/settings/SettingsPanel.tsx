import React, { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import AppearanceSettings from './AppearanceSettings';
import NotificationSettings from './NotificationSettings';

type SettingsTab = 'profile' | 'appearance' | 'notifications';

const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="bg-[#2A2A2A] rounded-lg shadow-md">
      <div className="flex border-b border-gray-700">
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
            activeTab === 'appearance'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('appearance')}
        >
          Apparence
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
      </div>
      
      <div className="p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
      </div>
    </div>
  );
};

export default SettingsPanel; 