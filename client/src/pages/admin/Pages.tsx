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
import { RichTextEditor } from "@/components/RichTextEditor";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPages() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({
    slug: "",
    titleNL: "",
    titleEN: "",
    contentNL: "",
    contentEN: "",
    metaDescriptionNL: "",
    metaDescriptionEN: "",
    isPublished: true,
    order: 0
  });

  const utils = trpc.useUtils();
  const { data: pages = [], isLoading } = trpc.pages.listAll.useQuery();
  const createMutation = trpc.pages.create.useMutation({
    onSuccess: () => {
      utils.pages.listAll.invalidate();
      toast.success("Page created successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create page")
  });
  const updateMutation = trpc.pages.update.useMutation({
    onSuccess: () => {
      utils.pages.listAll.invalidate();
      toast.success("Page updated successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update page")
  });
  const deleteMutation = trpc.pages.delete.useMutation({
    onSuccess: () => {
      utils.pages.listAll.invalidate();
      toast.success("Page deleted successfully");
    },
    onError: () => toast.error("Failed to delete page")
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      titleNL: "",
      titleEN: "",
      contentNL: "",
      contentEN: "",
      metaDescriptionNL: "",
      metaDescriptionEN: "",
      isPublished: true,
      order: 0
    });
    setEditingPage(null);
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      titleNL: page.titleNL,
      titleEN: page.titleEN,
      contentNL: page.contentNL,
      contentEN: page.contentEN,
      metaDescriptionNL: page.metaDescriptionNL || "",
      metaDescriptionEN: page.metaDescriptionEN || "",
      isPublished: page.isPublished,
      order: page.order
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-glow-primary mb-2">Pages</h1>
            <p className="text-muted-foreground">Manage your website pages</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="glow-primary">
                <Plus size={20} className="mr-2" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="about-us"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titleNL">Title (Dutch)</Label>
                    <Input
                      id="titleNL"
                      value={formData.titleNL}
                      onChange={(e) => setFormData({ ...formData, titleNL: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleEN">Title (English)</Label>
                    <Input
                      id="titleEN"
                      value={formData.titleEN}
                      onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Content (Dutch)</Label>
                  <RichTextEditor
                    value={formData.contentNL}
                    onChange={(value) => setFormData({ ...formData, contentNL: value })}
                  />
                </div>

                <div>
                  <Label>Content (English)</Label>
                  <RichTextEditor
                    value={formData.contentEN}
                    onChange={(value) => setFormData({ ...formData, contentEN: value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metaNL">Meta Description (Dutch)</Label>
                    <Input
                      id="metaNL"
                      value={formData.metaDescriptionNL}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionNL: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaEN">Meta Description (English)</Label>
                    <Input
                      id="metaEN"
                      value={formData.metaDescriptionEN}
                      onChange={(e) => setFormData({ ...formData, metaDescriptionEN: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="published">Published</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="glow-primary">
                    {editingPage ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pages List */}
        <Card className="glass">
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : pages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pages yet. Create your first page!</p>
            ) : (
              <div className="space-y-2">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 rounded-md hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{page.titleEN}</h3>
                        {page.isPublished ? (
                          <Eye size={16} className="text-primary" />
                        ) : (
                          <EyeOff size={16} className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
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
      </div>
    </AdminLayout>
  );
}
