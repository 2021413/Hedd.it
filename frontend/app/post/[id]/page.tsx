"use client";

import React from "react";
import { Suspense } from "react";
import PostDetail from "@/components/post/PostDetail";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

type PostParams = {
  id: string;
};

interface PostAuthor {
  id: number;
  username: string;
  avatar?: {
    url: string;
  };
  banner?: {
    url: string;
  };
}

interface Post {
  id: number;
  attributes: {
    title: string;
    content: string;
    author: {
      data: {
        id: number;
        attributes: PostAuthor;
      };
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export default function PostPage({ params }: { params: any }) {
  const unwrappedParams = React.use(params) as PostParams;
  const postId = Number(unwrappedParams.id);
  const router = useRouter();

  // Redirection si l'ID n'est pas valide
  if (isNaN(postId) || postId <= 0) {
    router.push('/');
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <Link href="/" className="text-gray-300 hover:text-white">
          <FiArrowLeft size="1.5em" />
        </Link>
      </div>
      
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      }>
        <PostDetail postId={postId} />
      </Suspense>
    </div>
  );
} 