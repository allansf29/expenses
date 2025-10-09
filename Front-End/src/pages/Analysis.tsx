import React, { useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import Sidebar from "@/components/Sidebar"
import { useFinanceData } from "@/hooks/useFinanceData"
import PieChartExpenses from "@/components/charts/PieChartExpenses"
import { Zap, BarChart3, TrendingUp } from 'lucide-react';

// Cores SÓLIDAS para o Gráfico de Barra
const CHART_COLORS = {
  income: "hsl(142 80% 40%)",     // Verde Profundo
  expense: "hsl(0 80% 50%)",      // Vermelho Vivo
  balance: "hsl(210 50% 50%)",    // Azul (para o Saldo Líquido)
  
  // Paleta de cores para categorias (Gráfico de Pizza/Doughnut)
  pieColors: [
    "hsl(221 83% 53%)", // Azul primário
    "hsl(21 95% 59%)",  // Laranja
    "hsl(150 70% 45%)", // Verde da natureza
    "hsl(270 65% 55%)", // Roxo
    "hsl(330 65% 55%)", // Rosa
    "hsl(200 10% 40%)"  // Cinza/Cian sutil
  ]
}

// =================================================================
// Funções Auxiliares
// =================================================================

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
};

// Custom Tooltip para o Gráfico de Barra
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    const balance = income - expense;

    return (
      <div className="p-4 border border-border bg-card shadow-2xl rounded-xl text-sm">
        <p className="font-bold text-foreground mb-2 border-b border-border pb-1">{label}</p>
        
        {/* Receita e Despesa */}
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: <span className="font-semibold">{formatCurrency(p.value)}</span>
          </p>
        ))}
        
        {/* Saldo Líquido Destacado */}
        <p className={`font-bold mt-2 pt-1 border-t border-border ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            Saldo Líquido: {formatCurrency(balance)}
        </p>
      </div>
    );
  }
  return null;
};

// =================================================================
// Componente Principal
// =================================================================

export default function AnalisesPage() {
  const { expenses, chartData: originalChartData } = useFinanceData()

  // Calcula o saldo líquido para cada mês e adiciona aos dados do gráfico
  const chartData = useMemo(() => {
    return originalChartData.map(data => ({
      ...data,
      balance: data.income - data.expense
    }));
  }, [originalChartData]);

  const categoriasGastos = useMemo(() => {
    const mapa = new Map<string, number>()
    expenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        mapa.set(e.description, (mapa.get(e.description) || 0) + e.amount)
      })

    return Array.from(mapa.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor);
  }, [expenses])
  
  const hasData = expenses.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 overflow-y-auto p-4 sm:p-8">
        
        <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center">
            <Zap className="w-6 h-6 mr-3 text-primary" /> Análises Financeiras Rápidas
        </h1>
        <p className="text-muted-foreground mb-6 border-b border-border pb-4">
          Visualize a sua performance mensal e a distribuição dos seus gastos mais importantes.
        </p>

        {!hasData && (
            <div className='p-10 bg-secondary/30 border border-border rounded-xl mt-12'>
                <p className="text-muted-foreground text-center font-medium flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Adicione seus dados financeiros para desbloquear esta análise.
                </p>
            </div>
        )}

        {hasData && (
            <div className="space-y-8">
                {/* GRÁFICO 1: RECEITAS vs DESPESAS vs SALDO LÍQUIDO (BARRAS MINIMALISTA) */}
                <Card className="bg-card border border-border shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center text-foreground">
                            <BarChart3 className="w-5 h-5 mr-2 text-primary" /> Comparativo Mensal Detalhado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[450px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                
                                {/* Eixo X (Meses) */}
                                <XAxis 
                                    dataKey="monthLabel" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={12}
                                    tickLine={false} 
                                    axisLine={false} 
                                />

                                {/* Eixo Y (Valores) - Completamente oculto, apenas a escala funciona */}
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={false} // Remove os rótulos de valor
                                />

                                <Tooltip content={<CustomTooltip />} />
                                
                                <Legend 
                                    wrapperStyle={{ paddingTop: "20px" }}
                                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                                />

                                {/* Barra de Receitas */}
                                <Bar 
                                    dataKey="income" 
                                    fill={CHART_COLORS.income} 
                                    name="Receitas"
                                    radius={[6, 6, 0, 0]} 
                                />
                                
                                {/* Barra de Despesas */}
                                <Bar 
                                    dataKey="expense" 
                                    fill={CHART_COLORS.expense} 
                                    name="Despesas"
                                    radius={[6, 6, 0, 0]}
                                />
                                
                                {/* Barra de Saldo Líquido (para resumo) */}
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

                {/* GRÁFICO 2: GASTOS POR CATEGORIA (PIZZA) */}
                <Card className="bg-card border border-border shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center text-foreground">
                            <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Top 6 Categorias de Despesas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center p-4">
                        {categoriasGastos.length > 0 ? (
                            <PieChartExpenses data={categoriasGastos} colors={CHART_COLORS.pieColors} />
                        ) : (
                            <p className="text-muted-foreground text-center">
                                Não há despesas registradas para análise de categorias.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
      </main>
    </div>
  )
}