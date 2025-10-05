import React, { useState, useMemo, useEffect } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, DollarSign, ArrowDown, ArrowUp, X, Edit, Download } from "lucide-react";
import axios from "axios";
import type { Expense, ExpenseFormData} from "../lib/types.ts";
import { API_URL, colorOptions } from "../lib/constants.ts";
import {createLocalDayDate } from "../lib/dateUtils.ts";
import SimpleButton from "../components/ui/SimpleButton.tsx"
import TotalSummary from "./TotalSummary.tsx";
import MonthlyAreaChart from "./charts/MonthlyAreaChart.tsx";


// ============ CALENDAR VIEW ============
interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: Date;
  expenses: Expense[];
  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  handleDeleteExpense: (id: string) => void;
  openModalForDate: (date: Date) => void;
  openModalForEdit: (expense: Expense) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  selectedDate,
  expenses,
  setCurrentMonth,
  setSelectedDate,
  handleDeleteExpense,
  openModalForDate,
  openModalForEdit,
}) => {
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-2 pb-4 border-b border-gray-800 text-white">
      <div className="flex items-center gap-2">
        <SimpleButton className="h-8 w-8 text-gray-400 hover:bg-gray-700 bg-transparent hover:text-white p-0 focus:ring-gray-600" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>{"<"}</SimpleButton>
        <h2 className="text-xl font-medium w-48 text-left capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
        <SimpleButton className="h-8 w-8 text-gray-400 hover:bg-gray-700 bg-transparent hover:text-white p-0 focus:ring-gray-600" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{">"}</SimpleButton>
      </div>
      <SimpleButton onClick={() => openModalForDate(selectedDate)} className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500">
        <DollarSign className="w-4 h-4 mr-2 inline-block" /> Novo Lançamento
      </SimpleButton>
    </div>
  );

  const renderDays = () => {
    const days: React.ReactElement[] = [];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="flex-1 text-center font-bold text-gray-400 py-3 uppercase text-xs">{dayNames[i]}</div>
      );
    }
    return <div className="flex w-full border-b border-gray-800">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];
    let day = startDate;
    let rowKey = 0;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const formattedDate = format(cloneDay, "d");

        // Esta filtragem agora usa datas corrigidas, resolvendo o problema de exibição
        const dayExpenses = expenses.filter((e) => isSameDay(e.date, cloneDay)); 
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);
        const isToday = isSameDay(cloneDay, new Date());
        const isSelected = isSameDay(cloneDay, selectedDate);

        days.push(
          <div
            key={cloneDay.toISOString()}
            onClick={() => setSelectedDate(cloneDay)}
            onDoubleClick={() => openModalForDate(cloneDay)}
            className={`
              flex-1 min-w-0 flex flex-col items-start p-2 h-32 transition-all duration-100 
              cursor-pointer relative overflow-hidden
              ${!isCurrentMonth ? "bg-gray-900 text-gray-600" : "bg-gray-900 text-white"}
              ${isToday ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" : "border-gray-800"}
              ${isSelected && !isToday ? "bg-gray-800/60" : "hover:bg-gray-800"}
              border-r border-b
            `}
            style={{ minHeight: "120px" }}
          >
            <div className={`text-lg font-medium mb-1 ${!isCurrentMonth ? "text-gray-600" : "text-white"}`}>{formattedDate}</div>

            <div className="flex flex-col gap-1 w-full mt-1">
              {dayExpenses.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); openModalForEdit(event); }}
                  className={`text-[11px] text-white px-1 py-[2px] rounded-sm truncate w-full shadow-md flex justify-between items-center ${event.color} transition-opacity opacity-90 group relative hover:opacity-100 cursor-pointer`}
                  title={`${event.description} | ${event.type === "income" ? "Receita" : "Despesa"}: R$${event.amount.toFixed(2).replace(".", ",")}`}
                >
                  <span className="truncate">{event.description}</span>
                  <div className="flex items-center">
                    <span className="font-semibold ml-2 flex-shrink-0">{event.type === "income" ? "+" : "-"}R$ {event.amount.toFixed(2).replace(".", ",")}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteExpense(event.id); }}
                      className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-0 h-4 w-4 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center"
                      title="Excluir Lançamento"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {dayExpenses.length > 3 && <span className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-blue-400">+{dayExpenses.length - 3} mais</span>}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(<div key={`row-${rowKey++}`} className="flex w-full">{days}</div>);
      days = [];
    }

    return <div className="mt-0 border-l border-t border-gray-800">{rows}</div>;
  };

  return (
    <>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </>
  );
};

