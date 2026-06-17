import type { UIMessage } from "ai";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: UIMessage;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-lg",
          isUser
            ? "bg-cyan-400 text-slate-950"
            : "border border-white/10 bg-slate-900/80 text-slate-100",
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] opacity-70">
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          <span>{isUser ? "You" : "Agent"}</span>
        </div>
        <p className="whitespace-pre-wrap">{text || "…"}</p>
      </div>
    </div>
  );
}
