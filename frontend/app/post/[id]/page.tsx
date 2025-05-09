"use client";

import React from "react";
import { Suspense } from "react";
import PostDetail from "@/components/post/PostDetail";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

type PostParams = {
  id: string;
};

export default function PostPage({ params }: { params: any }) {
  const unwrappedParams = React.use(params) as PostParams;
  const postId = Number(unwrappedParams.id);
  
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