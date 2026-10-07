"use client";

import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateTestimonialPage() {
  const router = useRouter();

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
          <h1 className="text-lg font-semibold md:text-2xl">Add Testimonial</h1>
        </div>
        <TestimonialForm onSuccess={() => router.push("/testimonials")} />
      </div>
    </div>
  );
}
