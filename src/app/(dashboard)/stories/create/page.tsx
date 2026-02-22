"use client";

import { StoryForm } from "@/components/stories/story-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateStoryPage() {
  const router = useRouter();

  return (
    <div className="grid overflow-y-auto custom-scrollbar px-5 py-5 sm:py-10">
      <div className="max-w-3xl mx-auto w-full grid gap-5">
        <div className="flex items-center w-max gap-1">
          <Link
            href={"/stories"}
            className="text-[#2D2D2D] opacity-80 hover:opacity-100 transition-all"
          >
            Stories
          </Link>
          /
          <h1 className="text-lg font-semibold md:text-2xl">Write New Story</h1>
        </div>
        <StoryForm onSuccess={() => router.push("/stories")} />
      </div>
    </div>
  );
}
