"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";

type Entry = {
  id: string;
  content: string;
  created_at: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  status: string;
};

type Thought = {
  id: string;
  content: string;
  category: string | null;
};

function getTodayLocalDateString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default function Home() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [panel, setPanel] = useState<"tasks" | "thoughts" | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntries() {
      setLoading(true);
      try {
        const today = getTodayLocalDateString();
        const { data, error } = await getSupabase()
          .from("entries")
          .select("id, content, created_at")
          .eq("local_date", today)
          .order("created_at", { ascending: true });
        if (!error && data) setEntries(data as Entry[]);
      } catch {
        // Supabase not ready or env missing; leave entries empty
      }
      setLoading(false);
    }
    loadEntries();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const today = getTodayLocalDateString();
    const { data, error } = await getSupabase()
      .from("entries")
      .insert({ content: value, local_date: today })
      .select("id, content, created_at")
      .single();
    if (!error && data) {
      setEntries((prev) => [...prev, data as Entry]);
      setText("");
    }
  }

  async function loadAiResults() {
    setAiError(null);
    setAiLoading(true);
    try {
      const today = getTodayLocalDateString();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase env missing");

      const res = await fetch(`${supabaseUrl}/functions/v1/API-Callout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ target_date: today }),
      });
      const data = await res.json();
      console.log("Edge function response:", { ok: res.ok, status: res.status, data });

      if (!res.ok) {
        throw new Error(data?.error || res.statusText || "Edge function failed");
      }
      setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
      setThoughts(Array.isArray(data?.thoughts) ? data.thoughts : []);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong");
      setTasks([]);
      setThoughts([]);
    } finally {
      setAiLoading(false);
    }
  }

  function handleShowTasks() {
    setPanel("tasks");
    loadAiResults();
  }

  function handleShowThoughts() {
    setPanel("thoughts");
    loadAiResults();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7D6] [background-image:radial-gradient(circle,_#e5d3a0_1px,_transparent_0)] bg-[size:24px_24px]">
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col px-6 py-8">
          <header className="mb-6 flex items-center justify-between text-sm text-zinc-700">
            <span className="font-medium tracking-wide">Streamline – Today</span>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Notebook View
            </span>
          </header>

          <section className="flex-1 space-y-3 text-zinc-900">
            {loading ? (
              <p className="text-sm text-zinc-500">Loading today&apos;s notes…</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Start typing at the bottom to add today&apos;s notes…
              </p>
            ) : (
              <div className="space-y-2 text-[15px] leading-relaxed">
                {entries.map((entry) => (
                  <div key={entry.id} className="text-zinc-800/80">
                    • {entry.content}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {panel && (
        <section className="border-t border-black/10 bg-yellow-50/95 px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">
                {panel === "tasks" ? "Tasks" : "Thoughts"}
              </span>
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                Close
              </button>
            </div>
            {aiLoading ? (
              <p className="text-sm text-zinc-500">Processing today&apos;s notes…</p>
            ) : aiError ? (
              <p className="text-sm text-red-600">{aiError}</p>
            ) : panel === "tasks" ? (
              <ul className="space-y-2 text-sm text-zinc-800">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-baseline gap-2">
                    <span className="text-zinc-500">•</span>
                    <span>{t.title}</span>
                    {t.estimated_minutes != null && (
                      <span className="text-zinc-500">({t.estimated_minutes} min)</span>
                    )}
                  </li>
                ))}
                {tasks.length === 0 && <li className="text-zinc-500">No tasks extracted yet.</li>}
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-800">
                {thoughts.map((th) => (
                  <li key={th.id} className="flex items-baseline gap-2">
                    <span className="text-zinc-500">•</span>
                    <span>{th.content}</span>
                    {th.category && (
                      <span className="text-xs text-zinc-500">[{th.category}]</span>
                    )}
                  </li>
                ))}
                {thoughts.length === 0 && <li className="text-zinc-500">No thoughts extracted yet.</li>}
              </ul>
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-black/5 bg-[#FFF7D6]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3">
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write anything that crosses your mind…"
              className="relative z-10 flex-1 rounded-full border border-zinc-300 bg-yellow-50/60 px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-800/40"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full border border-zinc-800/70 bg-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-yellow-50 shadow-sm hover:bg-zinc-800"
            >
              Add
            </button>
          </form>
          <button
            type="button"
            onClick={handleShowTasks}
            className="shrink-0 rounded-full border border-zinc-800/70 bg-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-yellow-50 shadow-sm hover:bg-zinc-800"
          >
            Show Tasks
          </button>
          <button
            type="button"
            onClick={handleShowThoughts}
            className="shrink-0 rounded-full border border-zinc-400 bg-yellow-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-800 shadow-sm hover:bg-yellow-100"
          >
            Show Thoughts
          </button>
        </div>
      </footer>
    </div>
  );
}