import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNav from "@/components/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a1a0f] text-white">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-60">
        <TopBar breadcrumb="Dashboard / Overview" />
        <main className="p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Mobile nav */}
      <MobileNav />
    </div>
  );
}
