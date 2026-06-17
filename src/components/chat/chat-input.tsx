"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type ChatInputProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onSend: (message: string) => void | Promise<void>;
};

export default function ChatInput({
  disabled = false,
  isLoading = false,
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex items-end gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const message = value.trim();
        if (!message || disabled) {
          return;
        }
        setValue("");
        await onSend(message);
      }}
    >
      <label className="flex-1">
        <span className="sr-only">Send a message</span>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={2}
          disabled={disabled}
          placeholder="Ask the agent about the task..."
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <button
        type="submit"
        disabled={disabled || isLoading || !value.trim()}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
      >
        <Send className="h-4 w-4" />
        {isLoading ? "Streaming..." : "Send"}
      </button>
    </form>
  );
}
