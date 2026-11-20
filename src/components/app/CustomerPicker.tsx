import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CustomerOption = {
  id: number;
  name: string;
  initials: string;
  accountNumber: string;
  phone: string | null;
  balance: string;
  balanceLabel: string;
};

type Props = {
  id?: string;
  name?: string;
  initial?: CustomerOption | null;
  required?: boolean;
  unlinked?: boolean;
  showBalance?: boolean;
  placeholder?: string;
};

export function CustomerPicker({
  id = 'customerId',
  name = 'customerId',
  initial = null,
  required = false,
  unlinked = false,
  showBalance = true,
  placeholder = 'Cari nama, no. rekening, atau telepon',
}: Props) {
  const [selected, setSelected] = useState<CustomerOption | null>(initial);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CustomerOption[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const valueRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const listId = useId();

  useEffect(() => {
    valueRef.current?.setCustomValidity(required && !selected ? 'Pilih nasabah dulu.' : '');
    if (first.current) {
      first.current = false;
      return;
    }
    valueRef.current?.dispatchEvent(new Event('change', { bubbles: true }));
  }, [selected, required]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (unlinked) params.set('unlinked', '1');
        const res = await fetch(`/customers/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: { items: CustomerOption[]; hasMore: boolean } = await res.json();
        setItems(data.items);
        setHasMore(data.hasMore);
        setActive(0);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, unlinked]);

  // Tutup daftar saat klik di luar
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  function choose(c: CustomerOption) {
    setSelected(c);
    setOpen(false);
    setQuery('');
  }

  function clear() {
    setSelected(null);
    setOpen(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault(); // jangan kirim form
      if (open && items[active]) choose(items[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Nilai yang dikirim ke server. Bukan type=hidden agar atribut required ikut divalidasi browser. */}
      <input
        ref={valueRef}
        id={id}
        name={name}
        value={selected ? String(selected.id) : ''}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        aria-hidden
        data-customer-balance={selected?.balance ?? ''}
        data-customer-name={selected?.name ?? ''}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
        onInvalid={() => {
          setOpen(true);
          searchRef.current?.focus();
        }}
      />

      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border bg-primary/5 p-3 ring-primary/20">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {selected.initials}
          </span>
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate font-semibold">{selected.name}</span>
            <span className="truncate text-xs text-muted-foreground">{selected.accountNumber}</span>
            {showBalance && <span className="text-xs font-medium tabular-nums">Saldo {selected.balanceLabel}</span>}
          </span>
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border bg-background px-3 text-xs font-medium hover:bg-muted"
          >
            <X className="size-3.5" /> Ganti
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            id={`${id}-search`}
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-11 w-full min-w-0 rounded-xl border border-input bg-transparent pr-9 pl-9 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:h-10 md:text-sm dark:bg-input/30"
          />
          {loading && <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        </div>
      )}

      {open && !selected && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {failed ? (
            <p className="px-3 py-6 text-center text-sm text-destructive">Gagal memuat data. Coba lagi.</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {loading ? 'Mencari…' : query.trim() ? `Tidak ada nasabah “${query.trim()}”.` : unlinked ? 'Semua nasabah sudah punya akun.' : 'Belum ada nasabah.'}
            </p>
          ) : (
            <>
              {items.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(c)}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left', i === active && 'bg-accent')}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {c.initials}
                  </span>
                  <span className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.accountNumber}
                      {c.phone && ` · ${c.phone}`}
                    </span>
                  </span>
                  {showBalance && <span className="shrink-0 text-xs font-semibold tabular-nums">{c.balanceLabel}</span>}
                </button>
              ))}
              {hasMore && (
                <p className="px-3 py-2 text-center text-xs text-muted-foreground">Menampilkan 20 teratas — ketik untuk mempersempit.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
