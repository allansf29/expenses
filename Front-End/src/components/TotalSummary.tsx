import React from "react";
import { DollarSign, ArrowDown, ArrowUp } from "lucide-react";
import type { MonthlySummary } from "../lib/types";
import Sidebar from "../components/Sidebar"; // Mantendo seu import de Sidebar

interface TotalSummaryProps {
  summary: MonthlySummary;
}

const formatCurrency = (amount: number) => `R$${amount.toFixed(2).replace(".", ",")}`;

const TotalSummary: React.FC<TotalSummaryProps> = ({ summary }) => {
  const { totalIncome, totalExpense, balance, monthName } = summary;
  const displayMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl mb-6 text-white">
      <Sidebar />
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-gray-300">
        Resumo de {displayMonthName}
      </h2>
      
      {/* ... Sua marcação de div com flex e os 3 cards ... */}
      <div className="flex flex-wrap gap-4 justify-between">
         {/* Receitas Card */}
         <div className="flex flex-col items-start p-3 bg-gray-900 rounded-lg flex-1 min-w-[150px] transition-transform hover:scale-[1.02] duration-300">
           <div className="text-sm text-gray-400 font-medium flex items-center">
             <ArrowUp className="w-4 h-4 mr-1 text-green-400" /> Receitas
           </div>
           <span className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalIncome)}</span>
         </div>

         {/* Despesas Card */}
         <div className="flex flex-col items-start p-3 bg-gray-900 rounded-lg flex-1 min-w-[150px] transition-transform hover:scale-[1.02] duration-300">
           <div className="text-sm text-gray-400 font-medium flex items-center">
             <ArrowDown className="w-4 h-4 mr-1 text-red-400" /> Despesas
           </div>
           <span className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalExpense)}</span>
         </div>

         {/* Saldo Card */}
         <div
           className={`flex flex-col items-start p-3 rounded-lg flex-1 min-w-[150px] transition-transform hover:scale-[1.02] duration-300 ${
             balance >= 0 ? "bg-blue-700" : "bg-red-800"
           } border ${balance >= 0 ? "border-blue-600" : "border-red-700"}`}
         >
           <div className="text-sm font-medium flex items-center text-white">
             <DollarSign className="w-4 h-4 mr-1" /> SALDO FINAL
           </div>
           <span className="text-2xl font-bold text-white mt-1">{formatCurrency(balance)}</span>
         </div>
       </div>
    </div>
  );
};

export default TotalSummary;