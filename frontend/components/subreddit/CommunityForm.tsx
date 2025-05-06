import { useState } from "react";
import { FiImage, FiX, FiGlobe, FiLock } from "react-icons/fi";
import Link from "next/link";

// Get the current date
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

interface CommunityFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    avatar: string | null;
    banner: string | null;
    visibility: string;
  }) => void;
}

export default function CommunityForm({ onSubmit }: CommunityFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      
      // Simuler un délai de chargement pour le prototype
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
          setIsUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingBanner(true);
      
      // Simuler un délai de chargement pour le prototype
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBanner(reader.result as string);
          setIsUploadingBanner(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const clearAvatar = () => {
    setAvatar(null);
  };

  const clearBanner = () => {
    setBanner(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      description,
      avatar,
      banner,
      visibility
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner Image */}
      <div>
        <label className="block mb-2 font-medium">
          Bannière de la communauté
        </label>
        
        {banner ? (
          <div className="relative mt-2">
            <img
              src={banner}
              alt="Banner Preview"
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={clearBanner}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
            >
              <FiX size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 rounded-lg p-6 hover:border-green-500 transition-colors h-40">
            <input
              type="file"
              id="banner"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <label
              htmlFor="banner"
              className="cursor-pointer flex flex-col items-center text-center"
            >
              <FiImage size={40} className="mb-2 text-gray-400" />
              <span className="text-gray-300 font-medium">
                {isUploadingBanner ? "Chargement..." : "Cliquez pour ajouter une bannière"}
              </span>
              <span className="text-gray-500 text-sm mt-1">
                PNG, JPG, GIF jusqu'à 10MB
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Avatar Image */}
      <div>
        <label className="block mb-2 font-medium">
          Avatar de la communauté
        </label>
        
        {avatar ? (
          <div className="relative mt-2 inline-block">
            <img
              src={avatar}
              alt="Avatar Preview"
              className="w-20 h-20 object-cover rounded-full"
            />
            <button
              type="button"
              onClick={clearAvatar}
              className="absolute top-0 right-0 p-1 bg-black bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 rounded-full p-4 hover:border-green-500 transition-colors w-20 h-20 inline-block">
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className="cursor-pointer flex flex-col items-center text-center"
            >
              <FiImage size={24} className="text-gray-400" />
              <span className="text-gray-500 text-xs mt-1">
                Avatar
              </span>
            </label>
          </div>
        )}
      </div>
      
      {/* Community Name */}
      <div>
        <label htmlFor="name" className="block mb-2 font-medium">
          Nom de la communauté
        </label>
        <div className="flex items-center">
          <span className="bg-neutral-900 text-gray-400 px-3 py-3 rounded-l-lg">h/</span>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="nom_de_la_communaute"
            className="w-full bg-neutral-800 text-white p-3 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Les espaces ne sont pas autorisés. Utilisez des underscores.
        </p>
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block mb-2 font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez le but de cette communauté"
          className="w-full bg-neutral-800 text-white p-4 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      {/* Visibility */}
      <div>
        <label className="block mb-2 font-medium">
          Visibilité de la communauté
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`flex items-center gap-3 w-full p-4 rounded-lg text-left transition-colors ${
              visibility === "public" ? "bg-green-900" : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            <FiGlobe size={20} className={visibility === "public" ? "text-white" : "text-gray-400"} />
            <div>
              <h3 className="font-medium">Publique</h3>
              <p className="text-sm text-gray-400">Tout le monde peut voir et rejoindre cette communauté</p>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={`flex items-center gap-3 w-full p-4 rounded-lg text-left transition-colors ${
              visibility === "private" ? "bg-green-900" : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            <FiLock size={20} className={visibility === "private" ? "text-white" : "text-gray-400"} />
            <div>
              <h3 className="font-medium">Privée</h3>
              <p className="text-sm text-gray-400">Seuls les membres approuvés peuvent voir et publier</p>
            </div>
          </button>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          Annuler
        </Link>
        <button
          type="submit"
          className="px-6 py-3 rounded-full bg-green-900 hover:bg-green-800 transition-colors font-medium"
          disabled={!name || !description}
        >
          Créer la communauté
        </button>
      </div>

      {/* Preview Card */}
      <div className="mt-8 border-t border-neutral-700 pt-8">
        <h2 className="text-xl font-bold mb-4">Aperçu de la communauté</h2>
        <div className="bg-neutral-900 rounded-lg overflow-hidden max-w-sm">
          {banner ? (
            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }}></div>
          ) : (
            <div className="h-32 bg-neutral-800"></div>
          )}
          
          <div className="relative p-4">
            <div className="absolute -top-10 left-4 w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border-4 border-neutral-900 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Community Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <FiImage size={24} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">
                {name ? `h/${name}` : "h/Titre_du_sub"}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {description || "Ceci est une description"}
              </p>
              
              <div className="flex items-center text-sm mt-4">
                <div className="flex items-center mr-6">
                  <span className="text-green-500 font-bold">Créé le {formattedDate}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="mr-6">{visibility === "public" ? "Publique" : "Privée"}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 text-sm">
                <div>
                  <div className="font-bold">1k</div>
                  <div className="text-gray-400">Membres</div>
                </div>
                <div>
                  <div className="font-bold">300</div>
                  <div className="text-gray-400 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Connectés
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 