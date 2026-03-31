'use server';

import { revalidatePath } from 'next/cache';
import { customerSchema } from '@/lib/schemas/customer';
import { demoCustomers } from '@/lib/demo-data';

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    await client.from('customers').select('id').limit(1);
    return client;
  } catch {
    return null;
  }
}

export async function getCustomers(search?: string) {
  const supabase = await getSupabase();
  if (!supabase) {
    if (!search) return demoCustomers;
    const s = search.toLowerCase();
    return demoCustomers.filter((c) =>
      c.name.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.phone?.includes(s)
    );
  }

  let query = supabase.from('customers').select('*').order('name');
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) return demoCustomers;
  return data;
}

export async function createCustomer(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) {
    return { success: true, data: { id: 'demo-new-customer', ...parsed.data } };
  }

  const { data, error } = await supabase.from('customers').insert(parsed.data).select().single();
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/customers');
  return { success: true, data };
}

export async function updateCustomer(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('customers').update(parsed.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/customers');
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/customers');
  return { success: true };
}
