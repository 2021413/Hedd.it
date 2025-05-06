import React, { useState } from 'react';

const AppearanceSettings: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique pour sauvegarder les paramètres d'apparence
    console.log({ theme, fontSize });
    alert('Paramètres d\'apparence mis à jour avec succès !');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Paramètres d'apparence</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Thème
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-green-500"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
              />
              <span className="ml-2">Clair</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-green-500"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <span className="ml-2">Sombre</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-green-500"
                name="theme"
                value="system"
                checked={theme === 'system'}
                onChange={() => setTheme('system')}
              />
              <span className="ml-2">Système</span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Taille de police
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-green-500"
                name="fontSize"
                value="small"
                checked={fontSize === 'small'}
                onChange={() => setFontSize('small')}
              />
              <span className="ml-2">Petite</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-green-500"
                name="fontSize"
                value="medium"
                checked={fontSize === 'medium'}
                onChange={() => setFontSize('medium')}
              />
              <span className="ml-2">Moyenne</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-green-500"
                name="fontSize"
                value="large"
                checked={fontSize === 'large'}
                onChange={() => setFontSize('large')}
              />
              <span className="ml-2">Grande</span>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default AppearanceSettings; 