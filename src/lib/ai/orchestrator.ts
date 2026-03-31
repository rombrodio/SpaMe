import { executeTool, type ToolName, type ToolResult } from './tools';
import { SYSTEM_PROMPT } from './prompts';
import { addMessage, getThreadMessages, getOrCreateThread } from '@/lib/services/conversation';
import { createClient } from '@/lib/supabase/server';

interface OrchestratorResult {
  reply: string;
  toolCalls: { tool: string; params: Record<string, string>; result: ToolResult }[];
}

const ALLOWED_TOOLS: Set<string> = new Set([
  'find_available_slots',
  'create_tentative_booking',
  'create_payment_link',
  'reschedule_booking',
  'cancel_booking',
  'handoff_to_staff',
]);

/**
 * AI orchestrator. Processes customer messages and returns AI responses.
 * All tool calls are logged. The AI can only call approved tools.
 *
 * This is a simplified orchestration that processes tool calls inline.
 * In production, you'd call an LLM API (OpenAI/Anthropic) with tool definitions.
 * For now, it returns a helpful message directing the user to staff.
 */
export async function processMessage(
  channel: 'whatsapp' | 'web',
  externalId: string,
  customerMessage: string
): Promise<OrchestratorResult> {
  // Get or create conversation thread
  const thread = await getOrCreateThread(channel, externalId);

  // Save customer message
  await addMessage(thread.id, 'customer', customerMessage);

  // Get conversation history for context
  const history = await getThreadMessages(thread.id);

  // If thread is handed off, don't auto-respond
  if (thread.status === 'handed_off') {
    return {
      reply: 'Your conversation has been forwarded to our team. A staff member will respond shortly.',
      toolCalls: [],
    };
  }

  const toolCalls: { tool: string; params: Record<string, string>; result: ToolResult }[] = [];

  // Simple keyword-based routing for MVP
  // In production: call LLM with SYSTEM_PROMPT, history, and tool definitions
  let reply: string;

  const lowerMsg = customerMessage.toLowerCase();

  if (lowerMsg.includes('book') || lowerMsg.includes('appointment') || lowerMsg.includes('schedule')) {
    reply = `I'd be happy to help you book an appointment! 🙏

To find available slots, I need:
1. **Which service** would you like? (e.g., Swedish Massage, Deep Tissue, Facial Treatment)
2. **What date** works for you?

You can also book directly online at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book

Or I can transfer you to our team if you prefer.`;
  } else if (lowerMsg.includes('cancel')) {
    reply = 'I can help you cancel a booking. Could you please share your booking reference or the name used for the booking? If you prefer, I can transfer you to our team.';
  } else if (lowerMsg.includes('reschedule') || lowerMsg.includes('change time') || lowerMsg.includes('move')) {
    reply = 'I can help you reschedule. Could you share your booking reference and your preferred new date/time?';
  } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
    // Fetch services to provide pricing
    const supabase = await createClient();
    const { data: services } = await supabase.from('services').select('name, price, duration_minutes').eq('active', true).order('name');

    if (services && services.length > 0) {
      const serviceList = services
        .map((s) => `• ${s.name} — ₪${s.price} (${s.duration_minutes} min)`)
        .join('\n');
      reply = `Here are our services and prices:\n\n${serviceList}\n\nWould you like to book any of these?`;
    } else {
      reply = 'Let me transfer you to our team for pricing information.';
    }
  } else if (lowerMsg.includes('hours') || lowerMsg.includes('open')) {
    reply = 'We are open Sunday through Thursday, with limited availability on Fridays. Most of our therapists work between 9:00 and 20:00. Would you like to book an appointment?';
  } else if (lowerMsg.includes('staff') || lowerMsg.includes('human') || lowerMsg.includes('person')) {
    await executeTool('handoff_to_staff', { thread_id: thread.id, reason: 'Customer requested human assistance' });
    toolCalls.push({
      tool: 'handoff_to_staff',
      params: { thread_id: thread.id, reason: 'Customer requested human assistance' },
      result: { success: true },
    });
    reply = 'I\'ve transferred you to our team. A staff member will be with you shortly!';
  } else {
    reply = `Welcome to SpaMe! 🌿 I can help you with:
• **Book** an appointment
• **Reschedule** or **cancel** a booking
• Check our **prices** and services
• Connect you with our **staff**

How can I help you today?`;
  }

  // Save AI response
  await addMessage(thread.id, 'assistant', reply, {
    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
  });

  // Log tool calls to audit
  if (toolCalls.length > 0) {
    const supabase = await createClient();
    for (const tc of toolCalls) {
      await supabase.from('audit_log').insert({
        entity_type: 'conversation',
        entity_id: thread.id,
        action: `ai_tool_call:${tc.tool}`,
        actor: 'ai',
        new_data: { params: tc.params, result: tc.result },
      });
    }
  }

  return { reply, toolCalls };
}
