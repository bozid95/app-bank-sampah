export type MonthPeriod = {
  value: string;
  label: string;
  start: Date;
  end: Date;
};

export type MonthOption = {
  value: string;
  label: string;
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function parseMonthParam(
  raw: string | null | undefined,
  offsetHours: number,
): MonthPeriod | null {
  if (!raw || !/^\d{4}-\d{2}$/.test(raw)) return null;
  const [yStr, mStr] = raw.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  if (year < 2000 || year > 2100 || month < 1 || month > 12) return null;
  const start = new Date(Date.UTC(year, month - 1, 1) - offsetHours * 3600_000);
  const end = new Date(Date.UTC(year, month, 1) - offsetHours * 3600_000);
  return {
    value: `${year}-${String(month).padStart(2, "0")}`,
    label: `${MONTH_NAMES[month - 1]} ${year}`,
    start,
    end,
  };
}

export function recentMonthOptions(
  offsetHours: number,
  count = 18,
  now = new Date(),
): MonthOption[] {
  const local = new Date(now.getTime() + offsetHours * 3600_000);
  let year = local.getUTCFullYear();
  let month = local.getUTCMonth() + 1;
  const options: MonthOption[] = [];
  for (let i = 0; i < count; i++) {
    options.push({
      value: `${year}-${String(month).padStart(2, "0")}`,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
    });
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
  }
  return options;
}
