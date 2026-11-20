import { Prisma } from '../generated/prisma/client';
import type { Cell } from 'write-excel-file/node';
import { prisma } from './prisma';
import { hashPassword } from './auth';
import { formatAccountNumber } from './accounts';
import { getTimezone, type AppConfigData } from './config';
import { cellText, readRows, type Column, type RawRow } from './spreadsheet';

export const ENTITIES = ['customers', 'waste-types', 'users', 'transactions'] as const;
export type Entity = (typeof ENTITIES)[number];
export const isEntity = (v: string): v is Entity => (ENTITIES as readonly string[]).includes(v);

export const ENTITY_INFO: Record<Entity, { label: string; file: string; maxRows: number; description: string }> = {
  customers: { label: 'Nasabah', file: 'nasabah', maxRows: 2000, description: 'Nama, alamat, telepon, dan no. rekening.' },
  'waste-types': { label: 'Jenis sampah', file: 'jenis-sampah', maxRows: 500, description: 'Daftar jenis sampah dan harga per kg.' },
  users: { label: 'Pengguna', file: 'pengguna', maxRows: 300, description: 'Akun admin/petugas dan akun nasabah.' },
  transactions: { label: 'Transaksi', file: 'transaksi', maxRows: 3000, description: 'Riwayat setoran & penarikan, mis. dari buku manual.' },
};

export type ImportError = { line: number; message: string };
export type ImportResult = { ok: true; message: string } | { ok: false; errors: ImportError[] };

type Ctx = { config: AppConfigData; username: string; userId: number };

const C = {
  accountNumber: { header: 'No. Rekening', width: 16 },
  name: { header: 'Nama', width: 28 },
  address: { header: 'Alamat', width: 32 },
  phone: { header: 'Telepon', width: 18 },
} as const;

export const COLUMNS: Record<Entity, Column[]> = {
  customers: [
    { ...C.accountNumber, note: 'Kosongkan untuk nasabah baru (dibuat otomatis). Isi no. rekening yang sudah ada untuk memperbarui datanya, atau isi no. rekening lama dari buku manual (huruf, angka, strip; maks. 20).', example: 'BS-00001' },
    { ...C.name, required: true, note: 'Nama lengkap (2–100 karakter).', example: 'Budi Santoso' },
    { ...C.address, note: 'Alamat nasabah.', example: 'RT 01 / RW 02' },
    { ...C.phone, note: 'Nomor telepon/WhatsApp. Ketik sebagai teks agar angka 0 di depan tidak hilang.', example: '081234567890' },
  ],
  'waste-types': [
    { header: 'Nama', width: 28, required: true, note: 'Nama jenis sampah (2–80 karakter). Jika nama sudah ada, harganya diperbarui.', example: 'Plastik botol (PET)' },
    { header: 'Harga per kg', width: 16, required: true, note: 'Harga beli per kg dalam rupiah, tanpa "Rp".', example: 3000 },
    { header: 'Aktif', width: 10, note: 'Ya / Tidak. Kosong = Ya. Jenis nonaktif tidak muncul di form setoran.', example: 'Ya' },
  ],
  users: [
    { header: 'Username', width: 20, required: true, note: '3–30 karakter: huruf kecil, angka, titik, strip, underscore. Jika sudah ada, akun diperbarui.', example: 'budi' },
    { header: 'Password', width: 18, note: 'Wajib untuk akun baru (min. 8 karakter). Untuk akun lama: kosongkan agar password tidak berubah.', example: 'rahasia123' },
    { header: 'Role', width: 12, note: 'Nasabah atau Admin. Kosong = Nasabah.', example: 'Nasabah' },
    { ...C.accountNumber, note: 'Wajib untuk role Nasabah: no. rekening nasabah yang sudah terdaftar.', example: 'BS-00001' },
  ],
  transactions: [
    { header: 'No. Bukti', width: 12, note: 'Opsional. Baris dengan No. Bukti yang sama digabung menjadi satu setoran berisi beberapa jenis sampah.', example: 'S-001' },
    { header: 'Tanggal', width: 18, required: true, note: 'Format tanggal Excel, atau teks 31/12/2025 atau 31/12/2025 14:30. Tidak boleh lebih awal dari transaksi terakhir nasabah di aplikasi.', example: '05/01/2026' },
    { ...C.accountNumber, required: true, note: 'No. rekening nasabah yang sudah terdaftar.', example: 'BS-00001' },
    { header: 'Nama Nasabah', width: 24, note: 'Hanya informasi, diabaikan saat impor.', example: 'Budi Santoso' },
    { header: 'Tipe', width: 10, required: true, note: 'SETOR atau TARIK.', example: 'SETOR' },
    { header: 'Jenis Sampah', width: 24, note: 'Untuk SETOR: nama jenis sampah yang sudah terdaftar. Kosongkan untuk saldo awal / setoran tanpa rincian.', example: 'Kardus' },
    { header: 'Berat (kg)', width: 12, note: 'Wajib jika Jenis Sampah diisi. Maks. 3 desimal.', example: 2.5 },
    { header: 'Harga per kg', width: 14, note: 'Opsional. Kosong = harga jenis sampah saat ini.', example: 1500 },
    { header: 'Jumlah (Rp)', width: 14, note: 'Wajib untuk TARIK dan SETOR tanpa Jenis Sampah (mis. saldo awal). Untuk setoran dengan rincian, jumlah dihitung otomatis.', example: '' },
    { header: 'Saldo Setelah', width: 14, note: 'Hanya informasi (ekspor), diabaikan saat impor. Saldo dihitung ulang otomatis.', example: '' },
    { header: 'Catatan', width: 28, note: 'Opsional.', example: 'Saldo awal dari buku lama' },
    { header: 'Petugas', width: 14, note: 'Opsional. Kosong = username Anda.', example: 'admin' },
  ],
};

