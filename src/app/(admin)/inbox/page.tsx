'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Phone, Globe, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { ConversationThread, ConversationMessage } from '@/lib/types';

export default function InboxPage() {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, []);

  async function loadThreads() {
    const supabase = createClient();
    const { data } = await supabase
      .from('conversation_threads')
      .select('*, customer:customers(name, phone)')
      .order('updated_at', { ascending: false });
    setThreads((data ?? []) as unknown as ConversationThread[]);
    setLoading(false);
  }

  async function loadMessages(threadId: string) {
    setSelectedThread(threadId);
    const supabase = createClient();
    const { data } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at');
    setMessages((data ?? []) as ConversationMessage[]);
  }

  async function sendReply() {
    if (!selectedThread || !replyText.trim()) return;
    const supabase = createClient();
    await supabase.from('conversation_messages').insert({
      thread_id: selectedThread,
      role: 'staff',
      content: replyText,
    });
    setReplyText('');
    loadMessages(selectedThread);
  }

  async function closeThread(threadId: string) {
    const supabase = createClient();
    await supabase
      .from('conversation_threads')
      .update({ status: 'closed' })
      .eq('id', threadId);
    loadThreads();
    if (selectedThread === threadId) {
      setSelectedThread(null);
      setMessages([]);
    }
  }

  const selected = threads.find((t) => t.id === selectedThread);

  return (
    <div className="flex h-full">
      {/* Thread list */}
      <div className="w-80 border-r bg-white">
        <div className="border-b p-4">
          <h1 className="text-lg font-semibold">Inbox</h1>
        </div>
        <div className="overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-neutral-500">Loading...</p>
          ) : threads.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">No conversations yet</p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => loadMessages(thread.id)}
                className={cn(
                  'flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-neutral-50',
                  selectedThread === thread.id && 'bg-neutral-100'
                )}
              >
                <div className="mt-0.5">
                  {thread.channel === 'whatsapp' ? (
                    <Phone className="h-4 w-4 text-green-600" />
                  ) : (
                    <Globe className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {(thread.customer as unknown as { name: string })?.name || thread.external_id || 'Unknown'}
                    </span>
                    <Badge
                      variant={
                        thread.status === 'active' ? 'success' :
                        thread.status === 'handed_off' ? 'warning' : 'secondary'
                      }
                      className="ml-2 text-[10px]"
                    >
                      {thread.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    {thread.channel} · {new Date(thread.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message area */}
      <div className="flex flex-1 flex-col">
        {selectedThread && selected ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-neutral-400" />
                <span className="font-medium">
                  {(selected.customer as unknown as { name: string })?.name || selected.external_id}
                </span>
                <Badge variant="outline">{selected.channel}</Badge>
                {selected.status === 'handed_off' && (
                  <Badge variant="warning">Needs attention</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => closeThread(selected.id)}>
                Close Thread
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    msg.role === 'customer'
                      ? 'bg-white border mr-auto'
                      : msg.role === 'assistant'
                      ? 'bg-indigo-50 border border-indigo-100 ml-auto'
                      : msg.role === 'staff'
                      ? 'bg-green-50 border border-green-100 ml-auto'
                      : 'bg-neutral-100 mx-auto text-center text-xs text-neutral-500'
                  )}
                >
                  <div className="mb-1 text-[10px] font-medium text-neutral-400">
                    {msg.role}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-1 text-[10px] text-neutral-400">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="border-t bg-white p-3">
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <Button onClick={sendReply} size="icon" className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-neutral-400">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8" />
              <p>Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
