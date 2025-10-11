import React, { useMemo } from "react";
import { Calendar as CalendarIcon, Download, ChevronLeft, ChevronRight, BarChart, DollarSign } from "lucide-react";
import SimpleButton from "../ui/SimpleButton.tsx";
import TotalSummary from "../TotalSummary.tsx";
import MonthlyAreaChart from "../charts/MonthlyAreaChart.tsx";
import CalendarView from "./CalendarView.tsx";
import { useFinanceData } from "../../hooks/useFinanceData.tsx";
import { useExpenseForm } from "../../hooks/useExpenseForm.tsx"; 


export default function ExpenseCalendar(): React.ReactElement {
    
    // 1. Hook de Dados
    const { 
        currentMonth, 
        selectedDate, 
        expenses, 
        monthlySummary, 
        chartData, 
        setSelectedDate, 
        goToPreviousMonth, 
        goToNextMonth,
        fetchExpensesFromServer, 
        setExpenses, 
    } = useFinanceData();

    // 2. Hook de Formulário
    const {
        openModalForDate,
        openModalForEdit,
        handleDeleteExpense,
        handleExportCSV,
        renderModal,
        renderConfirmationModal,
    } = useExpenseForm({ expenses, selectedDate, fetchExpensesFromServer, setExpenses });

    const formattedMonth = useMemo(() => {
        if (currentMonth instanceof Date) {
            return currentMonth.toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        return currentMonth || "Mês Atual"; 
    }, [currentMonth]);

    return (
        <div className="bg-background min-h-screen p-4 md:p-8">
            <div className="lg:ml-64 shadow-2xl rounded-xl bg-card border border-border p-6 md:p-8 space-y-8">
                
                {/* CABEÇALHO E EXPORTAÇÃO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4">
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center mb-3 md:mb-0">
                        <CalendarIcon className="w-7 h-7 mr-3 text-primary" /> 
                        Minhas Finanças
                    </h1>
                    <SimpleButton 
                        onClick={handleExportCSV} 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" /> 
                        Exportar (.csv)
                    </SimpleButton>
                </div>

                {/* SUMÁRIOS */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center"><DollarSign className="w-5 h-5 mr-2 text-primary" /> Resumo do Mês</h2>
                    <TotalSummary summary={monthlySummary} />
                </div>
                
                {/* GRÁFICO */}
                <div className="space-y-4">
                     <h2 className="text-xl font-bold text-foreground flex items-center"><BarChart className="w-5 h-5 mr-2 text-primary" /> Balanço Mensal</h2>
                     <MonthlyAreaChart data={chartData} />
                </div>

                {/* SEÇÃO DO CALENDÁRIO */}
                <div className="pt-4 border-t border-border space-y-6">
                    
                    {/* NAVEGAÇÃO DO MÊS*/}
                    <div className="flex justify-between items-center max-w-sm mx-auto bg-accent/20 p-2 rounded-lg border border-border/50">
                        <button 
                            onClick={goToPreviousMonth} 
                            className="p-1 rounded-full hover:bg-accent text-foreground transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-foreground capitalize">
                            {formattedMonth}
                        </h2>
                        <button 
                            onClick={goToNextMonth} 
                            className="p-1 rounded-full hover:bg-accent text-foreground transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* CALENDÁRIO VIEW */}
                    <CalendarView 
                        currentMonth={currentMonth} 
                        selectedDate={selectedDate} 
                        expenses={expenses} 
                        
                        prevMonth={goToPreviousMonth} 
                        nextMonth={goToNextMonth}
                        setSelectedDate={setSelectedDate} 
                        
                        handleDeleteExpense={handleDeleteExpense} 
                        openModalForDate={openModalForDate} 
                        openModalForEdit={openModalForEdit} 
                    />
                </div>

                {/* MODAIS */}
                {renderModal()}
                {renderConfirmationModal()}
            </div>
        </div>
    );
}