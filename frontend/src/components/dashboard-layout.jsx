"use client";

import dynamic from "next/dynamic";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/header";

const DashboardSidebar = dynamic(
  () => import("@/components/dashboard/sidebar"),
  { ssr: false },
);

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="min-w-0 overflow-x-clip">
        <DashboardHeader />
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
