"use client";

import { DestinationForm } from "@/components/destinations/destination-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateDestinationPage() {
  const router = useRouter();

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
            Create Destination
          </h1>
        </div>
        <DestinationForm onSuccess={() => router.push("/destinations")} />
      </div>
    </div>
  );
}
