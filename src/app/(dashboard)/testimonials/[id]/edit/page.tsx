"use client";

import { useEffect, useState } from "react";
import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Testimonial } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTestimonial = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load testimonial");
        router.push("/testimonials");
      } else {
        setTestimonial(data);
      }
      setLoading(false);
    };

    fetchTestimonial();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!testimonial) return null;

  return (
    <div className="grid overflow-y-auto custom-scrollbar px-5 py-5 sm:py-10">
      <div className="max-w-3xl mx-auto w-full grid gap-5">
        <div className="flex items-center w-max gap-1">
          <Link
            href={"/testimonials"}
            className="text-[#2D2D2D] opacity-80 hover:opacity-100 transition-all"
          >
            Testimonials
          </Link>
          /
          <h1 className="text-lg font-semibold md:text-2xl">Edit Testimonial</h1>
        </div>
        <TestimonialForm
          id={testimonial.id}
          defaultValues={{
            name: testimonial.name,
            destination: testimonial.destination,
            trip_year: testimonial.trip_year,
            quote: testimonial.quote,
            photo_url: testimonial.photo_url || "",
            status: testimonial.status,
          }}
          onSuccess={() => router.push("/testimonials")}
        />
      </div>
    </div>
  );
}
