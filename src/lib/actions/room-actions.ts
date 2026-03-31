'use server';

import { revalidatePath } from 'next/cache';
import { roomSchema, roomBlockSchema } from '@/lib/schemas/room';
import { demoRooms } from '@/lib/demo-data';

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    await client.from('rooms').select('id').limit(1);
    return client;
  } catch {
    return null;
  }
}

export async function getRooms() {
  const supabase = await getSupabase();
  if (!supabase) return demoRooms;

  const { data, error } = await supabase.from('rooms').select('*').order('name');
  if (error) return demoRooms;
  return data;
}

export async function createRoom(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomSchema.safeParse({ ...raw, active: raw.active === 'on' || raw.active === 'true' });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('rooms').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/rooms');
  return { success: true };
}

export async function updateRoom(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomSchema.safeParse({ ...raw, active: raw.active === 'on' || raw.active === 'true' });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('rooms').update(parsed.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/rooms');
  return { success: true };
}

export async function deleteRoom(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}

export async function assignServiceToRoom(roomId: string, serviceId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('room_services').insert({ room_id: roomId, service_id: serviceId });
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}

export async function removeServiceFromRoom(roomId: string, serviceId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('room_services').delete().eq('room_id', roomId).eq('service_id', serviceId);
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}

export async function addRoomBlock(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = roomBlockSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('room_blocks').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/rooms');
  return { success: true };
}

export async function deleteRoomBlock(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('room_blocks').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/rooms');
  return { success: true };
}
