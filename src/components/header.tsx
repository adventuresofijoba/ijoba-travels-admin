"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="grid grid-flow-col justify-between sticky sm:hidden h-14 items-center gap-4 border-b border-black/10 bg-[#F5E8C7] px-5">
      <Link href="/" className="w-max gap-2 font-semibold">
        <img
          src="/logo-black.webp"
          alt="Ijoba Admin"
          className="aspect-216/36 w-40"
        />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="p-0 border-r border-black/10 w-64"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <AppSidebar
            className="border-none w-full"
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}
