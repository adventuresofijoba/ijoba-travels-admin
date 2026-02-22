import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid sm:grid-cols-[auto_1fr] h-screen w-full bg-[#F8EFD8] overflow-hidden">
      <AppSidebar />
      <div className="grid overflow-hidden flex-1">
        <header className="hidden h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-15 lg:px-6">
          <div className="w-full flex-1">
            {/* Header content like search or user profile can go here */}
          </div>
        </header>
        <main className="grid overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
