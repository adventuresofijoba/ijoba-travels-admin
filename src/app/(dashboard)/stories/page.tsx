"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { Story } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchStories = async (page: number, showLoading = true) => {
    if (showLoading) setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await supabase
      .from("stories")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error("Failed to load stories");
      console.error(error);
    } else {
      setStories(data || []);
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchStories(currentPage);
  }, [currentPage]);

  const handleEdit = (story: Story) => {
    router.push(`/stories/${story.id}/edit`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("id", deletingId);

    if (error) {
      toast.error("Failed to delete story");
      console.error(error);
    } else {
      toast.success("Story deleted successfully");
      fetchStories(currentPage, false);
    }
    setDeletingId(null);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] gap-5 px-5 py-5 sm:py-10 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Stories & Tips</h1>
        <Link href="/stories/create">
          <Button size={"sm"}>
            <Plus className="mr-2 h-4 w-4" /> Write Story
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start gap-5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden flex flex-col border-black/10 bg-[#F5E8C7]"
            >
              <div className="relative aspect-video w-full bg-black/5 overflow-hidden">
                <Skeleton className="h-full w-full bg-black/5" />
              </div>
              <div className="p-4 grid gap-4">
                <CardHeader className="p-0 space-y-2">
                  <Skeleton className="h-6 w-3/4 bg-black/5" />
                  <Skeleton className="h-4 w-1/2 bg-black/5" />
                </CardHeader>
                <CardContent className="flex-1 p-0 space-y-2">
                  <Skeleton className="h-4 w-full bg-black/5" />
                  <Skeleton className="h-4 w-full bg-black/5" />
                  <Skeleton className="h-4 w-2/3 bg-black/5" />
                </CardContent>
              </div>
            </Card>
          ))
        ) : stories.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No stories found. Write your first blog post!
          </div>
        ) : (
          stories.map((story) => (
            <Card
              key={story.id}
              className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow border-black/10 bg-[#F5E8C7]"
            >
              <div className="relative aspect-video w-full bg-black/5 overflow-hidden">
                <ImageWithFallback
                  src={story.cover_image}
                  alt={story.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  fallback={
                    <div className="flex items-center justify-center h-full w-full text-muted-foreground bg-black/5">
                      <BookOpen className="h-10 w-10 opacity-20" />
                    </div>
                  }
                />
                <div className="absolute bottom-2 left-2">
                  <Badge
                    variant={story.is_published ? "default" : "secondary"}
                    className={
                      story.is_published
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-500 text-white hover:bg-gray-600"
                    }
                  >
                    {story.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-white/50 cursor-pointer"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#F8EFD8] rounded-sm p-2 mt-2 space-y-1 w-28 z-50 shadow-md border border-black/10"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(story)}
                        className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm hover:bg-black/5 outline-none"
                      >
                        <Pencil className="w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingId(story.id)}
                        className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm text-red-500 hover:bg-red-500/10 outline-none"
                      >
                        <Trash2 className="w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 grid gap-4 flex-1">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl line-clamp-1 text-[#2D2D2D]">
                    {story.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 font-mono text-xs text-[#2D2D2D]/70">
                    by {story.author_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 space-y-2">
                  <p className="text-sm text-[#2D2D2D]/80 font-medium">
                    {new Date(story.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-[#2D2D2D]/80 line-clamp-3">
                    {story.content.replace(/<[^>]+>/g, "")}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 mx-auto mt-2.5 sm:mt-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="border-black/10 bg-transparent text-[#2D2D2D] hover:bg-black/5 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm font-medium text-[#2D2D2D]">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || loading}
          className="border-black/10 bg-transparent text-[#2D2D2D] hover:bg-black/5 disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
