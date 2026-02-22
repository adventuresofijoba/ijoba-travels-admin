"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Map,
  Package,
  BookOpen,
  FileText,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Destinations",
    href: "/destinations",
    icon: Map,
  },
  {
    title: "Packages",
    href: "/packages",
    icon: Package,
  },
  {
    title: "Forms",
    href: "/forms",
    icon: FileText,
  },
  {
    title: "Stories & Tips",
    href: "/stories",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const pathname = usePathname();

  return (
    <div className="hidden sm:grid grid-rows-[auto_1fr_auto] h-full overflow-hidden w-64 border-r border-black/10 bg-[#F5E8C7]">
      <div className="flex items-center border-b border-black/10 px-4 h-15">
        <Link href="/" className="w-max gap-2 font-semibold">
          <img
            src="/logo-black.webp"
            alt="Ijoba Admin"
            className="aspect-216/36 w-40"
          />
        </Link>
      </div>
      <div className="overflow-y-auto py-20">
        <nav className="grid items-start gap-4 px-2 font-medium lg:px-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                (
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                )
                  ? "bg-[#F4A261] text-white"
                  : "text-[#2D2D2D] hover:bg-[#F8EFD8]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent cursor-pointer text-[#2D2D2D] hover:bg-[#F8EFD8] border-none"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
