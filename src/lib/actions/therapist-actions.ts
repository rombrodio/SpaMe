'use server';

import { revalidatePath } from 'next/cache';
import { therapistSchema, availabilityRuleSchema, timeOffSchema } from '@/lib/schemas/therapist';
import { demoTherapists } from '@/lib/demo-data';

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();
    await client.from('therapists').select('id').limit(1);
    return client;
  } catch {
    return null;
  }
}

export async function getTherapists() {
  const supabase = await getSupabase();
  if (!supabase) return demoTherapists;

  const { data, error } = await supabase.from('therapists').select('*').order('name');
  if (error) return demoTherapists;
  return data;
}

export async function getTherapist(id: string) {
  const supabase = await getSupabase();
  if (!supabase) {
    const t = demoTherapists.find((t) => t.id === id) ?? demoTherapists[0];
    return {
      ...t,
      services: [
        { service_id: 'a1000000-0000-0000-0000-000000000001', service: { name: 'Swedish Massage' } },
        { service_id: 'a1000000-0000-0000-0000-000000000006', service: { name: 'Aromatherapy' } },
      ],
      availability: [
        { id: 'r1', day_of_week: 0, start_time: '09:00', end_time: '17:00' },
        { id: 'r2', day_of_week: 1, start_time: '09:00', end_time: '17:00' },
        { id: 'r3', day_of_week: 2, start_time: '09:00', end_time: '17:00' },
        { id: 'r4', day_of_week: 3, start_time: '09:00', end_time: '17:00' },
        { id: 'r5', day_of_week: 4, start_time: '09:00', end_time: '17:00' },
      ],
      timeOff: [
        { id: 'to1', start_datetime: '2026-04-10T00:00:00Z', end_datetime: '2026-04-12T23:59:00Z', reason: 'Holiday' },
      ],
    };
  }

  const [therapist, services, availability, timeOff] = await Promise.all([
    supabase.from('therapists').select('*').eq('id', id).single(),
    supabase.from('therapist_services').select('*, service:services(*)').eq('therapist_id', id),
    supabase.from('therapist_availability_rules').select('*').eq('therapist_id', id).order('day_of_week'),
    supabase.from('therapist_time_off').select('*').eq('therapist_id', id).order('start_datetime'),
  ]);

  if (therapist.error) throw therapist.error;

  return {
    ...therapist.data,
    services: services.data ?? [],
    availability: availability.data ?? [],
    timeOff: timeOff.data ?? [],
  };
}

export async function createTherapist(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = therapistSchema.safeParse({ ...raw, active: raw.active === 'on' || raw.active === 'true' });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };

  const { error } = await supabase.from('therapists').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/therapists');
  return { success: true };
}

export async function updateTherapist(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = therapistSchema.safeParse({ ...raw, active: raw.active === 'on' || raw.active === 'true' });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };

  const { error } = await supabase.from('therapists').update(parsed.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath('/therapists');
  return { success: true };
}

export async function deleteTherapist(id: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapists').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/therapists');
  return { success: true };
}

export async function assignServiceToTherapist(therapistId: string, serviceId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapist_services').insert({ therapist_id: therapistId, service_id: serviceId });
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}

export async function removeServiceFromTherapist(therapistId: string, serviceId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapist_services').delete().eq('therapist_id', therapistId).eq('service_id', serviceId);
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}

export async function addAvailabilityRule(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = availabilityRuleSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapist_availability_rules').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath(`/therapists/${parsed.data.therapist_id}`);
  return { success: true };
}

export async function deleteAvailabilityRule(id: string, therapistId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapist_availability_rules').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}

export async function addTimeOff(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = timeOffSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapist_time_off').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath(`/therapists/${parsed.data.therapist_id}`);
  return { success: true };
}

export async function deleteTimeOff(id: string, therapistId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: true };
  const { error } = await supabase.from('therapist_time_off').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}
