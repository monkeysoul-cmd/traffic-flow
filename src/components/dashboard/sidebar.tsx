"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  MessageSquare,
  Sliders,
  User,
  LogOut,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analysis", label: "Upload PDF", icon: Upload },
  { href: "/dashboard/flow-graph", label: "Adaptive Quiz", icon: BookOpen },
  { href: "/dashboard/history", label: "Interactive QA", icon: MessageSquare },
  { href: "/dashboard/how-to-use", label: "Setup & Guide", icon: Sliders },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="p-4 pb-12">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            PDF Scholar RAG
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu className="gap-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Profile"
              isActive={pathname === "/dashboard/profile"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                pathname === "/dashboard/profile"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Link href="/dashboard/profile">
                <User className="h-5 w-5" />
                <span>Developer Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              variant="destructive"
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
            >
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
