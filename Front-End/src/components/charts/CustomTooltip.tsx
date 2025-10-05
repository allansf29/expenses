// src/components/charts/CustomTooltip.tsx
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any;
    label?: string;
    formatCurrency: (value: number) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, formatCurrency }) => {
    if (active && payload && payload.length) {
        const incomeItem = payload.find((p: any) => p.dataKey === "income");
        const expenseItem = payload.find((p: any) => p.dataKey === "expense");

        const totalIncome = incomeItem ? incomeItem.value : 0;
        const totalExpense = expenseItem ? expenseItem.value : 0;
        const balance = totalIncome - totalExpense;

        return (
            <div className="p-3 bg-gray-700 border border-gray-600 text-white rounded-lg shadow-xl text-sm">
                <p className="font-bold mb-2 text-base text-blue-300">{label}</p>
                <div className="flex justify-between items-center text-green-300">
                    <ArrowUp className="w-3 h-3 mr-2" /> Receita:
                    <span className="font-semibold ml-2">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center text-red-300">
                    <ArrowDown className="w-3 h-3 mr-2" /> Despesa:
                    <span className="font-semibold ml-2">{formatCurrency(totalExpense)}</span>
                </div>
                <div className={`font-bold mt-2 pt-2 border-t border-gray-600 ${balance >= 0 ? "text-blue-400" : "text-pink-400"}`}>
                    SALDO: {formatCurrency(balance)}
                </div>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;