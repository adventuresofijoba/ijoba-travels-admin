"use client";

import { PackageForm } from "@/components/packages/package-form";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackage() {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load package");
        console.error(error);
        router.push("/packages");
      } else {
        setPkg(data);
      }
      setLoading(false);
    }
    fetchPackage();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="grid overflow-y-auto custom-scrollbar px-5 py-5 sm:py-10">
      <div className="max-w-3xl mx-auto w-full grid gap-5">
        <div className="flex items-center w-max gap-1">
          <Link
            href={"/packages"}
            className="text-[#2D2D2D] opacity-80 hover:opacity-100 transition-all"
          >
            Packages
          </Link>
          /
          <h1 className="text-lg font-semibold md:text-2xl">
            Edit Package
          </h1>
        </div>
        <PackageForm
          id={pkg.id}
          defaultValues={pkg as any}
          onSuccess={() => router.push("/packages")}
        />
      </div>
    </div>
  );
}
