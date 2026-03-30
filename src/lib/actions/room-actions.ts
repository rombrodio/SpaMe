'use server';

import { createClient } from '@/lib/supabase/server';
import { roomSchema, roomBlockSchema } from '@/lib/schemas/room';
import { revalidatePath } from 'next/cache';

export async function getRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('rooms').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createRoom(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomSchema.safeParse({
    ...raw,
    active: raw.active === 'on' || raw.active === 'true',
  });

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('rooms').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/rooms');
  return { success: true };
}

export async function updateRoom(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomSchema.safeParse({
    ...raw,
    active: raw.active === 'on' || raw.active === 'true',
  });

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('rooms').update(parsed.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/rooms');
  return { success: true };
}

export async function deleteRoom(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}

// Room service assignments
export async function assignServiceToRoom(roomId: string, serviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('room_services')
    .insert({ room_id: roomId, service_id: serviceId });
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}

export async function removeServiceFromRoom(roomId: string, serviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('room_services')
    .delete()
    .eq('room_id', roomId)
    .eq('service_id', serviceId);
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}

// Room blocks
export async function addRoomBlock(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomBlockSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('room_blocks').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/rooms');
  return { success: true };
}

export async function deleteRoomBlock(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('room_blocks').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}
