'use server';

import { revalidatePath } from 'next/cache';
import { serviceSchema } from '@/lib/schemas/service';
import { demoServices } from '@/lib/demo-data';

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    // Test connection
    await client.from('services').select('id').limit(1);
    return client;
  } catch {
    return null;
  }
}

export async function getServices() {
  const supabase = await getSupabase();
  if (!supabase) return demoServices;

  const { data, error } = await supabase.from('services').select('*').order('name');
  if (error) return demoServices;
  return data;
}

export async function createService(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = serviceSchema.safeParse({
    ...raw,
    active: raw.active === 'on' || raw.active === 'true',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true }; // Demo mode

  const { error } = await supabase.from('services').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/services');
  return { success: true };
}

export async function updateService(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = serviceSchema.safeParse({
    ...raw,
    active: raw.active === 'on' || raw.active === 'true',
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };

  const { error } = await supabase.from('services').update(parsed.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/services');
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };

  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/services');
  return { success: true };
}