export const GUIDES: Record<Entity, string[]> = {
  customers: ['Isi data mulai baris ke-2 sheet "Data". Jangan ubah judul kolom di baris pertama.', 'Saldo tidak diimpor di sini. Untuk saldo awal, impor transaksi SETOR tanpa Jenis Sampah.'],
  'waste-types': ['Isi data mulai baris ke-2 sheet "Data". Jangan ubah judul kolom di baris pertama.'],
  users: ['Isi data mulai baris ke-2 sheet "Data". Jangan ubah judul kolom di baris pertama.', 'Setelah diimpor, minta pengguna mengganti password lewat menu Ubah password.'],
  transactions: [
    'Isi data mulai baris ke-2 sheet "Data". Jangan ubah judul kolom di baris pertama.',
    'Transaksi diproses berurutan menurut tanggal, saldo nasabah dihitung ulang otomatis.',
    'Untuk memindahkan buku manual: impor dulu saldo awal (SETOR tanpa Jenis Sampah, isi Jumlah), lalu transaksi berikutnya.',
    'File ekspor transaksi bisa diimpor ke instalasi lain dengan format yang sama. Jangan impor ulang ke aplikasi yang sama (data akan dobel).',
  ],
};

function parseNumberCell(v: unknown, style: 'rupiah' | 'decimal'): Prisma.Decimal | null {
  if (typeof v === 'number') return Number.isFinite(v) ? new Prisma.Decimal(v) : null;
  const s = cellText(v).replace(/^rp\.?\s*/i, '').replace(/\s/g, '');
  if (!s) return null;
  const normalized = style === 'rupiah' ? s.replace(/\./g, '').replace(',', '.') : s.replace(',', '.');
  return /^\d+(\.\d+)?$/.test(normalized) ? new Prisma.Decimal(normalized) : null;
}

function parsePhone(v: unknown): string {
  const s = typeof v === 'number' ? String(Math.trunc(v)) : cellText(v);
  return /^8\d{8,12}$/.test(s) ? `0${s}` : s;
}

