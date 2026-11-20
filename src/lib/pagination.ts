import { PAGE_SIZE } from "./format";

export type PageItem =
  | { type: "page"; page: number; href: string; active: boolean }
  | { type: "ellipsis"; key: string };

function buildPageItems(
  page: number,
  totalPages: number,
  href: (p: number) => string,
): PageItem[] {
  const nums = new Set<number>([1, totalPages]);
  for (let p = Math.max(1, page - 1); p <= Math.min(totalPages, page + 1); p++)
    nums.add(p);
  if (page <= 3) for (let p = 1; p <= Math.min(totalPages, 4); p++) nums.add(p);
  if (page >= totalPages - 2)
    for (let p = Math.max(1, totalPages - 3); p <= totalPages; p++) nums.add(p);

  const sorted = [...nums].sort((a, b) => a - b);
  const items: PageItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const prev = sorted[i - 1];
    if (prev !== undefined && cur - prev > 1) {
      items.push({ type: "ellipsis", key: `e-${prev}-${cur}` });
    }
    items.push({
      type: "page",
      page: cur,
      href: href(cur),
      active: cur === page,
    });
  }
  return items;
}

/** Data paginasi untuk komponen <Pagination> & <MobilePager> (mempertahankan query filter/pencarian). */
export function paginationProps(
  url: URL,
  page: number,
  total: number,
  pageSize = PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const href = (p: number) => {
    const u = new URL(url);
    u.searchParams.set("page", String(p));
    u.searchParams.delete("ok");
    u.searchParams.delete("err");
    return u.pathname + u.search;
  };
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(current * pageSize, total);
  return {
    page: current,
    totalPages,
    total,
    from,
    to,
    prevHref: current > 1 ? href(current - 1) : undefined,
    nextHref: current < totalPages ? href(current + 1) : undefined,
    items: buildPageItems(current, totalPages, href),
  };
}
