import React from "react";
import DashboardLayoutComponent from "@/components/dashboard-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
