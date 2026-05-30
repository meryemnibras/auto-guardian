"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Chat, ChatMessage } from "@/types/db";

interface UseChats {
  list: Chat[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadOne: (id: number) => Promise<Chat | undefined>;
  createWithFirstMessage: (
    userMessage: ChatMessage,
    assistantMessage: ChatMessage,
    title?: string
  ) => Promise<number | null>;
  appendExchange: (
    chatId: number,
    userMessage: ChatMessage,
    assistantMessage: ChatMessage
  ) => Promise<boolean>;
  rename: (chatId: number, title: string) => Promise<boolean>;
  remove: (chatId: number) => Promise<boolean>;
  clearAll: () => Promise<void>;
}

function deriveTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return "محادثة جديدة";
  return trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed;
}

export function useChats(): UseChats {
  const [list, setList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await db.chats.orderBy("updatedAt").reverse().toArray();
      setList(records);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadOne = useCallback(async (id: number) => {
    try {
      return await db.chats.get(id);
    } catch {
      return undefined;
    }
  }, []);

  const createWithFirstMessage = useCallback<
    UseChats["createWithFirstMessage"]
  >(
    async (userMessage, assistantMessage, title) => {
      try {
        const now = Date.now();
        const id = await db.chats.add({
          title: title ?? deriveTitle(userMessage.content),
          messages: [userMessage, assistantMessage],
          createdAt: now,
          updatedAt: now,
        });
        await refresh();
        return id as number;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      }
    },
    [refresh]
  );

  const appendExchange = useCallback<UseChats["appendExchange"]>(
    async (chatId, userMessage, assistantMessage) => {
      try {
        const existing = await db.chats.get(chatId);
        if (!existing) return false;
        await db.chats.update(chatId, {
          messages: [...existing.messages, userMessage, assistantMessage],
          updatedAt: Date.now(),
        });
        await refresh();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return false;
      }
    },
    [refresh]
  );

  const rename = useCallback<UseChats["rename"]>(
    async (chatId, title) => {
      try {
        await db.chats.update(chatId, {
          title: title.trim() || "محادثة بلا عنوان",
          updatedAt: Date.now(),
        });
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh]
  );

  const remove = useCallback<UseChats["remove"]>(
    async (chatId) => {
      try {
        await db.chats.delete(chatId);
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    try {
      await db.chats.clear();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [refresh]);

  return {
    list,
    loading,
    error,
    refresh,
    loadOne,
    createWithFirstMessage,
    appendExchange,
    rename,
    remove,
    clearAll,
  };
}
