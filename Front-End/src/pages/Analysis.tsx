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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import Sidebar from "@/components/Sidebar"

// Dados mockados de receitas e despesas mensais
const dataMensal = [
  { mes: "Jun", receitas: 4000, despesas: 2000 },
  { mes: "Jul", receitas: 3500, despesas: 1800 },
  { mes: "Ago", receitas: 5000, despesas: 2500 },
  { mes: "Set", receitas: 6000, despesas: 2200 },
  { mes: "Out", receitas: 5500, despesas: 2000 },
]

// Dados mockados de categorias de gastos
const categoriasGastos = [
  { nome: "Aluguel", valor: 1500 },
  { nome: "Mercado", valor: 800 },
  { nome: "Lazer", valor: 500 },
  { nome: "Transporte", valor: 300 },
]

const COLORS = ["#FF4C4C", "#FF9900", "#4C9AFF", "#00C49F"]

export default function AnalisesPage() {
  return (
    <div className="p-6 space-y-6 lg:ml-64 overflow-y-auto sm:p-8">
      <Sidebar />
      <h1 className="text-2xl font-bold">Análises Financeiras</h1>
      <p className="text-muted-foreground">
        Veja comparações de receitas, despesas e categorias de gastos.
      </p>

      {/* Gráfico de Barras Receitas x Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas x Despesas (Últimos 5 meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataMensal}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="receitas" fill="#4CAF50" name="Receitas" />
              <Bar dataKey="despesas" fill="#F44336" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoriasGastos}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoriasGastos.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
