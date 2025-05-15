"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListChecks, PlusSquare, ShieldCheck, LogOut, UserCircle, Settings, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/firebase";
import { signOut } from "firebase/auth";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally show a toast notification for logout error
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['user', 'admin'] },
    { href: "/tasks/new", label: "New Task", icon: PlusSquare, roles: ['user', 'admin'] },
  ];

  const adminNavItems = [
     { href: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ['admin'] },
  ];

  const accountItems = [
    // { href: "/profile", label: "Profile", icon: UserCircle, roles: ['user', 'admin'] },
    // { href: "/settings", label: "Settings", icon: Settings, roles: ['user', 'admin'] },
  ];


  const getInitials = (name?: string | null) => {
    if (!name) return "TT";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };


  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
           <ListChecks className="h-8 w-8 text-primary" />
           <h1 className="text-2xl font-semibold text-primary group-data-[collapsible=icon]:hidden">TaskTrak</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.filter(item => item.roles.includes(currentUser?.role || 'user')).map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right", align:"center" }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          
          {isAdmin && adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
               <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                   tooltip={{ children: item.label, side: "right", align:"center" }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {accountItems.length > 0 && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarMenu>
                {accountItems.filter(item => item.roles.includes(currentUser?.role || 'user')).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label, side: "right", align:"center" }}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
         <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser?.photoURL || undefined} alt={currentUser?.displayName || currentUser?.email || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(currentUser?.displayName || currentUser?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                {currentUser?.displayName || currentUser?.email || "User"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {currentUser?.role}
              </span>
            </div>
          </div>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
               <Button
                variant="ghost"
                size="icon"
                className="mt-2 w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
              </Button>
            </TooltipTrigger>
             <TooltipContent side="right" align="center" className="group-data-[collapsible=icon]:block hidden">
                Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  );
}
