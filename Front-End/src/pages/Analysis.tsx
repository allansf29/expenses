import { useMemo } from "react";
import { startOfMonth, isSameMonth } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { useFinanceData } from "@/hooks/useFinanceData";
import PieChartExpenses from "@/components/charts/PieChartExpenses";
import { Zap, BarChart3, TrendingUp } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CHART_COLORS = {
  income: "hsl(142 80% 40%)",
  expense: "hsl(0 80% 50%)",
  balance: "hsl(210 50% 50%)",

  pieColors: [
    "hsl(221 83% 53%)",
    "hsl(21 95% 59%)",
    "hsl(150 70% 45%)",
    "hsl(270 65% 55%)",
    "hsl(330 65% 55%)",
    "hsl(200 10% 40%)",
  ],
};

type Expense = {
  id?: string | number;
  date: Date | string;
  amount: number;
  description: string;
  type: "income" | "expense";
  color?: string;
};

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === "income")?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === "expense")?.value || 0;
    const balance = income - expense;

    return (
      <div className="p-4 border border-border bg-card shadow-2xl rounded-xl text-sm">
        <p className="font-bold text-foreground mb-2 border-b border-border pb-1">
          {label}
        </p>

        {payload
          .filter((p: any) => p.dataKey !== "balance")
          .map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="font-medium">
              {p.name}:{" "}
              <span className="font-semibold">{formatCurrency(p.value)}</span>
            </p>
          ))}

        <p
          className={`font-bold mt-2 pt-1 border-t border-border ${
            balance >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          Saldo Líquido: {formatCurrency(balance)}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalisesPage() {
  // O tipo Expense é usado aqui para tipar expenses e remover o aviso TS6196
  const { expenses, chartData: originalChartData }: { expenses: Expense[], chartData: any } = useFinanceData();

  const normalizeDate = (d: Date | string) =>
    d instanceof Date ? d : new Date(d);

  const chartData = useMemo(() => {
    return originalChartData.map((data: any) => ({
      ...data,
      balance: data.income - data.expense,
    }));
  }, [originalChartData]);

  const currentMonthStart = startOfMonth(new Date());

  const categoriasGastos = useMemo(() => {
    const mapa = new Map<string, number>();

    expenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        const dt = normalizeDate(e.date);
        if (!isSameMonth(dt, currentMonthStart)) return;

        const raw = (e.description ?? "").toString();
        const nomeLimpo = raw
          .replace(/\s*\d+\/\d+\s*$/g, "")
          .trim()
          .toLowerCase();

        mapa.set(nomeLimpo, (mapa.get(nomeLimpo) || 0) + Number(e.amount || 0));
      });

    const formatado = Array.from(mapa.entries())
      .map(([nome, valor]) => ({
        nome: nome.charAt(0).toUpperCase() + nome.slice(1),
        valor,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);

    return formatado;
  }, [expenses, currentMonthStart]);

  const hasDataForChart = chartData.length > 0;
  const hasDataForPie = categoriasGastos.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 overflow-y-auto p-4 sm:p-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-primary" /> Análises Financeiras
          Rápidas
        </h1>
        <p className="text-muted-foreground mb-6 border-b border-border pb-4">
          Visualize a sua performance mensal e a distribuição dos seus gastos mais
          importantes.
        </p>

        {!hasDataForChart && !hasDataForPie && (
          <div className="p-10 bg-secondary/30 border border-border rounded-xl mt-12">
            <p className="text-muted-foreground text-center font-medium flex items-center justify-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Nenhuma despesa ou receita relevante encontrada para análise.
            </p>
          </div>
        )}

        {(hasDataForChart || hasDataForPie) && (
          <div className="space-y-8">
            {hasDataForChart && (
              <Card className="bg-card border border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center text-foreground">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary" />{" "}
                    Comparativo Mensal Detalhado
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[450px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="monthLabel"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tickLine={false}
                        axisLine={false}
                        tick={false}
                      />

                      <Tooltip content={<CustomTooltip />} />

                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value) => (
                          <span className="text-sm text-foreground">{value}</span>
                        )}
                      />

                      <Bar
                        dataKey="income"
                        fill={CHART_COLORS.income}
                        name="Receitas"
                        radius={[6, 6, 0, 0]}
                      />

                      <Bar
                        dataKey="expense"
                        fill={CHART_COLORS.expense}
                        name="Despesas"
                        radius={[6, 6, 0, 0]}
                      />

                      <Bar
                        dataKey="balance"
                        fill={CHART_COLORS.balance}
                        name="Saldo Líquido"
                        radius={[6, 6, 0, 0]}
                        opacity={0.7}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {hasDataForPie && (
              <Card className="bg-card border border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center text-foreground">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Top 6
                    Categorias (Mês Atual)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[420px] flex items-center justify-center p-4">
                  <PieChartExpenses
                    data={categoriasGastos}
                    colors={CHART_COLORS.pieColors}
                  />
                </CardContent>
              </Card>
            )}

            {!hasDataForPie && hasDataForChart && (
                 <div className='p-8 bg-secondary/30 border border-border rounded-xl'>
                    <p className="text-muted-foreground text-center font-medium">
                        Nenhuma despesa relevante encontrada para o mês atual para o Top 6 Categorias.
                    </p>
                 </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}