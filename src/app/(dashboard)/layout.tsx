import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid sm:grid-cols-[auto_1fr] h-screen w-full bg-[#F8EFD8] overflow-hidden">
      <AppSidebar className="hidden sm:grid" />
      <div className="grid grid-rows-[auto_1fr] sm:grid-rows-1 overflow-hidden">
        <Header />
        <main className="grid overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
