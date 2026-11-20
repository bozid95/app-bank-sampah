import { Prisma } from '../generated/prisma/client';

type Num = Prisma.Decimal | number | string | null | undefined;

const toNumber = (v: Num) => Number(String(v ?? 0));

export const formatRupiah = (v: Num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toNumber(v));

export const formatKg = (v: Num) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(toNumber(v)) + ' kg';

let timeZone = 'Asia/Jakarta';
let formatters = makeFormatters(timeZone);

function makeFormatters(tz: string) {
  return {
    dateTime: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: tz }),
    day: new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }),
    time: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: tz }),
    date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', timeZone: tz }),
    isoDate: new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz }),
  };
}

export function setTimeZone(tz: string) {
  if (tz === timeZone) return;
  timeZone = tz;
  formatters = makeFormatters(tz);
}

export const formatDateTime = (d: Date) => formatters.dateTime.format(d);
export const formatShortDate = (d: Date) => formatters.date.format(d);
export const toIsoDate = (d: Date) => formatters.isoDate.format(d);

export function parseDecimal(raw: FormDataEntryValue | null, maxDecimals: number): Prisma.Decimal | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().replace(',', '.');
  const re = new RegExp(`^\\d{1,10}(\\.\\d{1,${maxDecimals}})?$`);
  if (!re.test(s)) return null;
  return new Prisma.Decimal(s);
}

export function parseId(raw: string | undefined | null): number | null {
  if (!raw || !/^\d{1,9}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

export const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
};

export const flash = (path: string, type: 'ok' | 'err', msg: string) =>
  `${path}${path.includes('?') ? '&' : '?'}${type}=${encodeURIComponent(msg)}`;

export const PAGE_SIZE = 15;

export function parsePage(url: URL): number {
  const p = Number(url.searchParams.get('page') ?? '1');
  return Number.isInteger(p) && p > 0 ? p : 1;
}

/** "Jumat, 20 November 2026" */
export const formatDay = (d: Date) => formatters.day.format(d);
/** "20.02" */
export const formatTime = (d: Date) => formatters.time.format(d);

export const initials = (name: string) =>
  name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('') || '?';

/**
 * Parse nominal rupiah gaya Indonesia: titik = pemisah ribuan, koma = desimal.
 * "25.000" → 25000, "1.500,50" → 1500.5, "Rp 10000" → 10000.
 */
export function parseRupiah(raw: FormDataEntryValue | null): Prisma.Decimal | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().replace(/^rp\.?\s*/i, '').replace(/[\s.]/g, '').replace(',', '.');
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(s)) return null;
  return new Prisma.Decimal(s);
}

/** Label tipe transaksi untuk UI */
export const transactionLabel = (type: 'DEPOSIT' | 'WITHDRAWAL') =>
  type === 'DEPOSIT' ? 'Setor sampah' : 'Tarik saldo';

/** Validasi data nasabah dari form; mengembalikan pesan error (UI) atau string kosong. */
export function validateCustomer(v: { name: string; phone: string }): string {
  if (v.name.length < 2 || v.name.length > 100) return 'Nama wajib diisi (2–100 karakter).';
  if (v.phone && !/^[0-9+\-\s]{6,20}$/.test(v.phone)) return 'Nomor telepon tidak valid.';
  return '';
}

/** Awal bulan berjalan (sebagai Date UTC) untuk zona waktu dengan offset tetap, mis. 7 untuk WIB. */
export function startOfMonth(offsetHours: number, now = new Date()): Date {
  const local = new Date(now.getTime() + offsetHours * 3600_000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - offsetHours * 3600_000);
}

/** Awal hari ini (sebagai Date UTC) untuk zona waktu dengan offset tetap. */
export function startOfDay(offsetHours: number, now = new Date()): Date {
  const local = new Date(now.getTime() + offsetHours * 3600_000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offsetHours * 3600_000);
}
