"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Beaker,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  Server,
  Bot,
  User as UserIcon,
  Wand2,
  MessageSquarePlus,
  History,
  X as XIcon,
} from "lucide-react";
import { useChats } from "@/hooks/useChats";
import type { ChatMessage } from "@/types/db";

interface MockChatResponse {
  reply: string;
  echo: string;
  mock: boolean;
  providers: { anthropic: boolean; openai: boolean };
}

interface Exchange {
  id: string;
  user: string;
  bot: string;
  timestamp: number;
}

const SUGGESTIONS: { label: string; prompt: string }[] = [
  {
    label: "اشرح كود خطأ سيارة",
    prompt: "اشرح لي بشكل مبسّط ماذا يعني كود الخطأ P0420 وما الإجراء المناسب؟",
  },
  {
    label: "حلّل مصروفاتي",
    prompt:
      "حلّل لي مصاريف سيارتي لهذا الشهر: 3 فواتير وقود بإجمالي 540 ر.س، صيانة دورية 320 ر.س، غسيل 80 ر.س.",
  },
  {
    label: "اقترح ميزة AI لتطبيقي",
    prompt:
      "اقترح لي ميزة AI جديدة يمكن إضافتها لتطبيق مساعد السيارة الذكي تكون عملية وغير مكلفة.",
  },
];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function exchangesFromMessages(messages: ChatMessage[]): Exchange[] {
  const result: Exchange[] = [];
  for (let i = 0; i < messages.length; i += 2) {
    const userMsg = messages[i];
    const botMsg = messages[i + 1];
    if (userMsg && userMsg.role === "user") {
      result.push({
        id: newId(),
        user: userMsg.content,
        bot: botMsg && botMsg.role === "assistant" ? botMsg.content : "",
        timestamp: userMsg.timestamp,
      });
    }
  }
  return result;
}

export default function AiTestPage() {
  const [message, setMessage] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<{
    anthropic: boolean;
    openai: boolean;
  } | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const chats = useChats();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [exchanges, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [message]);

  const newChat = useCallback(() => {
    setExchanges([]);
    setCurrentChatId(null);
    setError(null);
    setMessage("");
    setDrawerOpen(false);
  }, []);

  const loadChat = useCallback(
    async (id: number) => {
      const chat = await chats.loadOne(id);
      if (!chat) return;
      setExchanges(exchangesFromMessages(chat.messages));
      setCurrentChatId(id);
      setError(null);
      setMessage("");
      setDrawerOpen(false);
    },
    [chats]
  );

  const deleteChat = useCallback(
    async (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      await chats.remove(id);
      if (currentChatId === id) newChat();
    },
    [chats, currentChatId, newChat]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/mock-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }

        const data = (await response.json()) as MockChatResponse;
        setProviders(data.providers);

        const now = Date.now();
        const userMsg: ChatMessage = {
          role: "user",
          content: trimmed,
          timestamp: now,
        };
        const botMsg: ChatMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: now + 1,
        };

        setExchanges((prev) => [
          ...prev,
          { id: newId(), user: trimmed, bot: data.reply, timestamp: now },
        ]);
        setMessage("");

        if (currentChatId === null) {
          const id = await chats.createWithFirstMessage(userMsg, botMsg);
          if (id !== null) setCurrentChatId(id);
        } else {
          await chats.appendExchange(currentChatId, userMsg, botMsg);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, currentChatId, chats]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(message);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(message);
    }
  }

  const isEmpty = exchanges.length === 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl gap-4 px-3 pt-16 sm:px-6">
      {/* Desktop persistent sidebar */}
      <DesktopSidebar
        chats={chats}
        currentChatId={currentChatId}
        onNew={newChat}
        onLoad={loadChat}
        onDelete={deleteChat}
      />

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}
      <MobileDrawer
        open={drawerOpen}
        chats={chats}
        currentChatId={currentChatId}
        onClose={() => setDrawerOpen(false)}
        onNew={newChat}
        onLoad={loadChat}
        onDelete={deleteChat}
      />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 sm:hidden"
            aria-label="فتح السجل"
          >
            <History className="h-4 w-4" />
            {chats.list.length > 0 && (
              <span className="absolute -end-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                {Math.min(chats.list.length, 99)}
              </span>
            )}
          </button>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_8px_24px_-8px_rgba(245,158,11,0.55)]">
            <Beaker className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-100">
              AI Test Lab
            </h1>
            <p className="truncate text-[10px] text-slate-400">
              واجهة وهمية — صفر تكلفة، محفوظة محلياً
            </p>
          </div>
          {!isEmpty && (
            <button
              type="button"
              onClick={newChat}
              disabled={isLoading}
              aria-label="محادثة جديدة"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2 text-[11px] text-slate-300 active:scale-95 disabled:opacity-40"
            >
              <MessageSquarePlus className="h-3 w-3" aria-hidden />
              جديدة
            </button>
          )}
        </header>

        <ProviderBar providers={providers} />

        {/* Messages — scrollable */}
        <div
          ref={scrollRef}
          className="-mx-3 flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:-mx-0 sm:px-0"
          aria-live="polite"
        >
          {isEmpty && !isLoading && (
            <EmptyState onPick={(p) => void sendMessage(p)} />
          )}

          {exchanges.map((ex) => (
            <ExchangeBubbles key={ex.id} exchange={ex} />
          ))}

          {isLoading && <TypingIndicator />}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span dir="auto">{error}</span>
            </div>
          )}
        </div>

        {/* Composer — sticky inside main column */}
        <form
          onSubmit={onSubmit}
          className="sticky bottom-0 -mx-3 border-t border-slate-800 bg-slate-950/95 px-3 py-3 backdrop-blur sm:-mx-0 sm:px-0 sm:py-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="اكتب رسالتك..."
              rows={1}
              dir="auto"
              disabled={isLoading}
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              aria-label="إرسال"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_8px_24px_-8px_rgba(245,158,11,0.55)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[9px] text-slate-600">
            ردود وهمية · محفوظة في IndexedDB · لا API مدفوع
          </p>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ChatsLike {
  list: { id?: number; title: string }[];
  loading: boolean;
}

