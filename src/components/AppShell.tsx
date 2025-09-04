"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

// Zustand store for sidebar state
interface SidebarStore {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: "sidebar-storage",
    }
  )
);

interface AppShellProps {
  children?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
  currentRoute?: "dashboard" | "leads" | "campaigns" | "settings";
  onRouteChange?: (route: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function AppShell({
  children,
  user = { name: "John Doe", email: "john@example.com" },
  onSignOut,
  currentRoute = "dashboard",
  onRouteChange,
  isLoading = false,
  error,
  onRetry,
}: AppShellProps) {
  const { isCollapsed, toggle, setCollapsed } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setCollapsed, isCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: PanelLeft },
    { id: "campaigns", label: "Campaigns", icon: PanelLeftOpen },
    { id: "settings", label: "Settings", icon: PanelLeftClose },
  ];

  const handleSignOut = () => {
    toast.success("Signed out successfully");
    onSignOut?.();
    setProfileMenuOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
            bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ease-in-out
            ${isCollapsed ? "w-[72px]" : "w-[280px]"}
            ${isMobile ? "absolute inset-y-0 left-0 z-40" : "relative"}
          `}
          aria-label="Navigation sidebar"
          aria-expanded={!isCollapsed}
        >
          {/* Brand/Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <span className="font-bold text-sidebar-primary-foreground text-sm">
                  L
                </span>
              </div>
              {!isCollapsed && (
                <span className="font-display font-semibold text-sidebar-foreground">
                  Linkbird.ai
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4" aria-label="Main navigation">
            <ul className="space-y-2" role="list">
              {navigationItems.map((item) => {
                const isActive = currentRoute === item.id;
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <Button
                      variant="ghost"
                      className={`
                        w-full justify-start h-10 px-3 transition-colors
                        ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }
                        ${isCollapsed ? "px-2" : ""}
                      `}
                      onClick={() => onRouteChange?.(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 truncate">{item.label}</span>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    w-full justify-start h-12 px-3 text-sidebar-foreground hover:bg-sidebar-accent
                    ${isCollapsed ? "px-2" : ""}
                  `}
                  title={isCollapsed ? `${user.name} - Profile menu` : undefined}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="ml-3 min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 p-2"
                align="start"
                side={isCollapsed ? "right" : "top"}
              >
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8 px-2 text-sm"
                    onClick={() => {
                      onRouteChange?.("profile");
                      setProfileMenuOpen(false);
                    }}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8 px-2 text-sm"
                    onClick={() => {
                      onRouteChange?.("settings");
                      setProfileMenuOpen(false);
                    }}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8 px-2 text-sm text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Sidebar toggle + Breadcrumbs */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
                <nav aria-label="Breadcrumb">
                  <span className="text-sm font-medium capitalize text-foreground">
                    {currentRoute}
                  </span>
                </nav>
              </div>

              {/* Center: Search */}
              <div className="flex-1 max-w-md mx-8">
                <Input
                  placeholder="Search..."
                  className="w-full"
                  aria-label="Global search"
                />
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  New
                </Button>
                <Button size="sm">
                  Export
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main
            id="main-content"
            className="flex-1 overflow-auto bg-background p-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6">
                {children || (
                  <div className="text-center py-12">
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      Welcome to {currentRoute}
                    </h2>
                    <p className="text-muted-foreground">
                      Select a section from the sidebar to get started.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}