export enum ActiveScreen {
  ONBOARDING = "ONBOARDING",
  LOGIN = "LOGIN",
  DASHBOARD = "DASHBOARD",
  VOICE = "VOICE",
  CHAT = "CHAT",
  KNOWLEDGE_REPO = "KNOWLEDGE_REPO",
  MEDIA_GENERATOR = "MEDIA_GENERATOR",
  WORKSPACE = "WORKSPACE"
}

export interface SystemMetrics {
  thermalLoad: string;
  successProb: string;
  actionRecommended: string;
}

export interface Message {
  id: string;
  sender: "USER" | "JARVIS";
  senderName: string;
  text: string;
  timestamp: string;
  isThinking?: boolean;
  metrics?: SystemMetrics;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timeAgo: string;
  iconName: string;
  iconColor: string;
  messages: Message[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface UserAvatar {
  shape: "circle" | "hexagon" | "diamond" | "triangle" | "octagon";
  color: "cyan" | "amber" | "purple" | "emerald" | "rose" | "yellow";
}

export interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  colorClass: string;
  icon: string;
}
