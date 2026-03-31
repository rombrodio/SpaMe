'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { getTherapists, createTherapist, updateTherapist, deleteTherapist } from '@/lib/actions/therapist-actions';
import Link from 'next/link';
import type { Therapist } from '@/lib/types';

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setTherapists(await getTherapists());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateTherapist(editing.id, formData);
    } else {
      await createTherapist(formData);
    }
    setDialogOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this therapist?')) return;
    await deleteTherapist(id);
    load();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Therapists</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Therapist
        </Button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {therapists.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">{t.name}</CardTitle>
                <Badge variant={t.active ? 'success' : 'secondary'}>
                  {t.active ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                {t.email && <p className="text-sm text-neutral-500">{t.email}</p>}
                {t.phone && <p className="text-sm text-neutral-500">{t.phone}</p>}
                <div className="mt-3 flex gap-1">
                  <Link href={`/therapists/${t.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(t); setDialogOpen(true); }}>
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="mr-1 h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Therapist' : 'New Therapist'}</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editing?.name ?? ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={editing?.email ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={editing?.phone ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" name="bio" defaultValue={editing?.bio ?? ''} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={editing?.active ?? true}
                className="h-4 w-4"
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <Button type="submit" className="w-full">
              {editing ? 'Update' : 'Create'} Therapist
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
