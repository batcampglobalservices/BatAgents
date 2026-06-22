"use client";

export interface WorkspaceMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface WorkspaceChat {
  id: string;
  title: string;
  timestamp: number;
  messages: WorkspaceMessage[];
  linkedDocuments: string[]; // document IDs
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // text or base64 representation
  timestamp: number;
}

export interface WorkspaceSettings {
  responseStyle: "simple" | "professional" | "detailed" | "friendly" | "technical";
  outputFormat: "normal" | "checklist" | "table" | "report" | "code" | "markdown";
  documentUsage: "always" | "ask first" | "never";
  memory: boolean;
}

export interface BuyerWorkspace {
  tokenId: string;
  settings: WorkspaceSettings;
  chats: WorkspaceChat[];
  documents: WorkspaceDocument[];
}

const STORAGE_PREFIX = "bat_agents_workspace_";

const DEFAULT_SETTINGS: WorkspaceSettings = {
  responseStyle: "detailed",
  outputFormat: "normal",
  documentUsage: "always",
  memory: true,
};

export const workspaceService = {
  getWorkspace(tokenId: string): BuyerWorkspace {
    if (typeof window === "undefined") {
      return { tokenId, settings: DEFAULT_SETTINGS, chats: [], documents: [] };
    }
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tokenId}`);
    if (!raw) {
      const newWs: BuyerWorkspace = {
        tokenId,
        settings: DEFAULT_SETTINGS,
        chats: [],
        documents: [],
      };
      this.saveWorkspace(tokenId, newWs);
      return newWs;
    }
    try {
      const parsed = JSON.parse(raw) as BuyerWorkspace;
      // Ensure properties are properly initialized
      if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS;
      if (!parsed.chats) parsed.chats = [];
      if (!parsed.documents) parsed.documents = [];
      return parsed;
    } catch {
      return { tokenId, settings: DEFAULT_SETTINGS, chats: [], documents: [] };
    }
  },

  saveWorkspace(tokenId: string, ws: BuyerWorkspace): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_PREFIX}${tokenId}`, JSON.stringify(ws));
  },

  updateSettings(tokenId: string, settings: Partial<WorkspaceSettings>): WorkspaceSettings {
    const ws = this.getWorkspace(tokenId);
    ws.settings = { ...ws.settings, ...settings };
    this.saveWorkspace(tokenId, ws);
    return ws.settings;
  },

  createChat(tokenId: string, title = "New Chat"): WorkspaceChat {
    const ws = this.getWorkspace(tokenId);
    const newChat: WorkspaceChat = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      title,
      timestamp: Date.now(),
      messages: [],
      linkedDocuments: [],
    };
    ws.chats.unshift(newChat); // Put new chat at the top
    this.saveWorkspace(tokenId, ws);
    return newChat;
  },

  addMessage(tokenId: string, chatId: string, role: "user" | "assistant", content: string): WorkspaceMessage[] {
    const ws = this.getWorkspace(tokenId);
    const chat = ws.chats.find((c) => c.id === chatId);
    if (!chat) return [];

    const msg: WorkspaceMessage = {
      role,
      content,
      timestamp: Date.now(),
    };
    chat.messages.push(msg);

    // Update title if it was default and this is the first message
    if (chat.title === "New Chat" && role === "user") {
      chat.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
    }

    this.saveWorkspace(tokenId, ws);
    return chat.messages;
  },

  addDocument(tokenId: string, name: string, type: string, size: number, content: string): WorkspaceDocument {
    const ws = this.getWorkspace(tokenId);
    const newDoc: WorkspaceDocument = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      name,
      type,
      size,
      content,
      timestamp: Date.now(),
    };
    ws.documents.push(newDoc);
    this.saveWorkspace(tokenId, ws);
    return newDoc;
  },

  deleteDocument(tokenId: string, docId: string): void {
    const ws = this.getWorkspace(tokenId);
    ws.documents = ws.documents.filter((d) => d.id !== docId);
    // Unlink from all chats
    ws.chats.forEach((chat) => {
      chat.linkedDocuments = chat.linkedDocuments.filter((id) => id !== docId);
    });
    this.saveWorkspace(tokenId, ws);
  },

  linkDocToChat(tokenId: string, chatId: string, docId: string): void {
    const ws = this.getWorkspace(tokenId);
    const chat = ws.chats.find((c) => c.id === chatId);
    if (!chat) return;
    if (!chat.linkedDocuments.includes(docId)) {
      chat.linkedDocuments.push(docId);
      this.saveWorkspace(tokenId, ws);
    }
  },

  unlinkDocFromChat(tokenId: string, chatId: string, docId: string): void {
    const ws = this.getWorkspace(tokenId);
    const chat = ws.chats.find((c) => c.id === chatId);
    if (!chat) return;
    chat.linkedDocuments = chat.linkedDocuments.filter((id) => id !== docId);
    this.saveWorkspace(tokenId, ws);
  }
};