function ChatListItems({
  chats,
  currentChatId,
  onLoad,
  onDelete,
}: {
  chats: ChatsLike;
  currentChatId: number | null;
  onLoad: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}) {
  if (chats.loading && chats.list.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
      </div>
    );
  }
  if (chats.list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 px-3 py-6 text-center text-[11px] text-slate-600">
        لا توجد محادثات محفوظة بعد
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {chats.list.map((c) => {
        const active = c.id === currentChatId;
        return (
          <li key={c.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => c.id != null && onLoad(c.id)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && c.id != null) {
                  e.preventDefault();
                  onLoad(c.id);
                }
              }}
              className={`group flex w-full cursor-pointer items-start gap-2 rounded-xl border px-2.5 py-2 text-start text-xs transition-colors ${
                active
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                  : "border-transparent text-slate-300 hover:bg-slate-900"
              }`}
            >
              <MessageSquarePlus
                className="mt-0.5 h-3 w-3 shrink-0 text-slate-500"
                aria-hidden
              />
              <span dir="auto" className="flex-1 break-words leading-relaxed">
                {c.title}
              </span>
              <button
                type="button"
                onClick={(e) => c.id != null && onDelete(c.id, e)}
                aria-label="حذف"
                className="rounded-md p-1 text-slate-500 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DesktopSidebar({
  chats,
  currentChatId,
  onNew,
  onLoad,
  onDelete,
}: {
  chats: ChatsLike;
  currentChatId: number | null;
  onNew: () => void;
  onLoad: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-3 border-e border-slate-800 pe-4 sm:flex">
      <SidebarHeader count={chats.list.length} onNew={onNew} />
      <div className="flex-1 overflow-y-auto">
        <ChatListItems
          chats={chats}
          currentChatId={currentChatId}
          onLoad={onLoad}
          onDelete={onDelete}
        />
      </div>
    </aside>
  );
}

function MobileDrawer({
  open,
  chats,
  currentChatId,
  onClose,
  onNew,
  onLoad,
  onDelete,
}: {
  open: boolean;
  chats: ChatsLike;
  currentChatId: number | null;
  onClose: () => void;
  onNew: () => void;
  onLoad: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}) {
  if (!open) return null;
  return (
    <aside className="fixed inset-y-0 start-0 z-50 flex w-72 flex-col gap-3 border-e border-slate-800 bg-slate-950 p-3 shadow-2xl sm:hidden">
      <div className="flex items-center justify-between gap-2">
        <SidebarHeader count={chats.list.length} onNew={onNew} compact />
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          aria-label="إغلاق"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatListItems
          chats={chats}
          currentChatId={currentChatId}
          onLoad={onLoad}
          onDelete={onDelete}
        />
      </div>
    </aside>
  );
}

function SidebarHeader({
  count,
  onNew,
  compact = false,
}: {
  count: number;
  onNew: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <History className="h-4 w-4 text-amber-400" aria-hidden />
          السجل
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
            {count}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onNew}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(245,158,11,0.6)] active:scale-95"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
        محادثة جديدة
      </button>
    </div>
  );
}

