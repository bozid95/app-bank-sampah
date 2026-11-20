import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export type DailyPoint = { label: string; deposit: number; withdrawal: number };

const chartConfig = {
  deposit: { label: 'Setoran', color: 'var(--chart-1)' },
  withdrawal: { label: 'Penarikan', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

export default function DepositChart({ data, days }: { data: DailyPoint[]; days: number }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Arus kas harian</CardTitle>
        <CardDescription>Setoran dan penarikan {days} hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart data={data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => compact.format(v)} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label ?? name}</span>
                  <span className="font-mono font-medium tabular-nums">{rupiah.format(Number(value))}</span>
                </div>
              )} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="deposit" fill="var(--color-deposit)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="withdrawal" fill="var(--color-withdrawal)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
