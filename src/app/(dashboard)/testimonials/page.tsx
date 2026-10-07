"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  MessageSquareQuote,
  Check,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Inbox,
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
import { Testimonial } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { cn } from "@/lib/utils";

type Filter = "all" | Testimonial["status"];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "hidden", label: "Hidden" },
];

const STATUS_RANK: Record<Testimonial["status"], number> = {
  pending: 0,
  approved: 1,
  hidden: 2,
};

const STATUS_BADGE: Record<Testimonial["status"], string> = {
  pending: "bg-[#F4A261] text-white hover:bg-[#F4A261]/90",
  approved: "bg-green-600 hover:bg-green-700",
  hidden: "bg-gray-500 text-white hover:bg-gray-600",
};

export default function TestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchTestimonials = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load testimonials");
      console.error(error);
    } else {
      setTestimonials(data || []);
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const approved = testimonials.filter((t) => t.status === "approved");
  const pendingCount = testimonials.filter((t) => t.status === "pending").length;

  // "All" shows pending first so new submissions are easy to spot.
  const visible =
    filter === "all"
      ? [...testimonials].sort(
          (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
        )
      : testimonials.filter((t) => t.status === filter);

  const countFor = (value: Filter) =>
    value === "all"
      ? testimonials.length
      : testimonials.filter((t) => t.status === value).length;

  const handleStatusChange = async (
    testimonial: Testimonial,
    status: Testimonial["status"],
  ) => {
    const update: Partial<Testimonial> = { status };
    // Newly approved testimonials go to the end of the public list.
    if (status === "approved" && testimonial.status !== "approved") {
      update.display_order =
        Math.max(-1, ...approved.map((t) => t.display_order)) + 1;
    }

    const { error } = await supabase
      .from("testimonials")
      .update(update)
      .eq("id", testimonial.id);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success(
        status === "approved"
          ? "Testimonial approved"
          : status === "hidden"
            ? "Testimonial hidden"
            : "Testimonial moved to pending",
      );
      fetchTestimonials(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= approved.length) return;

    const reordered = [...approved];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setBusy(true);
    const updates = reordered
      .map((t, i) => ({ id: t.id, display_order: i, changed: t.display_order !== i }))
      .filter((u) => u.changed);

    const results = await Promise.all(
      updates.map((u) =>
        supabase
          .from("testimonials")
          .update({ display_order: u.display_order })
          .eq("id", u.id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) {
      toast.error("Failed to reorder testimonials");
      console.error(failed.error);
    }
    await fetchTestimonials(false);
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", deletingId);

    if (error) {
      toast.error("Failed to delete testimonial");
      console.error(error);
    } else {
      toast.success("Testimonial deleted successfully");
      fetchTestimonials(false);
    }
    setDeletingId(null);
  };

  return (
    <div className="grid grid-rows-[auto_auto_auto_1fr] gap-5 px-5 py-5 sm:py-10 overflow-y-auto custom-scrollbar content-start">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Testimonials</h1>
        <Link href="/testimonials/create">
          <Button size={"sm"}>
            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
          </Button>
        </Link>
      </div>

      {!loading && pendingCount > 0 && filter !== "pending" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#F4A261] bg-[#F4A261]/10 p-4">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-[#F4A261] shrink-0" />
            <span className="text-sm font-medium">
              {pendingCount} new submission{pendingCount === 1 ? "" : "s"}{" "}
              waiting for review
            </span>
          </div>
          <Button size="sm" onClick={() => setFilter("pending")}>
            Review now
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer border",
              filter === f.value
                ? "bg-[#F4A261] text-white border-[#F4A261]"
                : "border-black/10 text-[#2D2D2D] hover:bg-black/5",
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-2 text-xs",
                filter === f.value
                  ? "bg-white/25"
                  : f.value === "pending" && pendingCount > 0
                    ? "bg-[#F4A261] text-white"
                    : "bg-black/5",
              )}
            >
              {countFor(f.value)}
            </span>
          </button>
        ))}
        {filter === "approved" && approved.length > 1 && (
          <span className="text-xs text-muted-foreground sm:ml-2">
            Use the arrows to set the order shown on the website.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 content-start gap-5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden flex flex-col border-black/10 bg-[#F5E8C7]"
            >
              <div className="relative aspect-[4/3] w-full bg-black/5 overflow-hidden">
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
        ) : visible.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            {filter === "all"
              ? "No testimonials yet. Add your first one!"
              : `No ${filter} testimonials.`}
          </div>
        ) : (
          visible.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={cn(
                "overflow-hidden flex flex-col group hover:shadow-lg transition-shadow border-black/10 bg-[#F5E8C7]",
                testimonial.status === "pending" &&
                  "border-[#F4A261] border-2",
              )}
            >
              <div className="relative aspect-[4/3] w-full bg-black/5 overflow-hidden">
                <ImageWithFallback
                  src={testimonial.photo_url || ""}
                  alt={testimonial.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  fallback={
                    <div className="flex items-center justify-center h-full w-full text-muted-foreground bg-black/5">
                      <MessageSquareQuote className="h-10 w-10 opacity-20" />
                    </div>
                  }
                />
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Badge className={STATUS_BADGE[testimonial.status]}>
                    {testimonial.status.charAt(0).toUpperCase() +
                      testimonial.status.slice(1)}
                  </Badge>
                  {testimonial.source === "form" && (
                    <Badge className="bg-white/80 text-[#2D2D2D] hover:bg-white/80">
                      Website form
                    </Badge>
                  )}
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
                      className="bg-[#F8EFD8] rounded-sm p-2 mt-2 space-y-1 w-32 z-50 shadow-md border border-black/10"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/testimonials/${testimonial.id}/edit`)
                        }
                        className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm hover:bg-black/5 outline-none"
                      >
                        <Pencil className="w-4" />
                        Edit
                      </DropdownMenuItem>
                      {testimonial.status !== "approved" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(testimonial, "approved")
                          }
                          className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm hover:bg-black/5 outline-none"
                        >
                          <Check className="w-4" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {testimonial.status !== "hidden" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(testimonial, "hidden")
                          }
                          className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm hover:bg-black/5 outline-none"
                        >
                          <EyeOff className="w-4" />
                          Hide
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeletingId(testimonial.id)}
                        className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm text-red-500 hover:bg-red-500/10 outline-none"
                      >
                        <Trash2 className="w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 grid gap-4 flex-1 content-between">
                <div className="grid gap-2">
                  <CardHeader className="p-0 space-y-1">
                    <CardTitle className="line-clamp-1 text-lg">
                      {testimonial.name}
                    </CardTitle>
                    <p className="text-sm text-[#2D2D2D]/70">
                      {testimonial.destination} · {testimonial.trip_year}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-[#2D2D2D]/80 line-clamp-4 whitespace-pre-line">
                      {testimonial.quote}
                    </p>
                  </CardContent>
                </div>

                {testimonial.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusChange(testimonial, "approved")}
                    >
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-black/10 bg-transparent hover:bg-black/5"
                      onClick={() => handleStatusChange(testimonial, "hidden")}
                    >
                      <EyeOff className="mr-1 h-4 w-4" /> Hide
                    </Button>
                  </div>
                )}

                {filter === "approved" && approved.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2D2D2D]/70">
                      No. {index + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-black/10 bg-transparent hover:bg-black/5"
                        disabled={busy || index === 0}
                        onClick={() => handleMove(index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                        <span className="sr-only">Move up</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-black/10 bg-transparent hover:bg-black/5"
                        disabled={busy || index === approved.length - 1}
                        onClick={() => handleMove(index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                        <span className="sr-only">Move down</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
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
              testimonial.
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
