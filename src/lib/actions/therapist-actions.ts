'use server';

import { createClient } from '@/lib/supabase/server';
import { therapistSchema, availabilityRuleSchema, timeOffSchema } from '@/lib/schemas/therapist';
import { revalidatePath } from 'next/cache';

export async function getTherapists() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('therapists')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getTherapist(id: string) {
  const supabase = await createClient();

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
  const parsed = therapistSchema.safeParse({
    ...raw,
    active: raw.active === 'on' || raw.active === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('therapists').insert(parsed.data);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/therapists');
  return { success: true };
}

export async function updateTherapist(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = therapistSchema.safeParse({
    ...raw,
    active: raw.active === 'on' || raw.active === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('therapists').update(parsed.data).eq('id', id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/therapists');
  return { success: true };
}

export async function deleteTherapist(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('therapists').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/therapists');
  return { success: true };
}

// Therapist service assignments
export async function assignServiceToTherapist(therapistId: string, serviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('therapist_services')
    .insert({ therapist_id: therapistId, service_id: serviceId });
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}

export async function removeServiceFromTherapist(therapistId: string, serviceId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('therapist_services')
    .delete()
    .eq('therapist_id', therapistId)
    .eq('service_id', serviceId);
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}

// Availability rules
export async function addAvailabilityRule(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = availabilityRuleSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('therapist_availability_rules').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath(`/therapists/${parsed.data.therapist_id}`);
  return { success: true };
}

export async function deleteAvailabilityRule(id: string, therapistId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('therapist_availability_rules').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}

// Time off
export async function addTimeOff(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = timeOffSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('therapist_time_off').insert(parsed.data);
  if (error) return { error: { _form: [error.message] } };
  revalidatePath(`/therapists/${parsed.data.therapist_id}`);
  return { success: true };
}

export async function deleteTimeOff(id: string, therapistId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('therapist_time_off').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/therapists/${therapistId}`);
  return { success: true };
}
