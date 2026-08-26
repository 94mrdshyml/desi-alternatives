import { useState, useEffect, useRef } from 'react';

export interface SearchResultItem {
  id: string;
  type: 'tool' | 'alternative' | 'category' | 'blog';
  title: string;
  subtitle: string;
  slug: string;
  url: string;
  logoUrl?: string | null;
  emoji?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  categoryEmoji?: string | null;
  badgeLabel: string;
  badgeType: 'tool' | 'alternative' | 'category' | 'blog';
  metaBadge?: string | null;
  score: number;
}

interface SearchCounts {
  all: number;
  tools: number;
  alternatives: number;
  categories: number;
  blog: number;
}

type TabKey = 'all' | 'tools' | 'alternatives' | 'categories' | 'blog';

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [counts, setCounts] = useState<SearchCounts>({ all: 0, tools: 0, alternatives: 0, categories: 0, blog: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchLogId, setSearchLogId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Navbar and UI trigger listeners ([data-open-search])
  useEffect(() => {
    const openBtns = document.querySelectorAll('[data-open-search]');
    const handleOpen = (e: Event) => {
      e.preventDefault();
      setIsOpen(true);
    };
    openBtns.forEach((btn) => btn.addEventListener('click', handleOpen));
    return () => {
      openBtns.forEach((btn) => btn.removeEventListener('click', handleOpen));
    };
  }, []);

  // Fetch initial popular suggestions when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchSearchResults('', 'all');
    } else {
      setQuery('');
      setActiveTab('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle Query or Tab Change with debounce
  useEffect(() => {
    if (!isOpen) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchSearchResults(query, activeTab);
    }, 120);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, activeTab]);

  const fetchSearchResults = async (q: string, tab: TabKey) => {
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (tab !== 'all') params.set('type', tab);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        setResults(data.results || []);
        if (data.counts) setCounts(data.counts);
        if (data.searchLogId) setSearchLogId(data.searchLogId);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error('Search fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation through search results (Up / Down / Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        handleCardClick(selected);
      }
    }
  };

  // Scroll selected item into view smoothly
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Click telemetry and navigation
  const handleCardClick = (item: SearchResultItem) => {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob(
          [
            JSON.stringify({
              searchLogId,
              query,
              clickedType: item.type,
              clickedId: item.id,
              clickedSlug: item.slug,
            }),
          ],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/search/click', blob);
      }
    } catch {}

    setIsOpen(false);
    window.location.href = item.url;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-20 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Universal Sovereign Software Search"
    >
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl border border-border bg-white shadow-2xl overflow-hidden ring-1 ring-black/10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 bg-slate-50/50">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 text-primary shrink-0">
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search Indian tools, global alternatives (e.g. Jira, Datadog), categories, or articles..."
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md text-xs cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-border bg-white px-2 py-1 text-[11px] font-mono text-muted-foreground hover:bg-slate-100 hover:text-foreground cursor-pointer shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Filter Sub-Tabs with Counter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/80 bg-slate-50/70 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-foreground shadow-2xs border border-border font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
            }`}
          >
            <span>✨ All</span>
            <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'tools'
                ? 'bg-amber-50 text-amber-900 shadow-2xs border border-amber-300 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
            }`}
          >
            <span>🇮🇳 Tools</span>
            <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
              {counts.tools}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alternatives')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'alternatives'
                ? 'bg-sky-50 text-sky-900 shadow-2xs border border-sky-300 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
            }`}
          >
            <span>🌐 Alternatives</span>
            <span className="rounded-full bg-sky-200/80 px-1.5 py-0.2 text-[10px] font-bold text-sky-900">
              {counts.alternatives}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'bg-emerald-50 text-emerald-900 shadow-2xs border border-emerald-300 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
            }`}
          >
            <span>🏷️ Categories</span>
            <span className="rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[10px] font-bold text-emerald-900">
              {counts.categories}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'blog'
                ? 'bg-indigo-50 text-indigo-900 shadow-2xs border border-indigo-300 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
            }`}
          >
            <span>✍️ Articles</span>
            <span className="rounded-full bg-indigo-200/80 px-1.5 py-0.2 text-[10px] font-bold text-indigo-900">
              {counts.blog}
            </span>
          </button>
        </div>

        {/* Result Cards Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[58vh]">
          {results.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl mb-3 border border-amber-200">
                🔍
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {query ? `No exact matches found for "${query}"` : 'No suggestions available'}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {query ? (
                  <>
                    We have automatically logged <strong className="text-foreground font-semibold font-mono">"{query}"</strong> in our Content Gap Explorer so our editorial team can discover and list Indian alternatives!
                  </>
                ) : (
                  'Type a tool name, software giant, category, or topic to search across the sovereign directory.'
                )}
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              // Type Pill Color Badges
              let typeBadgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
              if (item.type === 'tool') {
                typeBadgeClass = 'bg-amber-100/90 text-amber-900 border border-amber-300 font-bold';
              } else if (item.type === 'alternative') {
                typeBadgeClass = 'bg-sky-100/90 text-sky-900 border border-sky-300 font-bold';
              } else if (item.type === 'category') {
                typeBadgeClass = 'bg-emerald-100/90 text-emerald-900 border border-emerald-300 font-bold';
              } else if (item.type === 'blog') {
                typeBadgeClass = 'bg-indigo-100/90 text-indigo-900 border border-indigo-300 font-bold';
              }

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleCardClick(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group relative flex items-start gap-3.5 rounded-xl border p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/60 border-primary/50 shadow-xs ring-1 ring-primary/30'
                      : 'bg-white border-border/80 hover:bg-slate-50/70 hover:border-border'
                  }`}
                >
                  {/* Card Logo / Icon / Emoji */}
                  <div className="shrink-0 pt-0.5">
                    {item.type === 'tool' && (
                      <img
                        src={item.logoUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(item.title)}`}
                        alt={item.title}
                        className="h-10 w-10 rounded-xl object-contain bg-slate-50 border border-border/70 p-1 group-hover:scale-105 transition-transform"
                      />
                    )}

                    {item.type === 'alternative' && (
                      <img
                        src={item.logoUrl || `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${item.slug}.com&size=128`}
                        alt={item.title}
                        className="h-10 w-10 rounded-xl object-contain bg-slate-50 border border-border/70 p-1 group-hover:scale-105 transition-transform"
                      />
                    )}

                    {item.type === 'category' && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-xl group-hover:scale-105 transition-transform">
                        {item.emoji || '🏷️'}
                      </div>
                    )}

                    {item.type === 'blog' && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-lg group-hover:scale-105 transition-transform overflow-hidden">
                        {item.logoUrl ? (
                          <img src={item.logoUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          '✍️'
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Information Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </span>

                      {/* Type Pill Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${typeBadgeClass}`}>
                        {item.type === 'tool' && '🇮🇳'}
                        {item.type === 'alternative' && '🌐'}
                        {item.type === 'category' && '🏷️'}
                        {item.type === 'blog' && '✍️'}
                        <span>{item.badgeLabel}</span>
                      </span>

                      {/* Category Pill for Tools & Alternatives */}
                      {(item.type === 'tool' || item.type === 'alternative') && item.categoryName && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 border border-border/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {item.categoryEmoji && <span>{item.categoryEmoji}</span>}
                          <span>{item.categoryName}</span>
                        </span>
                      )}

                      {/* Extra Meta Pill (e.g. Free Tier, UPI, Alt To...) */}
                      {item.metaBadge && (
                        <span className="ml-auto inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.metaBadge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1 leading-normal">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Navigation Arrow Indicator */}
                  <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Navigation Footer Help */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-slate-50/80 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1.5 py-0.5 border border-border font-mono shadow-2xs">↑</kbd>
              <kbd className="rounded bg-white px-1.5 py-0.5 border border-border font-mono shadow-2xs">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1.5 py-0.5 border border-border font-mono shadow-2xs">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-emerald-700">Unified Indian Directory Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
