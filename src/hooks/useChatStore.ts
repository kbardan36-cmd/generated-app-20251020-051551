import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { chatService } from '@/lib/chat';
import type { Message } from '../../worker/types';
import type { SessionInfo } from '../../worker/types';
interface ChatState {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  isProcessing: boolean;
  input: string;
  model: string;
}
interface ChatActions {
  initialize: () => Promise<void>;
  createSession: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: () => Promise<void>;
  setModel: (model: string) => void;
  setInput: (input: string) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => Promise<void>;
}
export const useChatStore = create<ChatState & ChatActions>()(
  immer((set, get) => ({
    sessions: [],
    activeSessionId: null,
    messages: [],
    streamingMessage: '',
    isLoading: true,
    isProcessing: false,
    input: '',
    model: 'google-ai-studio/gemini-2.5-flash',
    initialize: async () => {
      set({ isLoading: true });
      const sessionsRes = await chatService.listSessions();
      if (sessionsRes.success && sessionsRes.data) {
        const sessions = sessionsRes.data;
        set({ sessions });
        if (sessions.length > 0) {
          await get().switchSession(sessions[0].id);
        } else {
          await get().createSession();
        }
      } else {
        await get().createSession();
      }
      set({ isLoading: false });
    },
    createSession: async () => {
      const res = await chatService.createSession();
      if (res.success && res.data) {
        const newSessionId = res.data.sessionId;
        const sessionsRes = await chatService.listSessions();
        if (sessionsRes.success && sessionsRes.data) {
          set({ sessions: sessionsRes.data });
        }
        await get().switchSession(newSessionId);
      }
    },
    switchSession: async (sessionId: string) => {
      if (get().activeSessionId === sessionId) return;
      set({ isLoading: true, messages: [], streamingMessage: '' });
      chatService.switchSession(sessionId);
      const messagesRes = await chatService.getMessages();
      if (messagesRes.success && messagesRes.data) {
        set({
          activeSessionId: sessionId,
          messages: messagesRes.data.messages,
          model: messagesRes.data.model,
          isProcessing: messagesRes.data.isProcessing,
        });
      }
      set({ isLoading: false });
    },
    deleteSession: async (sessionId: string) => {
      const res = await chatService.deleteSession(sessionId);
      if (res.success) {
        const remainingSessions = get().sessions.filter((s) => s.id !== sessionId);
        set({ sessions: remainingSessions });
        if (get().activeSessionId === sessionId) {
          if (remainingSessions.length > 0) {
            await get().switchSession(remainingSessions[0].id);
          } else {
            await get().createSession();
          }
        }
      }
    },
    sendMessage: async () => {
      const input = get().input.trim();
      if (!input || get().isProcessing) return;
      set({ input: '' });
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        timestamp: Date.now(),
      };
      set((state) => {
        state.messages.push(userMessage);
        state.isProcessing = true;
        state.streamingMessage = '';
      });
      const currentSessionExists = get().sessions.some(s => s.id === get().activeSessionId);
      if (!currentSessionExists && get().activeSessionId) {
        await chatService.createSession(undefined, get().activeSessionId!, input);
        const sessionsRes = await chatService.listSessions();
        if (sessionsRes.success && sessionsRes.data) {
          set({ sessions: sessionsRes.data });
        }
      }
      await chatService.sendMessage(input, get().model, (chunk) => {
        set((state) => {
          state.streamingMessage += chunk;
        });
      });
      const messagesRes = await chatService.getMessages();
      if (messagesRes.success && messagesRes.data) {
        set({
          messages: messagesRes.data.messages,
          isProcessing: messagesRes.data.isProcessing,
          streamingMessage: '',
        });
      } else {
        set({ isProcessing: false });
      }
    },
    setModel: (model: string) => {
      set({ model });
      chatService.updateModel(model);
    },
    setInput: (input: string) => {
      set({ input });
    },
    updateSessionTitle: async (sessionId: string, newTitle: string) => {
      set(state => {
        const session = state.sessions.find(s => s.id === sessionId);
        if (session) {
          session.title = newTitle;
        }
      });
      await chatService.updateSessionTitle(sessionId, newTitle);
    },
  }))
);