/** Tanggal dari sel Excel (Date / serial number) atau teks. Waktu dianggap waktu lokal zona aplikasi. */
function parseDateCell(v: unknown, offsetHours: number): Date | null {
  const fromWallClock = (y: number, m: number, d: number, hh = 12, mm = 0) => {
    const date = new Date(Date.UTC(y, m - 1, d, hh, mm) - offsetHours * 3600_000);
    return Number.isNaN(date.getTime()) || m < 1 || m > 12 || d < 1 || d > 31 || hh > 23 || mm > 59 ? null : date;
  };
  if (v instanceof Date) {
    // read-excel-file mengembalikan "jam dinding" Excel sebagai UTC. Excel menyimpan waktu sebagai
    // pecahan hari, jadi 09:30 bisa terbaca 09:29:59.999 — bulatkan ke menit terdekat.
    const d = new Date(Math.round(v.getTime() / 60_000) * 60_000);
    const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0;
    return fromWallClock(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hasTime ? d.getUTCHours() : 12, hasTime ? d.getUTCMinutes() : 0);
  }
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const wall = new Date(Math.round(((v - 25569) * 86_400_000) / 60_000) * 60_000);
    const hasTime = v % 1 !== 0;
    return fromWallClock(wall.getUTCFullYear(), wall.getUTCMonth() + 1, wall.getUTCDate(), hasTime ? wall.getUTCHours() : 12, hasTime ? wall.getUTCMinutes() : 0);
  }
  const s = cellText(v);
  let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T](\d{1,2})[:.](\d{2}))?$/);
  if (m) return fromWallClock(+m[3]!, +m[2]!, +m[1]!, m[4] ? +m[4] : 12, m[5] ? +m[5] : 0);
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) return fromWallClock(+m[1]!, +m[2]!, +m[3]!, m[4] ? +m[4] : 12, m[5] ? +m[5] : 0);
  return null;
}

const yes = (v: unknown) => {
  const s = cellText(v).toLowerCase();
  if (s === '' || ['ya', 'y', 'yes', 'true', '1', 'aktif'].includes(s) || v === true) return true;
  if (['tidak', 't', 'no', 'n', 'false', '0', 'nonaktif'].includes(s) || v === false) return false;
  return null;
};

const ACCOUNT_RE = /^[A-Z0-9][A-Z0-9-]{0,19}$/;
const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;

// ---------------------------------------------------------------------------------------------
// Impor
// ---------------------------------------------------------------------------------------------

export async function importFile(entity: Entity, file: Blob, ctx: Ctx): Promise<ImportResult> {
  const required = COLUMNS[entity].filter((c) => c.required).map((c) => c.header);
  let parsed;
  try {
    parsed = await readRows(file, required);
  } catch {
    return { ok: false, errors: [{ line: 0, message: 'File tidak bisa dibaca. Pastikan formatnya Excel (.xlsx) dan memakai template dari halaman ini.' }] };
  }
  if (parsed.missing.length) {
    return { ok: false, errors: [{ line: 1, message: `Kolom wajib tidak ditemukan: ${parsed.missing.join(', ')}. Gunakan template terbaru.` }] };
  }
  const { rows } = parsed;
  if (rows.length === 0) return { ok: false, errors: [{ line: 0, message: 'File tidak berisi data (sheet "Data" kosong).' }] };
  const max = ENTITY_INFO[entity].maxRows;
  if (rows.length > max) return { ok: false, errors: [{ line: 0, message: `Maksimal ${max} baris per impor. Pecah file menjadi beberapa bagian.` }] };

  switch (entity) {
    case 'customers':
      return importCustomers(rows, ctx);
    case 'waste-types':
      return importWasteTypes(rows);
    case 'users':
      return importUsers(rows, ctx);
    case 'transactions':
      return importTransactions(rows, ctx);
  }
}

const TX_OPTIONS = { maxWait: 10_000, timeout: 120_000 };

