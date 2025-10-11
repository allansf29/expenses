import React from "react";
import { DollarSign, ArrowDown, ArrowUp, Zap } from "lucide-react";
import type { MonthlySummary } from "../lib/types";
// Importação mantida conforme seu código original
import Sidebar from "../components/Sidebar"; 

interface TotalSummaryProps {
    summary: MonthlySummary;
}

const formatCurrency = (amount: number) => `R$${amount.toFixed(2).replace(".", ",")}`;

// MOCK para Sidebar (apenas para garantir que o código compile)
const MockSidebar = () => <div style={{ display: 'none' }}>Sidebar Placeholder</div>;

// Componente Sidebar a ser usado (escolhe entre o importado ou o mock, se o import falhar)
const SidebarComponent = Sidebar || MockSidebar;

const TotalSummary: React.FC<TotalSummaryProps> = ({ summary }) => {
    const { totalIncome, totalExpense, balance, monthName } = summary;
    
    const displayMonthName = monthName ? monthName.charAt(0).toUpperCase() + monthName.slice(1) : "o Mês";

    const balanceStatusColor = balance >= 0 ? "text-green-500" : "text-red-500";
    const balanceBgColor = balance >= 0 ? "bg-green-500/10" : "bg-red-500/10";

    return (
        <div className="w-full">
            <SidebarComponent />           
            <h2 className="text-xl font-bold mb-4 border-b border-border pb-2 text-foreground flex items-center">
                <Zap className="w-5 h-5 mr-2 text-primary" />
                Resumo de {displayMonthName}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* CARD DE RECEITAS */}
                <div className="flex flex-col p-4 bg-card rounded-xl shadow-lg border border-border transition-transform hover:shadow-primary/20 hover:scale-[1.02] duration-300">
                    <div className="text-sm text-muted-foreground font-medium flex items-center mb-1">
                        <ArrowUp className="w-4 h-4 mr-2 text-green-500" /> 
                        Receitas
                    </div>
                    <span className="text-3xl font-extrabold text-green-500 mt-1">
                        {formatCurrency(totalIncome)}
                    </span>
                </div>

                {/* CARD DE DESPESAS */}
                <div className="flex flex-col p-4 bg-card rounded-xl shadow-lg border border-border transition-transform hover:shadow-red-500/20 hover:scale-[1.02] duration-300">
                    <div className="text-sm text-muted-foreground font-medium flex items-center mb-1">
                        <ArrowDown className="w-4 h-4 mr-2 text-red-500" /> 
                        Despesas
                    </div>
                    <span className="text-3xl font-extrabold text-red-500 mt-1">
                        {formatCurrency(totalExpense)}
                    </span>
                </div>

                {/* CARD DE SALDO FINAL */}
                <div
                    className={`flex flex-col p-4 rounded-xl shadow-xl transition-transform duration-300 hover:scale-[1.02] 
                        ${balanceBgColor} border ${balance >= 0 ? "border-green-500/50" : "border-red-500/50"}`}
                >
                    <div className="text-sm font-medium flex items-center mb-1 text-foreground">
                        <DollarSign className="w-4 h-4 mr-2 text-primary" /> 
                        SALDO FINAL
                    </div>
                    <span className={`text-3xl font-extrabold mt-1 ${balanceStatusColor}`}>
                        {formatCurrency(balance)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TotalSummary;