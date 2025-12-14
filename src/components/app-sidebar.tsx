import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Building, Users, GraduationCap, Banknote, Settings, LifeBuoy, School, LucideProps, BookOpen, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";
interface NavItem {
  href: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  label: string;
  disabled?: boolean;
}
const navItems: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/centers", icon: Building, label: "Centers" },
  { href: "/students", icon: Users, label: "Students" },
  { href: "/teachers", icon: GraduationCap, label: "Teachers" },
  { href: "/academic", icon: BookOpen, label: "Academic" },
  { href: "/finances", icon: Banknote, label: "Finances" },
];
const helpItems: NavItem[] = [
  { href: "/settings", icon: Settings, label: "Settings", disabled: true },
  { href: "/support", icon: LifeBuoy, label: "Support", disabled: true },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar className="w-64 min-w-[260px] shrink-0">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <School className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-foreground truncate">OmniLearn</span>
          <Select defaultValue="admin">
            <SelectTrigger className="ml-auto w-auto h-8 justify-between text-xs gap-1">
              <User className="h-3 w-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin Général</SelectItem>
              <SelectItem value="center">Resp. Centre</SelectItem>
              <SelectItem value="teacher">Professeur</SelectItem>
              <SelectItem value="accountant">Comptable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                disabled={item.disabled}
                className={cn("transition-all duration-200", item.disabled && "cursor-not-allowed opacity-50")}
              >
                <NavLink to={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarMenu>
          {helpItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                disabled={item.disabled}
                className={cn("transition-all duration-200", item.disabled && "cursor-not-allowed opacity-50")}
              >
                <NavLink to={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}