async function importCustomers(rows: RawRow[], ctx: Ctx): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const seen = new Map<string, number>();
  const items = rows.map((r) => {
    const accountNumber = cellText(r.get('No. Rekening')).toUpperCase();
    const name = cellText(r.get('Nama'));
    const address = cellText(r.get('Alamat'));
    const phone = parsePhone(r.get('Telepon'));
    if (name.length < 2 || name.length > 100) errors.push({ line: r.line, message: 'Nama wajib diisi (2–100 karakter).' });
    if (phone && !/^[0-9+\-\s]{6,20}$/.test(phone)) errors.push({ line: r.line, message: `Nomor telepon "${phone}" tidak valid.` });
    if (address.length > 255) errors.push({ line: r.line, message: 'Alamat maksimal 255 karakter.' });
    if (accountNumber) {
      if (!ACCOUNT_RE.test(accountNumber)) errors.push({ line: r.line, message: `No. rekening "${accountNumber}" tidak valid (huruf, angka, strip; maks. 20).` });
      else if (accountNumber.startsWith('TMP-')) errors.push({ line: r.line, message: 'No. rekening tidak boleh diawali "TMP-".' });
      if (seen.has(accountNumber)) errors.push({ line: r.line, message: `No. rekening ${accountNumber} muncul dua kali (juga di baris ${seen.get(accountNumber)}).` });
      seen.set(accountNumber, r.line);
    }
    return { line: r.line, accountNumber, name, address: address || null, phone: phone || null };
  });
  if (errors.length) return { ok: false, errors };

  const existing = new Map(
    (await prisma.customer.findMany({ where: { accountNumber: { in: [...seen.keys()] } }, select: { id: true, accountNumber: true } })).map((c) => [c.accountNumber, c.id]),
  );
  const toUpdate = items.filter((i) => i.accountNumber && existing.has(i.accountNumber));
  const toCreate = items.filter((i) => !i.accountNumber || !existing.has(i.accountNumber));

  try {
    await prisma.$transaction(async (tx) => {
      for (const i of toUpdate) {
        await tx.customer.update({ where: { id: existing.get(i.accountNumber)! }, data: { name: i.name, address: i.address, phone: i.phone } });
      }
      if (toCreate.length) {
        await tx.customer.createMany({
          data: toCreate.map((i, n) => ({
            accountNumber: i.accountNumber || `TMP-${Date.now().toString(36)}-${n}`,
            name: i.name,
            address: i.address,
            phone: i.phone,
          })),
        });
        // No. rekening otomatis berdasarkan id, sama seperti saat menambah nasabah lewat form
        const prefix = ctx.config.accountNumberPrefix;
        await tx.$executeRaw`UPDATE "Customer" SET "accountNumber" = ${prefix} || '-' || lpad(id::text, 5, '0') WHERE "accountNumber" LIKE 'TMP-%'`;
      }
    }, TX_OPTIONS);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, errors: [{ line: 0, message: `No. rekening bentrok dengan nomor otomatis (format ${formatAccountNumber(ctx.config.accountNumberPrefix, 1)}). Kosongkan kolom No. Rekening untuk nasabah baru.` }] };
    }
    throw e;
  }
  return { ok: true, message: `${toCreate.length} nasabah baru ditambahkan, ${toUpdate.length} diperbarui.` };
}

async function importWasteTypes(rows: RawRow[]): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const seen = new Map<string, number>();
  const items = rows.map((r) => {
    const name = cellText(r.get('Nama'));
    const price = parseNumberCell(r.get('Harga per kg'), 'rupiah');
    const active = yes(r.get('Aktif'));
    if (name.length < 2 || name.length > 80) errors.push({ line: r.line, message: 'Nama wajib diisi (2–80 karakter).' });
    if (!price || price.lte(0) || price.decimalPlaces() > 2) errors.push({ line: r.line, message: 'Harga per kg harus angka lebih dari 0 (maks. 2 desimal).' });
    if (active === null) errors.push({ line: r.line, message: 'Kolom Aktif harus Ya atau Tidak.' });
    const key = name.toLowerCase();
    if (seen.has(key)) errors.push({ line: r.line, message: `Nama "${name}" muncul dua kali (juga di baris ${seen.get(key)}).` });
    seen.set(key, r.line);
    return { name, pricePerKg: price ?? new Prisma.Decimal(0), isActive: active ?? true };
  });
  if (errors.length) return { ok: false, errors };

  const existing = new Map((await prisma.wasteType.findMany({ select: { id: true, name: true } })).map((w) => [w.name.toLowerCase(), w.id]));
  let created = 0;
  let updated = 0;
  await prisma.$transaction(async (tx) => {
    for (const i of items) {
      const id = existing.get(i.name.toLowerCase());
      if (id) {
        await tx.wasteType.update({ where: { id }, data: i });
        updated++;
      } else {
        await tx.wasteType.create({ data: i });
        created++;
      }
    }
  }, TX_OPTIONS);
  return { ok: true, message: `${created} jenis sampah baru ditambahkan, ${updated} diperbarui.` };
}

