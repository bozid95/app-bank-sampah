import type { APIRoute } from 'astro';
import { ENTITY_INFO, GUIDES, exportRows, isEntity } from '../../../lib/dataTransfer';
import { buildWorkbook, xlsxResponse } from '../../../lib/spreadsheet';
import { getTimezone } from '../../../lib/config';
import { toIsoDate } from '../../../lib/format';

export const GET: APIRoute = async ({ params, url, locals }) => {
  const entity = params.entity ?? '';
  if (!isEntity(entity)) return new Response('Tidak ditemukan', { status: 404 });

  const offset = getTimezone(locals.config.timezone).offsetHours;
  const parseDay = (v: string | null, addDays = 0) => {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
    const [y, m, d] = v.split('-').map(Number);
    return new Date(Date.UTC(y!, m! - 1, d! + addDays) - offset * 3600_000);
  };
  const from = parseDay(url.searchParams.get('from'));
  const to = parseDay(url.searchParams.get('to'), 1);

  const info = ENTITY_INFO[entity];
  const { columns, rows } = await exportRows(entity, locals.config, { from, to });
  const buffer = await buildWorkbook(columns, rows, `Ekspor ${info.label} — ${locals.config.appName}`, GUIDES[entity]);
  return xlsxResponse(buffer, `${info.file}-${toIsoDate(new Date())}.xlsx`);
};
