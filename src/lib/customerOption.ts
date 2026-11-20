import { formatRupiah, initials } from './format';
import type { Prisma } from '../generated/prisma/client';
import type { CustomerOption } from '../components/app/CustomerPicker';

export function toCustomerOption(c: {
  id: number;
  name: string;
  accountNumber: string;
  phone?: string | null;
  balance: Prisma.Decimal;
}): CustomerOption {
  return {
    id: c.id,
    name: c.name,
    initials: initials(c.name),
    accountNumber: c.accountNumber,
    phone: c.phone ?? null,
    balance: c.balance.toString(),
    balanceLabel: formatRupiah(c.balance),
  };
}
