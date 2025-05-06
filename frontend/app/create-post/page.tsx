"use client";

import { useRouter } from "next/navigation";
import PostForm from "@/components/post/PostForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function CreatePostPage() {
  const router = useRouter();
  
  const handleSubmit = (data: {
    title: string;
    content: string;
    selectedImage: string | null;
    selectedSub: string;
  }) => {
    // Ici, vous implémenteriez la logique pour envoyer le post au backend
    console.log(data);
    
    // Rediriger vers la page d'accueil
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-gray-300 hover:text-white">
          <FiArrowLeft size="1.5em" />
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer un post</h1>
        <p className="text-gray-400">Partagez quelque chose d'intéressant avec la communauté</p>
      </div>
      
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
} 