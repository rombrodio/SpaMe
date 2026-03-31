'use server';

import { createClient } from '@/lib/supabase/server';
import { customerSchema } from '@/lib/schemas/customer';
import { revalidatePath } from 'next/cache';

export async function getCustomers(search?: string) {
  const supabase = await createClient();
  let query = supabase.from('customers').select('*').order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createCustomer(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.from('customers').insert(parsed.data).select().single();
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/customers');
  return { success: true, data };
}

export async function updateCustomer(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = customerSchema.safeParse(raw);

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('customers').update(parsed.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/customers');
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/customers');
  return { success: true };
}
