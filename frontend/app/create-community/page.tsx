"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import CommunityForm from "@/components/subreddit/CommunityForm";

export default function CreateCommunityPage() {
  const router = useRouter();
  
  const handleSubmit = (data: {
    name: string;
    description: string;
    avatar: string | null;
    banner: string | null;
    visibility: string;
  }) => {
    // Here you would implement the logic to send the community data to the backend
    console.log(data);
    
    // Redirect to the home page or the new community page
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
        <h1 className="text-3xl font-bold mb-2">Créer une communauté</h1>
        <p className="text-gray-400">Créez un espace pour partager vos passions et intérêts</p>
      </div>
      
      <CommunityForm onSubmit={handleSubmit} />
    </div>
  );
} 