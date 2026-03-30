'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getServices, createService, updateService, deleteService } from '@/lib/actions/service-actions';
import { formatCurrency } from '@/lib/utils';
import type { Service } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadServices() {
    const data = await getServices();
    setServices(data);
    setLoading(false);
  }

  useEffect(() => { loadServices(); }, []);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateService(editing.id, formData);
    } else {
      await createService(formData);
    }
    setDialogOpen(false);
    loadServices();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return;
    await deleteService(id);
    loadServices();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <CardTitle className="text-base">{service.name}</CardTitle>
                </div>
                <Badge variant={service.active ? 'success' : 'secondary'}>
                  {service.active ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-neutral-500">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">{service.duration_minutes} min</span>
                    {' · '}
                    <span className="font-medium">{formatCurrency(service.price)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'New Service'}</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name ?? ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={editing?.description ?? ''} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (min)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={editing?.duration_minutes ?? 60}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (ILS)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step={10}
                  defaultValue={editing?.price ?? 0}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  defaultValue={editing?.color ?? '#6366f1'}
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={editing?.active ?? true}
                  className="h-4 w-4"
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editing ? 'Update' : 'Create'} Service
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
