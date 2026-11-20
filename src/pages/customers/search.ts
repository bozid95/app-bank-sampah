import type { APIRoute } from 'astro';
import { prisma } from '../../lib/prisma';
import { toCustomerOption } from '../../lib/customerOption';
import type { Prisma } from '../../generated/prisma/client';

const SEARCH_LIMIT = 20;

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
  const unlinked = url.searchParams.get('unlinked') === '1';

  const where: Prisma.CustomerWhereInput = {
    ...(unlinked ? { user: null } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { accountNumber: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { name: 'asc' },
    take: SEARCH_LIMIT + 1,
    select: { id: true, name: true, accountNumber: true, phone: true, balance: true },
  });

  return Response.json(
    { items: customers.slice(0, SEARCH_LIMIT).map(toCustomerOption), hasMore: customers.length > SEARCH_LIMIT },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
};