async function importUsers(rows: RawRow[], ctx: Ctx): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const seenUser = new Map<string, number>();
  const seenAccount = new Map<string, number>();
  const parsedRows = rows.map((r) => {
    const username = cellText(r.get('Username')).toLowerCase();
    const password = cellText(r.get('Password'));
    const roleText = cellText(r.get('Role')).toLowerCase();
    const accountNumber = cellText(r.get('No. Rekening')).toUpperCase();
    const role: 'ADMIN' | 'USER' | null = ['admin', 'petugas', 'admin / petugas'].includes(roleText)
      ? 'ADMIN'
      : ['', 'nasabah', 'user'].includes(roleText)
        ? 'USER'
        : null;
    if (!USERNAME_RE.test(username)) errors.push({ line: r.line, message: 'Username 3–30 karakter: huruf kecil, angka, titik, strip, atau underscore.' });
    if (password && password.length < 8) errors.push({ line: r.line, message: 'Password minimal 8 karakter.' });
    if (!role) errors.push({ line: r.line, message: 'Role harus Nasabah atau Admin.' });
    if (role === 'USER' && !accountNumber) errors.push({ line: r.line, message: 'Akun nasabah wajib diisi No. Rekening.' });
    if (seenUser.has(username)) errors.push({ line: r.line, message: `Username ${username} muncul dua kali (juga di baris ${seenUser.get(username)}).` });
    seenUser.set(username, r.line);
    if (role === 'USER' && accountNumber) {
      if (seenAccount.has(accountNumber)) errors.push({ line: r.line, message: `No. rekening ${accountNumber} dipakai dua akun (juga di baris ${seenAccount.get(accountNumber)}).` });
      seenAccount.set(accountNumber, r.line);
    }
    return { line: r.line, username, password, role: role ?? 'USER', accountNumber };
  });
  if (errors.length) return { ok: false, errors };

  const [existingUsers, customers] = await Promise.all([
    prisma.user.findMany({ select: { id: true, username: true, customerId: true } }),
    prisma.customer.findMany({ where: { accountNumber: { in: [...seenAccount.keys()] } }, select: { id: true, accountNumber: true } }),
  ]);
  const userByName = new Map(existingUsers.map((u) => [u.username, u]));
  const customerByAccount = new Map(customers.map((c) => [c.accountNumber, c.id]));
  const ownerOfCustomer = new Map(existingUsers.filter((u) => u.customerId).map((u) => [u.customerId!, u.username]));

  for (const r of parsedRows) {
    const existing = userByName.get(r.username);
    const customerId = r.role === 'USER' ? customerByAccount.get(r.accountNumber) : null;
    if (r.role === 'USER' && !customerId) errors.push({ line: r.line, message: `No. rekening ${r.accountNumber} tidak ditemukan.` });
    if (customerId) {
      const owner = ownerOfCustomer.get(customerId);
      if (owner && owner !== r.username) errors.push({ line: r.line, message: `Nasabah ${r.accountNumber} sudah punya akun (${owner}).` });
    }
    if (!existing && !r.password) errors.push({ line: r.line, message: 'Password wajib untuk akun baru.' });
    if (existing?.id === ctx.userId && r.role !== 'ADMIN') errors.push({ line: r.line, message: 'Anda tidak dapat mengubah role akun Anda sendiri.' });
  }
  if (errors.length) return { ok: false, errors };

  // Hash di luar transaksi database (proses CPU)
  const hashes = new Map<string, string>();
  for (const r of parsedRows) if (r.password) hashes.set(r.username, await hashPassword(r.password, 10));

  let created = 0;
  let updated = 0;
  await prisma.$transaction(async (tx) => {
    for (const r of parsedRows) {
      const customerId = r.role === 'USER' ? customerByAccount.get(r.accountNumber)! : null;
      const passwordHash = hashes.get(r.username);
      const existing = userByName.get(r.username);
      if (existing) {
        await tx.user.update({ where: { id: existing.id }, data: { role: r.role, customerId, ...(passwordHash ? { passwordHash } : {}) } });
        // Password diganti: paksa login ulang (kecuali akun yang sedang melakukan impor)
        if (passwordHash && existing.id !== ctx.userId) await tx.session.deleteMany({ where: { userId: existing.id } });
        updated++;
      } else {
        await tx.user.create({ data: { username: r.username, passwordHash: passwordHash!, role: r.role, customerId } });
        created++;
      }
    }
  }, TX_OPTIONS);
  return { ok: true, message: `${created} akun baru dibuat, ${updated} diperbarui.` };
}

