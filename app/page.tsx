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
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  Trash2,
} from "lucide-react";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

const SUGGESTIONS = [
  "كيف أحافظ على كفاءة استهلاك الوقود؟",
  "ماذا يعني الكود P0420؟",
  "متى يجب تغيير زيت المحرك؟",
  "كيف أفحص ضغط الإطارات؟",
];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = newId();

      const nextHistory = [...messages, userMsg];
      setMessages([
        ...nextHistory,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setInput("");
      setError(null);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: nextHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          let detail = `HTTP ${response.status}`;
          try {
            const errBody = (await response.json()) as { error?: string };
            if (errBody.error) detail = errBody.error;
          } catch {
            /* ignore */
          }
          throw new Error(detail);
        }

        const headerProvider = response.headers.get("X-Chat-Provider");
        if (headerProvider) setProvider(headerProvider);

        if (!response.body) {
          throw new Error("Empty response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantText } : m
            )
          );
        }

        // Empty stream after a 200 OK = silent server-side streaming error.
        // The real cause is in the dev server console (credit, rate limit, ...).
        if (assistantText.length === 0) {
          throw new Error(
            "لم يصل أي رد من النموذج. غالباً مشكلة في الحساب (رصيد/حد طلبات). راجع سجل dev server."
          );
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pt-16 pb-32 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.55)]">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-100">
              AI DriveX Chat
            </h1>
            <p className="text-xs text-slate-400">
              مساعد ذكي للسيارات
              {provider && (
                <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      provider === "anthropic"
                        ? "bg-violet-400"
                        : provider === "groq"
                          ? "bg-orange-400"
                          : "bg-emerald-400"
                    }`}
                    aria-hidden
                  />
                  {provider === "anthropic"
                    ? "Claude"
                    : provider === "groq"
                      ? "Groq"
                      : provider === "gemini"
                        ? "Gemini"
                        : provider}
                </span>
              )}
            </p>
          </div>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={clearChat}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-300 active:scale-95"
            aria-label="مسح المحادثة"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            مسح
          </button>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pb-4"
        aria-live="polite"
      >
        {isEmpty && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center backdrop-blur">
              <Bot
                className="mx-auto h-10 w-10 text-blue-400"
                aria-hidden
              />
              <h2 className="mt-3 text-lg font-semibold text-slate-100">
                مرحباً بك في مساعد AI DriveX
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                اسألني عن سيارتك، الصيانة، أكواد الأعطال، أو أي شيء يخص القيادة.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void sendMessage(s)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 text-start text-sm text-slate-200 transition-all hover:border-blue-500/40 hover:bg-slate-900/70 active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isStreaming={isStreaming} />
        ))}

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

      <form
        onSubmit={onSubmit}
        className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl border-t border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="اكتب سؤالك هنا..."
            rows={1}
            dir="auto"
            disabled={isStreaming}
            className="max-h-40 min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            aria-label="إرسال"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.55)] transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Send className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";
  const showCursor = !isUser && isStreaming && message.content.length === 0;

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
          isUser
            ? "bg-slate-800 text-slate-300"
            : "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
        }`}
        aria-hidden
      >
        {isUser ? (
          <UserIcon className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </span>
      <div
        dir="auto"
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600/90 text-white"
            : "border border-slate-800 bg-slate-900/70 text-slate-100"
        }`}
      >
        {message.content}
        {showCursor && (
          <span className="ms-1 inline-block h-3.5 w-1 animate-pulse bg-slate-400 align-middle" />
        )}
      </div>
    </div>
  );
}
