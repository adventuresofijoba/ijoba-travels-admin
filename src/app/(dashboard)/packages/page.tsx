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
  MapPin,
  Clock,
  DollarSign,
  Package as PackageIcon,
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
import { Package } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchPackages = async (page: number, showLoading = true) => {
    if (showLoading) setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await supabase
      .from("packages")
      .select("*", { count: "exact" })
      .order("title", { ascending: true })
      .range(from, to);

    if (error) {
      toast.error("Failed to load packages");
      console.error(error);
    } else {
      setPackages(data || []);
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchPackages(currentPage);
  }, [currentPage]);

  const handleEdit = (pkg: Package) => {
    router.push(`/packages/${pkg.id}/edit`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", deletingId);

    if (error) {
      toast.error("Failed to delete package");
      console.error(error);
    } else {
      toast.success("Package deleted successfully");
      fetchPackages(currentPage, false);
    }
    setDeletingId(null);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] gap-5 px-5 py-5 sm:py-10 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Packages</h1>
        <Link href="/packages/create">
          <Button size={"sm"}>
            <Plus className="mr-2 h-4 w-4" /> Add Package
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
        ) : packages.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No packages found. Add one to get started.
          </div>
        ) : (
          packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow border-black/10 bg-[#F5E8C7]"
            >
              <div className="relative aspect-video w-full bg-black/5 overflow-hidden">
                {pkg.image_urls && pkg.image_urls.length > 0 ? (
                  <ImageWithFallback
                    src={pkg.image_urls[0]}
                    alt={pkg.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    fallback={
                      <div className="flex items-center justify-center h-full w-full text-muted-foreground bg-black/5">
                        <PackageIcon className="h-10 w-10 opacity-20" />
                      </div>
                    }
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <PackageIcon className="h-10 w-10 opacity-20" />
                  </div>
                )}
                {pkg.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
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
                        onClick={() => handleEdit(pkg)}
                        className="cursor-pointer flex gap-2 items-center px-2 py-1 rounded-sm hover:bg-black/5 outline-none"
                      >
                        <Pencil className="w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingId(pkg.id)}
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
                    {pkg.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 font-mono text-xs text-[#2D2D2D]/70 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {pkg.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 space-y-2">
                  <div className="flex items-center justify-between text-sm text-[#2D2D2D]/80">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{pkg.duration_days} Days</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <span>₦</span>
                      <span>{pkg.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm text-[#2D2D2D]/70">
                    {pkg.description}
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
              package.
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
