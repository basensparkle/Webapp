import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Edit, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin" | "content_editor"
  });

  const utils = trpc.useUtils();
  const { data: users = [], isLoading } = trpc.users.list.useQuery();
  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("User updated successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update user")
  });
  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("User deleted successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to delete user")
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "user"
    });
    setEditingUser(null);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, ...formData });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary/10 text-primary";
      case "content_editor":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-glow-primary mb-2">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>

        {/* Users List */}
        <Card className="glass">
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-md hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name || "No name"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-3 py-1 rounded capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="User name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="user">User</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>User:</strong> Basic access<br />
                  <strong>Content Editor:</strong> Can manage pages, services, menu, and media<br />
                  <strong>Admin:</strong> Full access including user management
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="glow-primary">
                  Update User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
