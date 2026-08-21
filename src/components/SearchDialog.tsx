import { useState, useEffect } from 'react';

interface ToolItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  categoryName?: string;
  alternatives?: string[];
}

interface SearchDialogProps {
  tools: ToolItem[];
}

export default function SearchDialog({ tools }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to open search event from navbar
  useEffect(() => {
    const openBtns = document.querySelectorAll('[data-open-search]');
    const handleOpen = () => setIsOpen(true);
    openBtns.forEach((btn) => btn.addEventListener('click', handleOpen));
    return () => {
      openBtns.forEach((btn) => btn.removeEventListener('click', handleOpen));
    };
  }, []);

  const filtered = query.trim() === ''
    ? tools.slice(0, 6)
    : tools.filter((tool) => {
        const q = query.toLowerCase();
        return (
          tool.name.toLowerCase().includes(q) ||
          tool.tagline.toLowerCase().includes(q) ||
          (tool.categoryName && tool.categoryName.toLowerCase().includes(q)) ||
          (tool.alternatives && tool.alternatives.some((alt) => alt.toLowerCase().includes(q)))
        );
      });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-4 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, categories, or global alternatives (e.g. Datadog)..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No Indian alternatives found for "{query}".
            </div>
          ) : (
            filtered.map((t) => (
              <a
                key={t.id}
                href={`/tools/${t.slug}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    {t.categoryName && (
                      <span className="rounded bg-secondary px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                        {t.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.tagline}</p>
                </div>
                {t.alternatives && t.alternatives.length > 0 && (
                  <span className="shrink-0 text-[10px] font-medium text-primary">
                    Alt to {t.alternatives[0]}
                  </span>
                )}
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
