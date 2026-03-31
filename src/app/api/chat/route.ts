import { NextRequest, NextResponse } from 'next/server';
import { processMessage } from '@/lib/ai/orchestrator';

// Website chat endpoint
export async function POST(request: NextRequest) {
  const { session_id, message } = await request.json();

  if (!session_id || !message) {
    return NextResponse.json({ error: 'session_id and message are required' }, { status: 400 });
  }

  const result = await processMessage('web', session_id, message);

  return NextResponse.json({
    reply: result.reply,
    tool_calls: result.toolCalls.map((tc) => ({
      tool: tc.tool,
      success: tc.result.success,
    })),
  });
}
