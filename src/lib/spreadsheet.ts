import readXlsxFile, { readSheet } from "read-excel-file/node";
import writeXlsxFile, {
  type Cell,
  type SheetData,
} from "write-excel-file/node";

export type Column = {
  header: string;
  width?: number;
  required?: boolean;
  note: string;
  example?: string | number;
};

const HEADER_STYLE = {
  fontWeight: "bold",
  backgroundColor: "#E6F4EC",
  borderColor: "#B6DCC4",
  borderStyle: "thin",
} as const;

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function safeCell(cell: Cell): Cell {
  if (typeof cell === "string")
    return FORMULA_PREFIX.test(cell) ? `'${cell}` : cell;
  if (
    cell &&
    typeof cell === "object" &&
    "value" in cell &&
    typeof cell.value === "string" &&
    FORMULA_PREFIX.test(cell.value)
  ) {
    return { ...cell, value: `'${cell.value}` };
  }
  return cell;
}

export async function buildWorkbook(
  columns: Column[],
  rows: Cell[][],
  guideTitle: string,
  extraGuide: string[] = [],
): Promise<Buffer> {
  const safeRows = rows.map((row) => row.map(safeCell));
  const data: SheetData = [
    columns.map((c) => ({ value: c.header, ...HEADER_STYLE })),
    ...safeRows,
  ];

  const guide: SheetData = [
    [{ value: guideTitle, fontWeight: "bold", fontSize: 14 }],
    [""],
    ...extraGuide.map((line) => [line] as Cell[]),
    ...(extraGuide.length ? [[""] as Cell[]] : []),
    [
      { value: "Kolom", ...HEADER_STYLE },
      { value: "Wajib?", ...HEADER_STYLE },
      { value: "Keterangan", ...HEADER_STYLE },
      { value: "Contoh", ...HEADER_STYLE },
    ],
    ...columns.map(
      (c) =>
        [
          c.header,
          c.required ? "Wajib" : "Opsional",
          { value: c.note, wrap: true },
          c.example ?? "",
        ] as Cell[],
    ),
  ];

  return writeXlsxFile([
    {
      sheet: "Data",
      data,
      columns: columns.map((c) => ({ width: c.width ?? 18 })),
      stickyRowsCount: 1,
    },
    {
      sheet: "Petunjuk",
      data: guide,
      columns: [{ width: 22 }, { width: 10 }, { width: 70 }, { width: 24 }],
    },
  ]).toBuffer();
}

export function xlsxResponse(buffer: Buffer, filename: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export type RawRow = { line: number; get: (header: string) => unknown };

export async function readRows(
  file: Blob,
  expectedHeaders: string[],
): Promise<{ rows: RawRow[]; missing: string[] }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sheets = await readXlsxFile(buffer);
  const sheetData =
    sheets.find((s) => s.sheet.toLowerCase() === "data")?.data ??
    sheets[0]?.data ??
    (await readSheet(buffer));
  const [headerRow = [], ...body] = sheetData;

  const norm = (v: unknown) =>
    String(v ?? "")
      .trim()
      .toLowerCase();
  const index = new Map(headerRow.map((h, i) => [norm(h), i]));
  const missing = expectedHeaders.filter((h) => !index.has(norm(h)));

  const rows: RawRow[] = [];
  body.forEach((cells, i) => {
    if (cells.every((c) => c === null || String(c).trim() === "")) return;
    rows.push({
      line: i + 2,
      get: (header) => {
        const idx = index.get(norm(header));
        return idx === undefined ? null : cells[idx];
      },
    });
  });
  return { rows, missing };
}

export const cellText = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v).trim();
};
