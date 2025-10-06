import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowDown, TrendingUp } from "lucide-react";
import type { ChartData } from "../../lib/types";
import CustomTooltip from "./CustomTooltip"; // Importar o Tooltip separado

interface MonthlyAreaChartProps {
  data: ChartData[];
}

const MonthlyAreaChart: React.FC<MonthlyAreaChartProps> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="text-gray-500 p-8 text-center bg-gray-800 rounded-xl mb-6">
        Mínimo de 2 meses de dados para o Gráfico de Área.
      </div>
    );
  }

  // ... toda a lógica de cálculo de tendência (growth) ...
  const recentData = data.slice(-6);
  const lastMonth = recentData[recentData.length - 1];
  const prevMonth = recentData[recentData.length - 2] || { income: 0, expense: 0 };

  let incomeGrowthText: string;
  let trendIcon: React.ReactElement;
  const currentIncome = lastMonth.income;
  const previousIncome = prevMonth.income;

  // ... lógica de if/else para definir incomeGrowthText e trendIcon ...

  if (previousIncome === 0) {
    if (currentIncome > 0) {
      incomeGrowthText = "Novo";
      trendIcon = <TrendingUp className="h-4 w-4 text-green-400" />;
    } else {
      incomeGrowthText = "0.0%";
      trendIcon = <span className="h-4 w-4 text-gray-400 font-bold flex items-center justify-center">=</span>;
    }
  } else {
    const growth = (currentIncome - previousIncome) / previousIncome;
    const percentage = Math.abs(growth * 100).toFixed(1);
    incomeGrowthText = `${percentage}%`;
    if (growth > 0) trendIcon = <TrendingUp className="h-4 w-4 text-green-400" />;
    else if (growth < 0) trendIcon = <ArrowDown className="h-4 w-4 text-red-400" />;
    else trendIcon = <span className="h-4 w-4 text-gray-400 font-bold flex items-center justify-center">=</span>;
  }

  const trendAction = currentIncome > previousIncome ? "subiu" : currentIncome < previousIncome ? "caiu" : "estagnada";
  
  const formatCurrencyForTooltip = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

  return (
    <div className="bg-gray-900 p-4 pt-6 rounded-xl shadow-lg border border-gray-800 mb-6">
      {/* ... Título e Gráfico ... */}
      <h3 className="text-xl font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">Movimentação Financeira Mensal (Últimos {recentData.length} meses)</h3>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recentData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="monthLabel" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrencyForTooltip} axisLine={false} tickLine={false} hide={true} />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrencyForTooltip} />} />
            <Area type="monotone" dataKey="expense" stackId="a" stroke="#DC2626" fill="#991B1B" fillOpacity={0.6} name="Despesa" />
            <Area type="monotone" dataKey="income" stackId="a" stroke="#10B981" fill="#065F46" fillOpacity={0.6} name="Receita" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex w-full items-start gap-2 text-sm mt-4 pt-3 border-t border-gray-800 text-gray-400">
        <div className="flex items-center gap-2 leading-none font-medium text-white">
          {trendIcon} Receita {trendAction} por <span className="font-bold ml-1">{incomeGrowthText}</span> no último mês.
        </div>
      </div>
    </div>
  );
};

export default MonthlyAreaChart;