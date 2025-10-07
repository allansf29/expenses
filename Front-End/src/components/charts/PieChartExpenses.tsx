import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ExpenseData = {
  nome: string;
  valor: number;
};

interface PieChartExpensesProps {
  data: ExpenseData[];
  colors: string[];
}

const PieChartExpenses: React.FC<PieChartExpensesProps> = ({ data, colors }) => {
  // Função para exibir nome + porcentagem
  const renderCustomLabel = (entry: any) => {
    const total = data.reduce((acc, cur) => acc + cur.valor, 0);
    const percent = ((entry.valor / total) * 100).toFixed(1);
    return `${entry.nome} (${percent}%)`;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valor"
          nameKey="nome"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartExpenses;
