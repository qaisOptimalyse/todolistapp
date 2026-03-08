export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7D6] [background-image:radial-gradient(circle,_#e5d3a0_1px,_transparent_0)] bg-[size:24px_24px]">
      {/* Main “notebook page” */}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col px-6 py-8">
          {/* Top bar / subtle header */}
          <header className="mb-6 flex items-center justify-between text-sm text-zinc-700">
            <span className="font-medium tracking-wide">Streamline – Today</span>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Notebook View
            </span>
          </header>

          {/* Entries list placeholder (aligns with the dotted background) */}
          <section className="flex-1 space-y-3 text-zinc-900">
            {/* Example “fake” entries for now; will be replaced with real data later */}
            <p className="text-sm text-zinc-500">
              Start typing at the bottom to add today&apos;s notes…
            </p>

            {/* You can delete these samples once Supabase is wired up */}
            <div className="space-y-2 text-[15px] leading-relaxed">
              <div className="text-zinc-800/80">
                • Sketch notebook UI with yellow dotted background.
              </div>
              <div className="text-zinc-800/80">
                • Figure out AI flow for tasks vs thoughts.
              </div>
              <div className="text-zinc-800/80">
                • Plan calendar drag-and-drop timeline.
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom input + actions bar */}
      <footer className="border-t border-black/5 bg-[#FFF7D6]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-6 py-4">
          <input
            type="text"
            placeholder="Write anything that crosses your mind…"
            className="flex-1 rounded-full border border-zinc-300 bg-yellow-50/60 px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-800/40"
          />
          <button className="rounded-full border border-zinc-800/70 bg-zinc-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-yellow-50 shadow-sm hover:bg-zinc-800">
            Show Tasks
          </button>
          <button className="rounded-full border border-zinc-400 bg-yellow-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-800 shadow-sm hover:bg-yellow-100">
            Show Thoughts
          </button>
        </div>
      </footer>
    </div>
  );
}