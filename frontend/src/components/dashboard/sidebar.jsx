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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Camera, LogOut, BarChart, User, History, HelpCircle } from "lucide-react";
import { Brand } from "@/components/traffic/brand";
import { clearAuth } from "@/lib/api";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analysis", label: "Live Analyze", icon: Camera },
  { href: "/dashboard/flow-graph", label: "Flow Graph", icon: BarChart },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/how-to-use", label: "How to Use", icon: HelpCircle },
];

function NavItem({ href, label, icon: Icon, active, onClick, className }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label} className={cn("relative h-10", className)}>
        <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined}>
          {active && (
            <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-primary" />
          )}
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <Brand />
      </SidebarHeader>
      <div className="lane-divider mx-4 opacity-70" aria-hidden="true" />
      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu className="gap-1">
          <NavItem href="/dashboard/profile" label="Profile" icon={User} active={pathname === "/dashboard/profile"} />
          <NavItem
            href="/"
            label="Logout"
            icon={LogOut}
            onClick={() => clearAuth()}
            className="text-status-heavy hover:bg-status-heavy/10 hover:text-status-heavy"
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