function ProviderBar({
  providers,
}: {
  providers: { anthropic: boolean; openai: boolean } | null;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-[10px] text-slate-400">
      <Server className="h-3 w-3" aria-hidden />
      <code className="rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] text-slate-200">
        POST /api/mock-chat
      </code>
      <ProviderPill label="Anthropic" enabled={providers?.anthropic ?? false} />
      <ProviderPill label="OpenAI" enabled={providers?.openai ?? false} />
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 text-center backdrop-blur">
        <Sparkles className="mx-auto h-8 w-8 text-amber-400" aria-hidden />
        <h2 className="mt-2 text-base font-semibold text-slate-100">
          مختبر AI جاهز للتجربة
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          أرسل أي رسالة لتجربة التدفّق قبل ربط مزوّد حقيقي.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
          <Wand2 className="h-3 w-3" aria-hidden />
          أمثلة جاهزة
        </div>
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onPick(s.prompt)}
              className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-3 text-start transition-all hover:border-amber-500/40 hover:bg-slate-900/70 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Sparkles
                  className="h-3.5 w-3.5 text-amber-400 transition-transform group-hover:rotate-12"
                  aria-hidden
                />
                {s.label}
              </div>
              <p
                dir="auto"
                className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500"
              >
                {s.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExchangeBubbles({ exchange }: { exchange: Exchange }) {
  const time = new Date(exchange.timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="space-y-2">
      <Bubble role="user" content={exchange.user} timestamp={time} />
      {exchange.bot && (
        <Bubble role="assistant" content={exchange.bot} timestamp={time} />
      )}
    </div>
  );
}

function Bubble({
  role,
  content,
  timestamp,
}: {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl ${
          isUser
            ? "bg-slate-800 text-slate-300"
            : "bg-gradient-to-br from-amber-500 to-rose-500 text-white"
        }`}
        aria-hidden
      >
        {isUser ? (
          <UserIcon className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
      </span>
      <div
        className={`flex max-w-[80%] flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          dir="auto"
          className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-md bg-blue-600/90 text-white"
              : "rounded-bl-md border border-slate-800 bg-slate-900/70 text-slate-100"
          }`}
        >
          {content}
        </div>
        <span className="text-[9px] text-slate-600">{timestamp}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white"
        aria-hidden
      >
        <Bot className="h-3.5 w-3.5" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2.5">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden
    />
  );
}

function ProviderPill({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
        enabled
          ? "bg-emerald-500/10 text-emerald-300"
          : "bg-slate-800 text-slate-500"
      }`}
    >
      {enabled ? (
        <CheckCircle2 className="h-2 w-2" aria-hidden />
      ) : (
        <span className="h-1 w-1 rounded-full bg-current" aria-hidden />
      )}
      {label}
    </span>
  );
}
