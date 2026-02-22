"use client";

import { useEffect, useState } from "react";
import { StoryForm } from "@/components/stories/story-form";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Story } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchStory = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load story");
        router.push("/stories");
      } else {
        setStory(data);
      }
      setLoading(false);
    };

    fetchStory();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!story) return null;

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
        <StoryForm
          id={story.id}
          defaultValues={{
            title: story.title,
            slug: story.slug,
            author_name: story.author_name,
            content: story.content,
            cover_image: story.cover_image || undefined,
            is_published: story.is_published,
          }}
          onSuccess={() => router.push("/stories")}
        />{" "}
      </div>
    </div>
  );
}
