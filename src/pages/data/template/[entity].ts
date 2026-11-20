import type { APIRoute } from 'astro';
import { COLUMNS, ENTITY_INFO, GUIDES, isEntity } from '../../../lib/dataTransfer';
import { buildWorkbook, xlsxResponse } from '../../../lib/spreadsheet';

export const GET: APIRoute = async ({ params, locals }) => {
  const entity = params.entity ?? '';
  if (!isEntity(entity)) return new Response('Tidak ditemukan', { status: 404 });
  const info = ENTITY_INFO[entity];
  const buffer = await buildWorkbook(COLUMNS[entity], [], `Template impor ${info.label} — ${locals.config.appName}`, GUIDES[entity]);
  return xlsxResponse(buffer, `template-${info.file}.xlsx`);
};
