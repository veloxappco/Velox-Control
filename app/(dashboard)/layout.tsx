import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getMe } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let me;
  try {
    me = await getMe();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar business={me.business} user={me.user} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-24 pt-5 md:px-6 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
