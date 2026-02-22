"use client";

import { useEffect, useState } from "react";
import { DestinationForm } from "@/components/destinations/destination-form";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Destination } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditDestinationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDestination = async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load destination");
        router.push("/destinations");
      } else {
        setDestination(data);
      }
      setLoading(false);
    };

    fetchDestination();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!destination) return null;

  return (
    <div className="grid overflow-y-auto custom-scrollbar px-5 py-5 sm:py-10">
      <div className="max-w-3xl mx-auto w-full grid gap-5">
        <div className="flex items-center w-max gap-1">
          <Link
            href={"/destinations"}
            className="text-[#2D2D2D] opacity-80 hover:opacity-100 transition-all"
          >
            Destinations
          </Link>
          /
          <h1 className="text-lg font-semibold md:text-2xl">
            Edit Destination
          </h1>
        </div>
        <DestinationForm
          destinationId={destination.id}
          defaultValues={destination}
          onSuccess={() => router.push("/destinations")}
        />{" "}
      </div>
    </div>
  );
}
