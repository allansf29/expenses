import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowDown, TrendingUp, BarChart } from "lucide-react"; 
import type { ChartData } from "../../lib/types";
import CustomTooltip from "./CustomTooltip";

interface MonthlyAreaChartProps {
    data: ChartData[];
}

const MonthlyAreaChart: React.FC<MonthlyAreaChartProps> = ({ data }) => {
    
    if (data.length < 2) {
        return (
            <div className="text-muted-foreground p-8 text-center bg-card rounded-xl border border-border flex items-center justify-center h-[250px]">
                <BarChart className="w-5 h-5 mr-2" />
                Mínimo de 2 meses de dados para o Gráfico de Área.
            </div>
        );
    }

    // Lógica de cálculo de tendência (growth) mantida intacta
    const recentData = data.slice(-6);
    const lastMonth = recentData[recentData.length - 1];
    const prevMonth = recentData[recentData.length - 2] || { income: 0, expense: 0 };

    let incomeGrowthText: string;
    let trendIcon: React.ReactElement;
    const currentIncome = lastMonth.income;
    const previousIncome = prevMonth.income;

    if (previousIncome === 0) {
        if (currentIncome > 0) {
            incomeGrowthText = "Novo";
            trendIcon = <TrendingUp className="h-4 w-4 text-green-500" />;
        } else {
            incomeGrowthText = "0.0%";
            trendIcon = <span className="h-4 w-4 text-muted-foreground font-bold flex items-center justify-center">=</span>;
        }
    } else {
        const growth = (currentIncome - previousIncome) / previousIncome;
        const percentage = Math.abs(growth * 100).toFixed(1);
        incomeGrowthText = `${percentage}%`;
        if (growth > 0) trendIcon = <TrendingUp className="h-4 w-4 text-green-500" />;
        else if (growth < 0) trendIcon = <ArrowDown className="h-4 w-4 text-red-500" />;
        else trendIcon = <span className="h-4 w-4 text-muted-foreground font-bold flex items-center justify-center">=</span>;
    }

    const trendAction = currentIncome > previousIncome ? "subiu" : currentIncome < previousIncome ? "caiu" : "estagnada";
    
    const formatCurrencyForTooltip = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

    return (
        <div className="bg-card p-4 pt-6 rounded-xl shadow-lg border border-border">
            
            <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-primary" />
                Movimentação Mensal (Últimos {recentData.length} meses)
            </h3>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recentData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                        <XAxis dataKey="monthLabel" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCurrencyForTooltip} axisLine={false} tickLine={false} hide={true} />
                        <Tooltip content={<CustomTooltip formatCurrency={formatCurrencyForTooltip} />} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="expense" 
                            stackId="a" 
                            stroke="#DC2626"
                            fill="#B91C1C"
                            fillOpacity={0.7} 
                            name="Despesa" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="income" 
                            stackId="a" 
                            stroke="#10B981"
                            fill="#059669"
                            fillOpacity={0.7} 
                            name="Receita" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Métrica de Tendência */}
            <div className="flex w-full items-start gap-2 text-sm mt-4 pt-3 border-t border-border text-muted-foreground">
                <div className="flex items-center gap-2 leading-none font-medium text-foreground">
                    {trendIcon} Receita {trendAction} por <span className="font-bold ml-1">{incomeGrowthText}</span> no último mês.
                </div>
            </div>
        </div>
    );
};

export default MonthlyAreaChart;