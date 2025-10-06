import React from "react";
import { Calendar as CalendarIcon, Download } from "lucide-react";
// Componentes externos
import SimpleButton from "../ui/SimpleButton.tsx";
import TotalSummary from "../TotalSummary.tsx";
import MonthlyAreaChart from "../charts/MonthlyAreaChart.tsx";
import CalendarView from "./CalendarView.tsx";
// Hooks
import { useFinanceData } from "../../hooks/useFinanceData.tsx";
import { useExpenseForm } from "../../hooks/useExpenseForm.tsx"; // Ajuste o caminho se necessário


export default function ExpenseCalendar(): React.ReactElement {
  // 1. Hook de Dados (Estado, Navegação e Agregações)
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

  // 2. Hook de Formulário (Modais e Lógica CRUD)
  const {
    openModalForDate,
    openModalForEdit,
    handleDeleteExpense,
    handleExportCSV,
    renderModal,
    renderConfirmationModal,
  } = useExpenseForm({ expenses, selectedDate, fetchExpensesFromServer, setExpenses });

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-8 font-['Inter']">
      <div className="lg:ml-64 overflow-y-auto p-4 sm:p-8 shadow-2xl rounded-xl bg-gray-900 border border-gray-800">
        
        {/* CABEÇALHO E EXPORTAÇÃO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center mb-3 md:mb-0"><CalendarIcon className="w-7 h-7 mr-3 text-blue-500" /> Minhas Finanças Pro</h1>
          <SimpleButton onClick={handleExportCSV} className="bg-green-700 hover:bg-green-800 text-white focus:ring-green-500"><Download className="w-4 h-4 mr-2 inline-block" /> Exportar para Planilha (.csv)</SimpleButton>
        </div>

        {/* SUMÁRIOS E GRÁFICOS */}
        <TotalSummary summary={monthlySummary} />
        <MonthlyAreaChart data={chartData} />

        {/* CALENDÁRIO */}
        <CalendarView 
          currentMonth={currentMonth} 
          selectedDate={selectedDate} 
          expenses={expenses} 
          
          // Funções do useFinanceData
          prevMonth={goToPreviousMonth} 
          nextMonth={goToNextMonth}
          setSelectedDate={setSelectedDate} 
          
          // Funções do useExpenseForm
          handleDeleteExpense={handleDeleteExpense} 
          openModalForDate={openModalForDate} 
          openModalForEdit={openModalForEdit} 
        />

        {/* MODAIS */}
        {renderModal()}
        {renderConfirmationModal()}
      </div>
    </div>
  );
}