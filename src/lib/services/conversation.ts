import { createClient } from '@/lib/supabase/server';
import type { ConversationThread, ConversationMessage, ConversationChannel } from '@/lib/types';

export async function getOrCreateThread(
  channel: ConversationChannel,
  externalId: string
): Promise<ConversationThread> {
  const supabase = await createClient();

  // Try to find existing active thread
  const { data: existing } = await supabase
    .from('conversation_threads')
    .select('*')
    .eq('channel', channel)
    .eq('external_id', externalId)
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing as ConversationThread;

  // Create new thread
  const { data: thread, error } = await supabase
    .from('conversation_threads')
    .insert({ channel, external_id: externalId, status: 'active' })
    .select()
    .single();

  if (error) throw error;
  return thread as ConversationThread;
}

export async function addMessage(
  threadId: string,
  role: 'customer' | 'assistant' | 'staff' | 'system',
  content: string,
  metadata?: Record<string, unknown>
): Promise<ConversationMessage> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      thread_id: threadId,
      role,
      content,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ConversationMessage;
}

export async function getThreadMessages(threadId: string): Promise<ConversationMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at');

  if (error) throw error;
  return data as ConversationMessage[];
}

export async function getThreads(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('conversation_threads')
    .select('*, customer:customers(*)')
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function handoffToStaff(threadId: string, assignTo?: string) {
  const supabase = await createClient();

  await supabase
    .from('conversation_threads')
    .update({ status: 'handed_off', assigned_to: assignTo || null })
    .eq('id', threadId);

  await addMessage(threadId, 'system', 'Conversation handed off to staff', {
    action: 'handoff',
    assigned_to: assignTo,
  });
}
