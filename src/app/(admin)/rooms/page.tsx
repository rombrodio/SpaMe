'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '@/lib/actions/room-actions';
import type { Room } from '@/lib/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setRooms(await getRooms());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateRoom(editing.id, formData);
    } else {
      await createRoom(formData);
    }
    setDialogOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this room?')) return;
    await deleteRoom(id);
    load();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Room
        </Button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">{room.name}</CardTitle>
                <Badge variant={room.active ? 'success' : 'secondary'}>
                  {room.active ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-neutral-500">{room.description}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(room); setDialogOpen(true); }}>
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(room.id)}>
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
            <DialogTitle>{editing ? 'Edit Room' : 'New Room'}</DialogTitle>
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
              {editing ? 'Update' : 'Create'} Room
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