type TxLine = {
  line: number;
  ref: string;
  date: Date;
  accountNumber: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  wasteTypeId: number | null;
  weightKg: Prisma.Decimal | null;
  pricePerKg: Prisma.Decimal | null;
  amount: Prisma.Decimal | null;
  note: string;
  processedBy: string;
};

async function importTransactions(rows: RawRow[], ctx: Ctx): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const offset = getTimezone(ctx.config.timezone).offsetHours;
  const wasteTypes = await prisma.wasteType.findMany();
  const wasteByName = new Map(wasteTypes.map((w) => [w.name.toLowerCase(), w]));
  const latestAllowed = Date.now() + 86_400_000;

  const lines: TxLine[] = rows.map((r) => {
    const ref = cellText(r.get('No. Bukti'));
    const date = parseDateCell(r.get('Tanggal'), offset);
    const accountNumber = cellText(r.get('No. Rekening')).toUpperCase();
    const typeText = cellText(r.get('Tipe')).toUpperCase();
    const type = ['SETOR', 'DEPOSIT', 'S'].includes(typeText) ? 'DEPOSIT' : ['TARIK', 'WITHDRAWAL', 'T'].includes(typeText) ? 'WITHDRAWAL' : null;
    const wasteName = cellText(r.get('Jenis Sampah'));
    const waste = wasteName ? wasteByName.get(wasteName.toLowerCase()) : undefined;
    const weightKg = parseNumberCell(r.get('Berat (kg)'), 'decimal');
    const priceCell = parseNumberCell(r.get('Harga per kg'), 'rupiah');
    const amount = parseNumberCell(r.get('Jumlah (Rp)'), 'rupiah');
    const note = cellText(r.get('Catatan')).slice(0, 255);
    const processedBy = (cellText(r.get('Petugas')) || `${ctx.username} (impor)`).slice(0, 60);

    if (!date) errors.push({ line: r.line, message: 'Tanggal tidak valid (gunakan 31/12/2025 atau format tanggal Excel).' });
    else if (date.getTime() > latestAllowed) errors.push({ line: r.line, message: 'Tanggal tidak boleh di masa depan.' });
    if (!accountNumber) errors.push({ line: r.line, message: 'No. rekening wajib diisi.' });
    if (!type) errors.push({ line: r.line, message: 'Tipe harus SETOR atau TARIK.' });
    if (wasteName && !waste) errors.push({ line: r.line, message: `Jenis sampah "${wasteName}" tidak terdaftar.` });
    if (type === 'WITHDRAWAL' && wasteName) errors.push({ line: r.line, message: 'Transaksi TARIK tidak boleh berisi Jenis Sampah.' });
    if (wasteName) {
      if (!weightKg || weightKg.lte(0) || weightKg.decimalPlaces() > 3) errors.push({ line: r.line, message: 'Berat (kg) wajib diisi, lebih dari 0, maks. 3 desimal.' });
      if (priceCell && (priceCell.lte(0) || priceCell.decimalPlaces() > 2)) errors.push({ line: r.line, message: 'Harga per kg harus lebih dari 0 (maks. 2 desimal).' });
    } else if (!amount || amount.lte(0) || amount.decimalPlaces() > 2) {
      errors.push({ line: r.line, message: 'Jumlah (Rp) wajib diisi dan lebih dari 0 (untuk TARIK atau SETOR tanpa Jenis Sampah).' });
    }
    return {
      line: r.line,
      ref,
      date: date ?? new Date(0),
      accountNumber,
      type: type ?? 'DEPOSIT',
      wasteTypeId: waste?.id ?? null,
      weightKg: wasteName ? weightKg : null,
      pricePerKg: waste ? (priceCell ?? waste.pricePerKg) : null,
      amount: wasteName ? null : amount,
      note,
      processedBy,
    };
  });
  if (errors.length) return { ok: false, errors };

  // Kelompokkan: baris dengan No. Bukti sama = satu transaksi
  const groups: TxLine[][] = [];
  const byRef = new Map<string, TxLine[]>();
  for (const l of lines) {
    if (!l.ref) {
      groups.push([l]);
      continue;
    }
    const g = byRef.get(l.ref);
    if (g) g.push(l);
    else {
      const ng = [l];
      byRef.set(l.ref, ng);
      groups.push(ng);
    }
  }
  for (const g of groups) {
    if (g.length < 2) continue;
    const [first] = g;
    for (const l of g.slice(1)) {
      if (l.accountNumber !== first!.accountNumber || l.type !== first!.type || l.date.getTime() !== first!.date.getTime())
        errors.push({ line: l.line, message: `Baris dengan No. Bukti "${l.ref}" harus punya tanggal, no. rekening, dan tipe yang sama (lihat baris ${first!.line}).` });
    }
    if (g.some((l) => !l.wasteTypeId)) errors.push({ line: first!.line, message: `No. Bukti "${first!.ref}" dipakai beberapa baris, jadi setiap baris harus berisi Jenis Sampah & Berat.` });
  }
  if (errors.length) return { ok: false, errors };

  const accountNumbers = [...new Set(lines.map((l) => l.accountNumber))];
  const customers = await prisma.customer.findMany({ where: { accountNumber: { in: accountNumbers } }, select: { id: true, accountNumber: true } });
  const customerByAccount = new Map(customers.map((c) => [c.accountNumber, c.id]));
  for (const l of lines) if (!customerByAccount.has(l.accountNumber)) errors.push({ line: l.line, message: `No. rekening ${l.accountNumber} tidak ditemukan.` });
  if (errors.length) return { ok: false, errors };

  groups.sort((a, b) => a[0]!.date.getTime() - b[0]!.date.getTime() || a[0]!.line - b[0]!.line);
  const customerIds = [...customerByAccount.values()];

  const result = await prisma.$transaction(async (tx) => {
    // Kunci baris nasabah agar saldo tidak berubah oleh transaksi lain selama impor
    await tx.$queryRaw`SELECT id FROM "Customer" WHERE id IN (${Prisma.join(customerIds)}) FOR UPDATE`;
    const [balances, latest] = await Promise.all([
      tx.customer.findMany({ where: { id: { in: customerIds } }, select: { id: true, balance: true } }),
      tx.transaction.groupBy({ by: ['customerId'], where: { customerId: { in: customerIds } }, _max: { createdAt: true } }),
    ]);
    const balance = new Map(balances.map((b) => [b.id, b.balance]));
    const latestDate = new Map(latest.map((l) => [l.customerId, l._max.createdAt]));
    const txErrors: ImportError[] = [];

    const plans = groups.map((g) => {
      const first = g[0]!;
      const customerId = customerByAccount.get(first.accountNumber)!;
      const items = g
        .filter((l) => l.wasteTypeId)
        .map((l) => ({
          wasteTypeId: l.wasteTypeId!,
          weightKg: l.weightKg!,
          pricePerKg: l.pricePerKg!,
          subtotal: l.weightKg!.mul(l.pricePerKg!).toDecimalPlaces(2),
        }));
      const amount = items.length ? items.reduce((s, i) => s.add(i.subtotal), new Prisma.Decimal(0)) : first.amount!;
      const last = latestDate.get(customerId);
      if (last && first.date < last)
        txErrors.push({ line: first.line, message: `Tanggal lebih awal dari transaksi terakhir nasabah ${first.accountNumber} di aplikasi. Impor hanya untuk riwayat setelah transaksi terakhir.` });
      const current = balance.get(customerId)!;
      const next = first.type === 'DEPOSIT' ? current.add(amount) : current.sub(amount);
      if (next.lt(0)) txErrors.push({ line: first.line, message: `Saldo ${first.accountNumber} tidak cukup untuk penarikan ini (saldo saat itu ${current.toFixed(0)}).` });
      balance.set(customerId, next);
      return { customerId, first, items, amount, balanceAfter: next };
    });
    if (txErrors.length) return { errors: txErrors };

    for (const p of plans) {
      await tx.transaction.create({
        data: {
          customerId: p.customerId,
          type: p.first.type,
          amount: p.amount,
          balanceAfter: p.balanceAfter,
          note: p.first.note || null,
          processedBy: p.first.processedBy,
          createdAt: p.first.date,
          ...(p.items.length ? { items: { create: p.items } } : {}),
        },
      });
    }
    for (const [id, value] of balance) await tx.customer.update({ where: { id }, data: { balance: value } });
    return { count: plans.length };
  }, TX_OPTIONS);

  if ('errors' in result) return { ok: false, errors: result.errors! };
  return { ok: true, message: `${result.count} transaksi diimpor untuk ${customerIds.length} nasabah. Saldo sudah diperbarui.` };
}

