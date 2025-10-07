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
import { useMemo } from "react"
import PieChartExpenses from "@/components/charts/PieChartExpenses"

const COLORS = ["#FF4C4C", "#FF9900", "#4C9AFF", "#00C49F", "#9C27B0", "#FFEB3B"]

export default function AnalisesPage() {
  const { expenses, chartData } = useFinanceData()

  // --- Agrupar gastos por categoria (descrição) ---
  const categoriasGastos = useMemo(() => {
    const mapa = new Map<string, number>()
    expenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        mapa.set(e.description, (mapa.get(e.description) || 0) + e.amount)
      })

    return Array.from(mapa.entries()).map(([nome, valor]) => ({ nome, valor }))
  }, [expenses])

  // --- Mostrar mensagem se não há dados ---
  if (expenses.length === 0) {
    return (
      <div className="p-6 lg:ml-64 sm:p-8">
        <Sidebar />
        <h1 className="text-2xl font-bold mb-2">Análises Financeiras</h1>
        <p className="text-muted-foreground mb-4">
          Nenhum dado encontrado. Adicione lançamentos para visualizar os gráficos.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 lg:ml-64 overflow-y-auto sm:p-8">
      <Sidebar />
      <h1 className="text-2xl font-bold">Análises Financeiras</h1>
      <p className="text-muted-foreground">
        Veja comparações reais de receitas, despesas e categorias de gastos.
      </p>

      {/* === Gráfico de Barras: Receitas x Despesas === */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas x Despesas (últimos meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="monthLabel" />
              <YAxis />
              <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" name="Receitas" />
              <Bar dataKey="expense" fill="#F44336" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* === Gráfico de Pizza: Gastos por Categoria === */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          {categoriasGastos.length > 0 ? (
            <PieChartExpenses data={categoriasGastos} colors={COLORS} />
          ) : (
            <p className="text-muted-foreground text-center mt-20">
              Nenhuma despesa registrada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
