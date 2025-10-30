import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Briefcase, Mail, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: pages = [] } = trpc.pages.listAll.useQuery();
  const { data: services = [] } = trpc.services.listAll.useQuery();
  const { data: unreadMessages = [] } = trpc.contact.listUnread.useQuery();
  const { data: users = [] } = trpc.users.list.useQuery(undefined, {
    enabled: false // Only load if user is admin
  });

  const stats = [
    {
      title: "Total Pages",
      value: pages.length,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/admin/pages"
    },
    {
      title: "Services",
      value: services.length,
      icon: Briefcase,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      link: "/admin/services"
    },
    {
      title: "Unread Messages",
      value: unreadMessages.length,
      icon: Mail,
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/admin/messages"
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/admin/users"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-glow-primary mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the ICT Eerbeek CMS. Manage your website content here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="glass hover:glow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <Link href={stat.link}>
                    <Button variant="link" className="px-0 mt-2 text-primary">
                      View all →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-primary">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/pages">
              <Card className="glass hover:glow-primary transition-all duration-300 cursor-pointer">
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Manage Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and edit website pages
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/services">
              <Card className="glass hover:glow-secondary transition-all duration-300 cursor-pointer">
                <CardContent className="pt-6">
                  <Briefcase className="h-8 w-8 text-secondary mb-3" />
                  <h3 className="font-semibold mb-1">Edit Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Update service descriptions
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/media">
              <Card className="glass hover:glow-accent transition-all duration-300 cursor-pointer">
                <CardContent className="pt-6">
                  <Mail className="h-8 w-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-1">Media Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage media files
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Pages */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-primary">Recent Pages</h2>
          <Card className="glass">
            <CardContent className="pt-6">
              {pages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pages yet</p>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 5).map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{page.titleEN}</p>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            page.isPublished
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                        <Link href={`/admin/pages/${page.id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
