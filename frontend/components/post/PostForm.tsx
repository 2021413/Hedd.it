import { useState } from "react";
import { FiImage, FiX } from "react-icons/fi";
import Link from "next/link";

interface Subreddit {
  id: number;
  name: string;
  avatar: string;
}

interface PostFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    selectedImage: string | null;
    selectedSub: string;
  }) => void;
  subreddits?: Subreddit[];
}

export default function PostForm({ 
  onSubmit,
  subreddits = []
}: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      if (!title.trim()) {
        setSubmitError("Le titre est requis");
        return;
      }
      
      if (!content.trim()) {
        setSubmitError("Le contenu est requis");
        return;
      }
      
      if (!selectedSub) {
        setSubmitError("Veuillez sélectionner une communauté");
        return;
      }
      
      onSubmit({
        title,
        content,
        selectedImage,
        selectedSub
      });
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitError("Une erreur est survenue lors de la soumission du formulaire");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="subreddit" className="block mb-2 font-medium">
          Choisir une communauté
        </label>
        {subreddits.length === 0 ? (
          <div className="p-4 bg-neutral-800 rounded-lg text-gray-400 text-center">
            Aucune communauté disponible. Veuillez créer une communauté d'abord.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mb-4">
            {subreddits.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSub(String(sub.id))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  selectedSub === String(sub.id) 
                    ? "bg-green-900 text-white" 
                    : "bg-neutral-800 hover:bg-neutral-700"
                }`}
              >
                <img src={sub.avatar} alt={sub.name} className="w-5 h-5 rounded-full object-cover" />
                <span>h/{sub.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="title" className="block mb-2 font-medium">
          Titre
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Un titre accrocheur pour votre post"
          className="w-full bg-neutral-800 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block mb-2 font-medium">
          Contenu
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="De quoi voulez-vous parler ?"
          className="w-full bg-neutral-800 text-white p-4 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      
      <div>
        <label className="block mb-2 font-medium">
          Image (optionnelle)
        </label>
        
        {selectedImage ? (
          <div className="relative mt-2 flex justify-center">
            <div className="max-w-lg overflow-hidden rounded-lg">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-h-96 w-auto mx-auto object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 rounded-lg p-6 hover:border-green-500 transition-colors">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="image"
              className="cursor-pointer flex flex-col items-center text-center"
            >
              <FiImage size={40} className="mb-2 text-gray-400" />
              <span className="text-gray-300 font-medium">
                {isUploading ? "Chargement..." : "Cliquez pour ajouter une image"}
              </span>
              <span className="text-gray-500 text-sm mt-1">
                PNG, JPG, GIF jusqu'à 10MB
              </span>
            </label>
          </div>
        )}
      </div>
      
      {submitError && (
        <div className="bg-red-900 bg-opacity-50 text-white p-3 rounded-lg">
          {submitError}
        </div>
      )}
      
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
          disabled={isUploading}
        >
          Publier
        </button>
      </div>
    </form>
  );
} 