// ============ MAIN COMPONENT ============
export default function ExpenseCalendar(): React.ReactElement {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date())); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState<ExpenseFormData>({
    id: null,
    amount: "",
    description: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    type: "expense",
    color: colorOptions[0].value,
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);

  const updateFormData = (field: keyof ExpenseFormData, value: any) => setModalFormData((prev) => ({ ...prev, [field]: value }));

  // API helpers
  const fetchExpensesFromServer = async (): Promise<Expense[]> => {
    const resp = await axios.get(API_URL);
    return resp.data.map((e: any) => {
      // CORREÇÃO DEFINITIVA (BUG DE DATA): Usa a nova função para criar o Date
      return {
        id: e.id,
        date: createLocalDayDate(e.date), 
        amount: e.amount,
        description: e.description,
        type: e.type,
        color: e.color,
      };
    });
  };

  const createExpenseOnServer = async (payload: any) => (await axios.post(API_URL, payload)).data;
  const updateExpenseOnServer = async (id: string, payload: any) => (await axios.put(`${API_URL}/${id}`, payload)).data;
  const deleteExpenseOnServer = async (id: string) => await axios.delete(`${API_URL}/${id}`);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchExpensesFromServer();
        if (!mounted) return;
        setExpenses(data);
      } catch (err) {
        console.error("Erro ao carregar despesas:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const closeModal = () => {
    setModalFormData({
      id: null,
      amount: "",
      description: "",
      date: format(selectedDate, "yyyy-MM-dd"),
      type: "expense",
      color: colorOptions[0].value,
    });
    setIsModalOpen(false);
  };

  const handleSaveExpense = async () => {
    const amountFloat = parseFloat(modalFormData.amount.replace(",", "."));
    if (modalFormData.description.trim() === "" || isNaN(amountFloat) || amountFloat <= 0) {
      console.error("Erro: insira descrição e valor válidos.");
      return;
    }

    const payload = {
      description: modalFormData.description,
      amount: amountFloat,
      type: modalFormData.type,
      color: modalFormData.color,
      date: modalFormData.date, // Backend recebe 'yyyy-MM-dd'
    };

    try {
      if (modalFormData.id) {
        await updateExpenseOnServer(modalFormData.id, payload);
      } else {
        await createExpenseOnServer(payload);
      }
      
      const fresh = await fetchExpensesFromServer();
      setExpenses(fresh); 
      closeModal(); // Garante o fechamento do modal
    } catch (err) {
      console.error("Erro ao salvar lançamento:", err);
    }
  };

  const handleDeleteExpense = (id: string) => { openConfirmModal(id); };

  const confirmDeletion = async () => {
    if (!expenseToDeleteId) { closeConfirmModal(); return; }
    try {
      await deleteExpenseOnServer(expenseToDeleteId);
      const fresh = await fetchExpensesFromServer();
      setExpenses(fresh); 
    } catch (err) {
      console.error("Erro ao deletar lançamento:", err);
    }
    closeConfirmModal();
  };

  const openConfirmModal = (id: string) => {
    setExpenseToDeleteId(id);
    setIsConfirmModalOpen(true);
    setIsModalOpen(false); // Fecha o modal de edição/criação
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setExpenseToDeleteId(null);
  };

  const openModalForDate = (date: Date) => {
    setSelectedDate(date);
    setModalFormData({
      id: null,
      amount: "",
      description: "",
      date: format(date, "yyyy-MM-dd"),
      type: "expense",
      color: colorOptions[0].value,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (expense: Expense) => {
    setSelectedDate(expense.date);
    setModalFormData({
      id: expense.id,
      amount: expense.amount.toFixed(2).replace(".", ","),
      description: expense.description,
      date: format(expense.date, "yyyy-MM-dd"),
      type: expense.type,
      color: expense.color,
    });
    setIsModalOpen(true);
  };

  // CSV export (fixed)
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      console.error("Não há lançamentos para exportar.");
      return;
    }

    const header = ["ID", "Data", "Tipo", "Valor", "Descrição", "Cor_Tag"];
    const rows: string[] = [];
    rows.push(header.join(";"));

    expenses.forEach((e) => {
      const id = e.id;
      const dateStr = format(e.date, "dd/MM/yyyy");
      const typeLabel = e.type === "income" ? "Receita" : "Despesa";
      const amountStr = e.amount.toFixed(2).replace(".", ",");
      const descSafe = e.description.replace(/"/g, '""').replace(/;/g, ",");
      const colorTag = e.color.replace(/^bg-/, "");
      rows.push([id, dateStr, typeLabel, amountStr, `"${descSafe}"`, colorTag].join(";"));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financas_export_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Aggregations
  const monthlySummary = useMemo(() => {
    const filteredExpenses = expenses.filter((e) => isSameMonth(e.date, currentMonth));
    const totalIncome = filteredExpenses.filter((e) => e.type === "income").reduce((s, x) => s + x.amount, 0);
    const totalExpense = filteredExpenses.filter((e) => e.type === "expense").reduce((s, x) => s + x.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance, monthName: format(currentMonth, "MMMM", { locale: ptBR }) };
  }, [expenses, currentMonth]);

  const chartData = useMemo(() => {
    const monthlyDataMap = new Map<string, { income: number; expense: number }>();
    expenses.forEach((expense) => {
      const monthKey = format(expense.date, "yyyy-MM");
      if (!monthlyDataMap.has(monthKey)) monthlyDataMap.set(monthKey, { income: 0, expense: 0 });
      const obj = monthlyDataMap.get(monthKey)!;
      if (expense.type === "income") obj.income += expense.amount;
      else obj.expense += expense.amount;
    });
    const sortedKeys = Array.from(monthlyDataMap.keys()).sort();
    return sortedKeys.map((key) => {
      const summary = monthlyDataMap.get(key)!;
      return {
        monthKey: key,
        monthLabel: format(createLocalDayDate(`${key}-01`), "MMM/yy", { locale: ptBR }),
        income: summary.income,
        expense: summary.expense,
        balance: summary.income - summary.expense,
      };
    });
  }, [expenses]);

  // Render modals & main
  const renderModal = () => {
    if (!isModalOpen) return null;
    const isEditing = modalFormData.id !== null;
    // Usa a data do formulário para formatar o título (também corrigido pelo bug)
    const modalTitle = isEditing ? `Editar Lançamento: #${modalFormData.id}` : `Novo Lançamento em ${format(createLocalDayDate(modalFormData.date), "dd/MM/yyyy")}`;

    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 text-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4 sticky top-0 bg-gray-900 z-10">
            <h3 className="text-xl text-white font-bold">{modalTitle}</h3>
            <SimpleButton onClick={closeModal} className="bg-transparent text-gray-400 hover:text-white p-1 h-auto w-auto focus:ring-gray-600"><X className="w-5 h-5" /></SimpleButton>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-gray-300 mb-2 block font-medium">Tipo de Lançamento</label>
              <div className="flex gap-3">
                <SimpleButton type="button" onClick={() => updateFormData("type", "expense")} className={`flex-1 p-3 rounded-md border text-center ${modalFormData.type === "expense" ? "bg-red-700 border-red-700 text-white shadow-xl focus:ring-red-500" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}`}><ArrowDown className="w-4 h-4 mr-2 inline-block" /> Despesa</SimpleButton>
                <SimpleButton type="button" onClick={() => updateFormData("type", "income")} className={`flex-1 p-3 rounded-md border text-center ${modalFormData.type === "income" ? "bg-green-700 border-green-700 text-white shadow-xl focus:ring-green-500" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}`}><ArrowUp className="w-4 h-4 mr-2 inline-block" /> Receita</SimpleButton>
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="text-gray-300 font-medium">Valor (R$)</label>
              <input id="amount" type="text" value={modalFormData.amount} onChange={(e) => updateFormData("amount", e.target.value.replace(/[^0-9,.]/g, ""))} className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0,00" />
            </div>

            <div>
              <label htmlFor="description" className="text-gray-300 font-medium">Descrição/Categoria</label>
              <input id="description" value={modalFormData.description} onChange={(e) => updateFormData("description", e.target.value)} className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ex: Aluguel, Salário, Uber" />
            </div>

            <div>
              <label className="text-gray-300 mb-3 block font-medium">Cor de Destaque</label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((c) => (
                  <button key={c.value} type="button" onClick={() => updateFormData("color", c.value)} className={`w-10 h-10 rounded-full border-2 transition-all shadow-md ${c.value} ${modalFormData.color === c.value ? "border-white ring-2 ring-offset-2 ring-offset-gray-900" : "border-transparent opacity-60 hover:opacity-100"}`} title={c.label} />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="date-input" className="text-gray-300 font-medium">Data</label>
              <div className="relative mt-1">
                <input id="date-input" type="date" value={modalFormData.date} onChange={(e) => updateFormData("date", e.target.value)} className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10" />
                <CalendarIcon className="h-4 w-4 absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800 mt-4">
              <SimpleButton onClick={closeModal} className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 focus:ring-gray-600">Cancelar</SimpleButton>
              <SimpleButton onClick={handleSaveExpense} className={`text-white focus:ring-blue-500 ${modalFormData.id ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}>{modalFormData.id ? (<><Edit className="w-4 h-4 mr-2 inline-block" /> Atualizar Lançamento</>) : (<><DollarSign className="w-4 h-4 mr-2 inline-block" /> Salvar Lançamento</>)}</SimpleButton>
            </div>

            {modalFormData.id && (<div className="flex justify-start pt-2"><SimpleButton onClick={() => handleDeleteExpense(modalFormData.id!)} className="bg-red-900 border border-red-700 text-red-300 hover:bg-red-800 focus:ring-red-600"><X className="w-4 h-4 mr-2 inline-block" /> Excluir permanentemente</SimpleButton></div>)}
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmationModal = () => {
    if (!isConfirmModalOpen || expenseToDeleteId === null) return null;
    const expenseToConfirm = expenses.find((e) => e.id === expenseToDeleteId);
    if (!expenseToConfirm) { closeConfirmModal(); return null; }
    const { description, amount, type, date } = expenseToConfirm;

    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 text-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
          <div className="flex items-center text-red-400 mb-4">
            <X className="w-6 h-6 mr-2 bg-red-800/50 rounded-full p-1" />
            <h3 className="text-xl font-bold">Confirmação de Exclusão</h3>
          </div>

          <p className="mb-4 text-gray-300">Você tem certeza que deseja <strong>excluir</strong> o seguinte lançamento? Esta ação não pode ser desfeita.</p>

          <div className="p-3 bg-gray-800 rounded-lg mb-6 border border-gray-700">
            <p className="font-semibold text-lg truncate mb-1">{description}</p>
            <p className={`text-sm font-medium ${type === "income" ? "text-green-400" : "text-red-400"}`}>{type === "income" ? "RECEITA" : "DESPESA"}: R${amount.toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-gray-400 mt-1">Data: {format(date, "dd/MM/yyyy")}</p>
          </div>

          <div className="flex justify-end gap-3">
            <SimpleButton onClick={closeConfirmModal} className="bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500">Cancelar</SimpleButton>
            <SimpleButton onClick={confirmDeletion} className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">Sim, Excluir</SimpleButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-8 font-['Inter']">
      <div className="lg:ml-64 overflow-y-auto p-4 sm:p-8 shadow-2xl rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center mb-3 md:mb-0"><CalendarIcon className="w-7 h-7 mr-3 text-blue-500" /> Minhas Finanças Pro</h1>
          <SimpleButton onClick={handleExportCSV} className="bg-green-700 hover:bg-green-800 text-white focus:ring-green-500"><Download className="w-4 h-4 mr-2 inline-block" /> Exportar para Planilha (.csv)</SimpleButton>
        </div>

        <TotalSummary summary={monthlySummary} />
        <MonthlyAreaChart data={chartData} />

        <CalendarView currentMonth={currentMonth} selectedDate={selectedDate} expenses={expenses} setCurrentMonth={setCurrentMonth} setSelectedDate={setSelectedDate} handleDeleteExpense={handleDeleteExpense} openModalForDate={openModalForDate} openModalForEdit={openModalForEdit} />

        {renderModal()}
        {renderConfirmationModal()}
      </div>
    </div>
  );
}