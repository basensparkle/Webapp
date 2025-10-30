import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Menu as MenuIcon,
  Users,
  Settings,
  Image,
  LogOut,
  X
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "content_editor"] },
    { path: "/admin/pages", icon: FileText, label: "Pages", roles: ["admin", "content_editor"] },
    { path: "/admin/services", icon: Briefcase, label: "Services", roles: ["admin", "content_editor"] },
    { path: "/admin/menu", icon: MenuIcon, label: "Menu", roles: ["admin", "content_editor"] },
    { path: "/admin/media", icon: Image, label: "Media", roles: ["admin", "content_editor"] },
    { path: "/admin/users", icon: Users, label: "Users", roles: ["admin"] },
    { path: "/admin/settings", icon: Settings, label: "Settings", roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || "user")
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-primary">{APP_TITLE} Admin</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-accent/10 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/">
              <a className="text-xl font-bold text-glow-primary hover:opacity-80 transition-opacity">
                {APP_TITLE}
              </a>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-border">
            <div className="mb-3">
              <p className="text-sm font-medium">{user?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
