import { createClient } from '@/lib/supabase/server';

export async function logAuditEvent(params: {
  entityType: string;
  entityId: string;
  action: string;
  actor?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  await supabase.from('audit_log').insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    actor: params.actor || 'system',
    old_data: params.oldData || null,
    new_data: params.newData || null,
  });
}