// ---------------------------------------------------------------------------------------------
// Ekspor
// ---------------------------------------------------------------------------------------------

const num = (v: Prisma.Decimal | null | undefined): Cell => (v == null ? null : { value: Number(v), type: Number });

export async function exportRows(entity: Entity, config: AppConfigData, range?: { from?: Date; to?: Date }): Promise<{ columns: Column[]; rows: Cell[][] }> {
  const offset = getTimezone(config.timezone).offsetHours;
  /** Tanggal sebagai "jam dinding" lokal untuk Excel */
  const localDate = (d: Date): Cell => ({ value: new Date(d.getTime() + offset * 3600_000), type: Date, format: 'dd/mm/yyyy hh:mm' });

  switch (entity) {
    case 'customers': {
      const columns: Column[] = [
        ...COLUMNS.customers,
        { header: 'Saldo', width: 16, note: 'Hanya informasi, diabaikan saat impor.' },
        { header: 'Terdaftar', width: 18, note: 'Hanya informasi.' },
      ];
      const data = await prisma.customer.findMany({ orderBy: { accountNumber: 'asc' } });
      return { columns, rows: data.map((c) => [c.accountNumber, c.name, c.address, c.phone ? { value: c.phone, type: String } : null, num(c.balance), localDate(c.createdAt)]) };
    }
    case 'waste-types': {
      const data = await prisma.wasteType.findMany({ orderBy: { name: 'asc' } });
      return { columns: COLUMNS['waste-types'], rows: data.map((w) => [w.name, num(w.pricePerKg), w.isActive ? 'Ya' : 'Tidak']) };
    }
    case 'users': {
      const data = await prisma.user.findMany({ orderBy: [{ role: 'asc' }, { username: 'asc' }], include: { customer: true } });
      return { columns: COLUMNS.users, rows: data.map((u) => [u.username, null, u.role === 'ADMIN' ? 'Admin' : 'Nasabah', u.customer?.accountNumber ?? null]) };
    }
    case 'transactions': {
      const data = await prisma.transaction.findMany({
        where: { createdAt: { ...(range?.from ? { gte: range.from } : {}), ...(range?.to ? { lt: range.to } : {}) } },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        include: { customer: true, items: { include: { wasteType: true } } },
      });
      const rows: Cell[][] = [];
      for (const t of data) {
        const base = (extra: Cell[]) => [
          String(t.id).padStart(6, '0'),
          localDate(t.createdAt),
          t.customer.accountNumber,
          t.customer.name,
          t.type === 'DEPOSIT' ? 'SETOR' : 'TARIK',
          ...extra,
          // Transaksi yang dibatalkan tetap diekspor (bersama koreksinya) agar saldo tetap cocok saat diimpor
          t.voidedAt ? `DIBATALKAN: ${t.voidReason ?? ''}${t.note ? ` | ${t.note}` : ''}` : t.note,
          t.processedBy,
        ];
        if (t.items.length) {
          t.items.forEach((i, n) =>
            rows.push(base([i.wasteType.name, num(i.weightKg), num(i.pricePerKg), num(i.subtotal), n === t.items.length - 1 ? num(t.balanceAfter) : null])),
          );
        } else {
          rows.push(base([null, null, null, num(t.amount), num(t.balanceAfter)]));
        }
      }
      return { columns: COLUMNS.transactions, rows };
    }
  }
}
