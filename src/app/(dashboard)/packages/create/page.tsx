"use client";

import { PackageForm } from "@/components/packages/package-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatePackagePage() {
  const router = useRouter();

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
          /<h1 className="text-lg font-semibold md:text-2xl">Create Package</h1>
        </div>
        <PackageForm onSuccess={() => router.push("/packages")} />
      </div>
    </div>
  );
}
