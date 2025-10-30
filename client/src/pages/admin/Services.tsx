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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit, Monitor, Shield, Cpu, Brain } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconOptions = [
  { value: "Monitor", label: "Monitor", icon: Monitor },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Cpu", label: "CPU", icon: Cpu },
  { value: "Brain", label: "Brain", icon: Brain }
];

export default function AdminServices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    titleNL: "",
    titleEN: "",
    descriptionNL: "",
    descriptionEN: "",
    icon: "Monitor",
    order: 0,
    isActive: true
  });

  const utils = trpc.useUtils();
  const { data: services = [], isLoading } = trpc.services.listAll.useQuery();
  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      utils.services.listAll.invalidate();
      utils.services.list.invalidate();
      toast.success("Service updated successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update service")
  });

  const resetForm = () => {
    setFormData({
      titleNL: "",
      titleEN: "",
      descriptionNL: "",
      descriptionEN: "",
      icon: "Monitor",
      order: 0,
      isActive: true
    });
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      titleNL: service.titleNL,
      titleEN: service.titleEN,
      descriptionNL: service.descriptionNL,
      descriptionEN: service.descriptionEN,
      icon: service.icon,
      order: service.order,
      isActive: service.isActive
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, ...formData });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-glow-primary mb-2">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground col-span-2 py-8">Loading...</p>
          ) : (
            services.map((service) => {
              const IconComponent = iconOptions.find(opt => opt.value === service.icon)?.icon || Monitor;
              return (
                <Card key={service.id} className="glass hover:glow-primary transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.titleEN}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{service.titleNL}</p>
                    <p className="text-sm text-muted-foreground">{service.descriptionEN}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Order: {service.order}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          service.isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="descriptionNL">Description (Dutch)</Label>
                <Textarea
                  id="descriptionNL"
                  value={formData.descriptionNL}
                  onChange={(e) => setFormData({ ...formData, descriptionNL: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="descriptionEN">Description (English)</Label>
                <Textarea
                  id="descriptionEN"
                  value={formData.descriptionEN}
                  onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="glow-primary">
                  Update Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
