import React, { useState, useMemo } from "react"
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, DollarSign, ArrowDown, ArrowUp, X, TrendingUp, Edit, Download } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// --- 1. TIPAGEM E DADOS INICIAIS ---

type TransactionType = 'expense' | 'income';

interface Expense {
  id: number
  date: Date
  amount: number
  description: string
  type: TransactionType
  color: string
}

interface MonthlySummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    monthName: string;
}

interface ChartData {
    monthKey: string;
    monthLabel: string;
    income: number;
    expense: number;
    balance: number;
}

interface ExpenseFormData {
  id: number | null; // null for new, ID for editing
  amount: string;
  description: string;
  date: string;
  type: TransactionType;
  color: string;
}

// Cores puras para seleção customizada
const colorOptions: { value: string; label: string; className: string }[] = [
  { value: "bg-red-600", label: "Vermelho", className: "bg-red-600" },
  { value: "bg-green-600", label: "Verde", className: "bg-green-600" },
  { value: "bg-yellow-600", label: "Amarelo", className: "bg-yellow-600" },
  { value: "bg-blue-600", label: "Azul", className: "bg-blue-600" },
  { value: "bg-purple-600", label: "Roxo", className: "bg-purple-600" },
  { value: "bg-pink-600", label: "Rosa", className: "bg-pink-600" },
];

// Função auxiliar para criar a data corrigida (CORREÇÃO DE FUSO HORÁRIO)
const createCorrectedDate = (dateString: string): Date => {
  const parts = dateString.split('-').map(p => parseInt(p, 10));
  // Define a hora para 12h para evitar problemas de fuso horário
  const correctedDate = new Date(parts[0], parts[1] - 1, parts[2], 12); 
  return correctedDate;
}

// DADOS INICIAIS (Mock Data)
const initialExpenses: Expense[] = [
    { id: 16, date: createCorrectedDate("2025-07-05"), amount: 6000.0, description: "Salário Julho", type: 'income', color: "bg-green-600" },
    { id: 17, date: createCorrectedDate("2025-07-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 20, date: createCorrectedDate("2025-08-05"), amount: 6500.0, description: "Salário Agosto", type: 'income', color: "bg-green-600" },
    { id: 21, date: createCorrectedDate("2025-08-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 11, date: createCorrectedDate("2025-09-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 12, date: createCorrectedDate("2025-09-05"), amount: 5000.0, description: "Salário", type: 'income', color: "bg-green-600" },
    { id: 1, date: createCorrectedDate("2025-10-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 2, date: createCorrectedDate("2025-10-05"), amount: 5500.0, description: "Salário Mensal", type: 'income', color: "bg-green-600" },
    { id: 3, date: createCorrectedDate("2025-10-05"), amount: 350.0, description: "Supermercado", type: 'expense', color: "bg-yellow-600" },
    { id: 4, date: createCorrectedDate("2025-10-10"), amount: 150.0, description: "Lazer", type: 'expense', color: "bg-blue-600" },
    { id: 14, date: createCorrectedDate("2025-11-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 15, date: createCorrectedDate("2025-11-05"), amount: 5500.0, description: "Salário", type: 'income', color: "bg-purple-700" },
    { id: 31, date: createCorrectedDate("2025-12-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
    { id: 29, date: createCorrectedDate("2025-12-05"), amount: 5500.0, description: "Salário Dezembro", type: 'income', color: "bg-green-600" },
    // ALTERAÇÃO AQUI: Salário de Janeiro 2026 alterado para 6000.0 (anteriormente 5500.0) para mostrar crescimento.
    { id: 34, date: createCorrectedDate("2026-01-05"), amount: 6000.0, description: "Salário Janeiro", type: 'income', color: "bg-green-600" }, 
    { id: 35, date: createCorrectedDate("2026-01-01"), amount: 1500.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
];


// --- 2. COMPONENTES AUXILIARES DE UI (Reutilizáveis) ---

const SimpleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
  >
    {children}
  </button>
);

const TotalSummary: React.FC<{ summary: MonthlySummary }> = ({ summary }) => {
  const { totalIncome, totalExpense, balance, monthName } = summary;

  const formatCurrency = (amount: number) => 
    `R$${amount.toFixed(2).replace('.', ',')}`;
    
  const displayMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-xl mb-6 text-white">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-gray-300">
        Resumo de {displayMonthName}
      </h2>
      
      <div className="flex flex-wrap gap-4 justify-between">
      
        {/* Total Receitas */}
        <div className="flex flex-col items-start p-3 bg-gray-900 rounded-lg flex-1 min-w-[150px] transition-transform hover:scale-[1.02] duration-300">
          <div className="text-sm text-gray-400 font-medium flex items-center">
            <ArrowUp className="w-4 h-4 mr-1 text-green-400"/> Receitas
          </div>
          <span className="text-2xl font-bold text-green-400 mt-1">
            {formatCurrency(totalIncome)}
          </span>
        </div>

        {/* Total Despesas */}
        <div className="flex flex-col items-start p-3 bg-gray-900 rounded-lg flex-1 min-w-[150px] transition-transform hover:scale-[1.02] duration-300">
          <div className="text-sm text-gray-400 font-medium flex items-center">
            <ArrowDown className="w-4 h-4 mr-1 text-red-400"/> Despesas
          </div>
          <span className="text-2xl font-bold text-red-400 mt-1">
            {formatCurrency(totalExpense)}
          </span>
        </div>

        {/* Saldo Total (Destaque) */}
        <div className={`flex flex-col items-start p-3 rounded-lg flex-1 min-w-[150px] transition-transform hover:scale-[1.02] duration-300 ${
          balance >= 0 ? 'bg-blue-700' : 'bg-red-800'
        } border ${balance >= 0 ? 'border-blue-600' : 'border-red-700'}`}>
          <div className="text-sm font-medium flex items-center text-white">
            <DollarSign className="w-4 h-4 mr-1"/> SALDO FINAL
          </div>
          <span className="text-2xl font-bold text-white mt-1">
            {formatCurrency(balance)}
          </span>
        </div>
      </div>
    </div>
  );
}


// --- 3. COMPONENTE DE GRÁFICO DE ÁREA EMPILHADA (Modularizado) ---

const formatCurrencyForTooltip = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

// Tooltip Customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const incomeItem = payload.find((p: any) => p.dataKey === 'income');
    const expenseItem = payload.find((p: any) => p.dataKey === 'expense');
    
    const totalIncome = incomeItem ? incomeItem.value : 0;
    const totalExpense = expenseItem ? expenseItem.value : 0;
    const balance = totalIncome - totalExpense;

    return (
      <div className="p-3 bg-gray-700 border border-gray-600 text-white rounded-lg shadow-xl text-sm">
        <p className="font-bold mb-2 text-base text-blue-300">{label}</p>
        <div className="flex justify-between items-center text-green-300">
            <ArrowUp className="w-3 h-3 mr-2"/> Receita: 
            <span className="font-semibold ml-2">{formatCurrencyForTooltip(totalIncome)}</span>
        </div>
        <div className="flex justify-between items-center text-red-300">
            <ArrowDown className="w-3 h-3 mr-2"/> Despesa: 
            <span className="font-semibold ml-2">{formatCurrencyForTooltip(totalExpense)}</span>
        </div>
        <div className={`font-bold mt-2 pt-2 border-t border-gray-600 ${balance >= 0 ? 'text-blue-400' : 'text-pink-400'}`}>
            SALDO: {formatCurrencyForTooltip(balance)}
        </div>
      </div>
    );
  }
  return null;
};

// Componente Principal do Gráfico
const MonthlyAreaChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
    if (data.length < 2) {
        return (
            <div className="text-gray-500 p-8 text-center bg-gray-800 rounded-xl mb-6">
                Mínimo de 2 meses de dados para o Gráfico de Área.
            </div>
        );
    }
    
    // Filtra os 6 meses mais recentes para o gráfico
    const recentData = data.slice(-6);

    const lastMonth = recentData[recentData.length - 1];
    const prevMonth = recentData[recentData.length - 2] || { income: 0, expense: 0 };
    
    // --- LÓGICA DE CÁLCULO DE TENDÊNCIA CORRIGIDA ---
    let incomeGrowthText: string;
    let trendIcon: React.ReactElement;
    
    const currentIncome = lastMonth.income;
    const previousIncome = prevMonth.income;

    if (previousIncome === 0) {
        if (currentIncome > 0) {
            // Caso 1: Receita nova (crescimento de 0 para > 0)
            incomeGrowthText = "Novo";
            trendIcon = <TrendingUp className="h-4 w-4 text-green-400" />;
        } else {
            // Caso 2: Ambas são zero (estagnada no zero)
            incomeGrowthText = "0.0%";
            trendIcon = <span className="h-4 w-4 text-gray-400 font-bold flex items-center justify-center">=</span>; // Ícone de igual
        }
    } else {
        const growth = (currentIncome - previousIncome) / previousIncome;
        const percentage = Math.abs(growth * 100).toFixed(1);
        
        incomeGrowthText = `${percentage}%`;
        
        if (growth > 0) {
            trendIcon = <TrendingUp className="h-4 w-4 text-green-400" />;
        } else if (growth < 0) {
            trendIcon = <ArrowDown className="h-4 w-4 text-red-400" />;
        } else {
            trendIcon = <span className="h-4 w-4 text-gray-400 font-bold flex items-center justify-center">=</span>;
        }
    }
    
    // Determina a palavra de ação (subiu, caiu, estagnada)
    const trendAction = currentIncome > previousIncome ? 'subiu' : (currentIncome < previousIncome ? 'caiu' : 'estagnada');
    // --- Fim da Lógica de Cálculo de Tendência ---
    
    return (
        <div className="bg-gray-900 p-4 pt-6 rounded-xl shadow-lg border border-gray-800 mb-6">
            <h3 className="text-xl font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">
                Movimentação Financeira Mensal (Últimos {recentData.length} meses)
            </h3>
            
            <div className='h-[250px] w-full'>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={recentData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis 
                            dataKey="monthLabel" 
                            stroke="#9CA3AF" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={12} 
                            tickFormatter={formatCurrencyForTooltip}
                            axisLine={false}
                            tickLine={false}
                            hide={true} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Despesas */}
                        <Area 
                            type="monotone" 
                            dataKey="expense" 
                            stackId="a" 
                            stroke="#DC2626" 
                            fill="#991B1B" 
                            fillOpacity={0.6}
                            name="Despesa"
                        />
                        
                        {/* Receitas */}
                        <Area 
                            type="monotone" 
                            dataKey="income" 
                            stackId="a" 
                            stroke="#10B981" 
                            fill="#065F46" 
                            fillOpacity={0.6}
                            name="Receita"
                        />
                        
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex w-full items-start gap-2 text-sm mt-4 pt-3 border-t border-gray-800 text-gray-400">
                <div className="flex items-center gap-2 leading-none font-medium text-white">
                    {trendIcon} Receita {trendAction} por <span className='font-bold ml-1'>{incomeGrowthText}</span> no último mês.
                </div>
            </div>
        </div>
    );
};


// --- 4. COMPONENTE DE CALENDÁRIO (Modularizado) ---

interface CalendarViewProps {
    currentMonth: Date;
    selectedDate: Date;
    expenses: Expense[];
    setCurrentMonth: (date: Date) => void;
    setSelectedDate: (date: Date) => void;
    handleDeleteExpense: (id: number) => void; // Agora abre o modal de confirmação
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

    // --- Renderização do Cabeçalho do Calendário ---

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-2 pb-4 border-b border-gray-800 text-white">
          <div className="flex items-center gap-2">
            <SimpleButton
              className="h-8 w-8 text-gray-400 hover:bg-gray-700 bg-transparent hover:text-white p-0 focus:ring-gray-600"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              {"<"}
            </SimpleButton>
            <h2 className="text-xl font-medium w-48 text-left capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <SimpleButton
              className="h-8 w-8 text-gray-400 hover:bg-gray-700 bg-transparent hover:text-white p-0 focus:ring-gray-600"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              {">"}
            </SimpleButton>
          </div>
          <SimpleButton 
            onClick={() => openModalForDate(selectedDate)} 
            className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
          >
            <DollarSign className="w-4 h-4 mr-2 inline-block" /> Novo Lançamento
          </SimpleButton>
        </div>
    )

    // --- Renderização dos Dias da Semana ---

    const renderDays = () => {
        const days: React.ReactElement[] = []
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] 

        for (let i = 0; i < 7; i++) {
          days.push(
            <div 
              key={i} 
              className="flex-1 text-center font-bold text-gray-400 py-3 uppercase text-xs"
            >
              {dayNames[i]}
            </div>
          )
        }
        return <div className="flex w-full border-b border-gray-800">{days}</div>
    }

    // --- Renderização das Células do Calendário ---

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) 
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

        const rows: React.ReactElement[] = []
        let days: React.ReactElement[] = []
        let day = startDate
        let rowKey = 0

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = new Date(day)
                const formattedDate = format(cloneDay, "d")
                
                const dayExpenses = expenses.filter((e) => isSameDay(e.date, cloneDay))
                
                const isCurrentMonth = isSameMonth(cloneDay, monthStart)
                const isToday = isSameDay(cloneDay, new Date())
                const isSelected = isSameDay(cloneDay, selectedDate)

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
                        style={{ minHeight: '120px' }} 
                    >
                        <div className={`text-lg font-medium mb-1 ${!isCurrentMonth ? 'text-gray-600' : 'text-white'}`}>
                            {formattedDate}
                        </div>
                        
                        <div className="flex flex-col gap-1 w-full mt-1">
                            {/* Exibe as notas do dia como BLOCOS COLORIDOS */}
                            {dayExpenses.slice(0, 3).map((event) => (
                                <div
                                    key={event.id} 
                                    onClick={(e) => { e.stopPropagation(); openModalForEdit(event); }} // Adiciona clique para edição
                                    className={`text-[11px] text-white px-1 py-[2px] rounded-sm truncate w-full shadow-md flex justify-between items-center ${event.color} transition-opacity opacity-90 group relative hover:opacity-100 cursor-pointer`}
                                    title={`${event.description} | ${event.type === 'income' ? 'Receita' : 'Despesa'}: R$${event.amount.toFixed(2).replace('.', ',')}`}
                                >
                                    <span className="truncate">{event.description}</span>
                                    <div className='flex items-center'>
                                        <span className="font-semibold ml-2 flex-shrink-0">
                                            {event.type === 'income' ? '+' : '-'}R$ {event.amount.toFixed(2).replace('.', ',')}
                                        </span>
                                        
                                        {/* BOTÃO DE EXCLUSÃO (agora abre o modal de confirmação) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleDeleteExpense(event.id); // Abre o modal de confirmação
                                            }}
                                            className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-0 h-4 w-4 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center"
                                            title="Excluir Lançamento"
                                        >
                                            <X className="w-3 h-3 text-white"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Indicador de mais itens */}
                        {dayExpenses.length > 3 && (
                            <span className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-blue-400">
                                +{dayExpenses.length - 3} mais
                            </span>
                        )}
                        
                    </div>
                )

                day = addDays(day, 1)
            }

            rows.push(
                <div key={`row-${rowKey++}`} className="flex w-full">
                    {days}
                </div>
            )
            days = []
        }

        return <div className="mt-0 border-l border-t border-gray-800">{rows}</div>
    }

    return (
        <>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </>
    );
};


// --- 5. COMPONENTE PRINCIPAL (Gerencia o Estado e a Integração) ---

export default function ExpenseCalendar(): React.ReactElement {
  
  const [currentMonth, setCurrentMonth] = useState(createCorrectedDate("2025-10-01"))
  const [selectedDate, setSelectedDate] = useState(new Date()) 
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  
  // --- Estados do Modal de Adição/Edição ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalFormData, setModalFormData] = useState<ExpenseFormData>({
    id: null,
    amount: "",
    description: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    type: 'expense',
    color: colorOptions[0].value,
  })

  // --- Estados do Modal de Confirmação ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<number | null>(null);

  // Função para atualizar campos do formulário
  const updateFormData = (field: keyof ExpenseFormData, value: any) => {
    setModalFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- Funções de Lançamentos e Modais ---

  const handleSaveExpense = () => {
    // Substitui vírgula por ponto para parsear corretamente o float em JS
    const amountFloat = parseFloat(modalFormData.amount.replace(",", ".")) 
    
    if (modalFormData.description.trim() === "" || isNaN(amountFloat) || amountFloat <= 0) {
      console.error("Erro: Por favor, insira um valor e uma descrição válidos.")
      return
    }

    const expenseToSave: Expense = {
      id: modalFormData.id ?? Date.now(), // Usa ID existente ou gera um novo
      amount: amountFloat,
      description: modalFormData.description,
      date: createCorrectedDate(modalFormData.date), 
      type: modalFormData.type,
      color: modalFormData.color,
    }

    if (modalFormData.id) {
        // MODO EDIÇÃO: Atualiza a despesa existente
        setExpenses(prev => prev.map(e => e.id === expenseToSave.id ? expenseToSave : e));
    } else {
        // MODO ADIÇÃO: Adiciona uma nova despesa
        setExpenses((prev) => [...prev, expenseToSave])
    }
    
    closeModal();
  }
  
  const closeModal = () => {
      // Reseta o formulário para o estado inicial/limpo e fecha
      setModalFormData({
        id: null,
        amount: "",
        description: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        type: 'expense',
        color: colorOptions[0].value,
      });
      setIsModalOpen(false);
  }

  // Abre o modal de CONFIRMAÇÃO, e não deleta diretamente
  const handleDeleteExpense = (id: number) => {
      openConfirmModal(id);
  };
  
  // AÇÃO de DELETAR REAL
  const confirmDeletion = () => {
    if (expenseToDeleteId !== null) {
        setExpenses(prev => prev.filter(e => e.id !== expenseToDeleteId));
    }
    closeConfirmModal();
  };

  const openConfirmModal = (id: number) => {
    setExpenseToDeleteId(id);
    setIsConfirmModalOpen(true);
    setIsModalOpen(false); // Fecha o modal de edição se estiver aberto
  };
  
  const closeConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setExpenseToDeleteId(null);
  };

  const openModalForDate = (date: Date) => {
    setSelectedDate(date)
    setModalFormData({
        id: null,
        amount: "",
        description: "",
        date: format(date, "yyyy-MM-dd"),
        type: 'expense',
        color: colorOptions[0].value,
    });
    setIsModalOpen(true)
  }
  
  const openModalForEdit = (expense: Expense) => {
    setSelectedDate(expense.date);
    setModalFormData({
        id: expense.id,
        amount: expense.amount.toFixed(2).replace('.', ','), // Formato R$ (com vírgula)
        description: expense.description,
        date: format(expense.date, "yyyy-MM-dd"),
        type: expense.type,
        color: expense.color,
    });
    setIsModalOpen(true);
  }

  // --- Implementação do Exportar para Planilha (CSV) ---
  const handleExportCSV = () => {
    if (expenses.length === 0) {
        console.error("Não há lançamentos para exportar.");
        return;
    }

    // Define o cabeçalho (usando ponto-e-vírgula como separador)
    const header = ["ID", "Data", "Tipo", "Valor", "Descrição", "Cor_Tag"];
    
    // Mapeia os dados para linhas CSV
    const csvContent = [
        header.join(";"),
        ...expenses.map(e => [
            e.id,
            // Formata a data para DD/MM/AAAA
            format(e.date, "dd/MM/yyyy"), 
            e.type === 'income' ? 'Receita' : 'Despesa',
            // Formata o valor com vírgula para Excel reconhecer como número brasileiro
            e.amount.toFixed(2).replace('.', ','), 
            `"${e.description.replace(/"/g, '""').replace(/;/g, ',')}"`, // Protege a descrição
            e.color.replace('bg-', '') // Remove o prefixo Tailwind
        ].join(";"))
    ].join("\n");

    // Cria um Blob com o conteúdo e o BOM (Byte Order Mark) para UTF-8, garantindo acentuação e compatibilidade com Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Cria um link temporário para iniciar o download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    // Usa a extensão .csv que é universalmente reconhecida
    link.setAttribute('download', `financas_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    
    // Simula o clique e limpa
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Funções de Agregação (Mantidas do código anterior) ---

  // Agregação de dados para o Resumo do Mês
  const monthlySummary = useMemo(() => {
    const filteredExpenses = expenses.filter(e => 
        isSameMonth(e.date, currentMonth)
    );

    const totalIncome = filteredExpenses
        .filter(e => e.type === 'income')
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    const totalExpense = filteredExpenses
        .filter(e => e.type === 'expense')
        .reduce((sum, exp) => sum + exp.amount, 0);
        
    const balance = totalIncome - totalExpense;

    return { 
        totalIncome, 
        totalExpense, 
        balance, 
        monthName: format(currentMonth, "MMMM", { locale: ptBR }) 
    };
  }, [expenses, currentMonth]);

  // Agregação de dados para o Gráfico de Todos os Meses
  const chartData = useMemo(() => {
    const monthlyDataMap = new Map<string, { income: number; expense: number }>();

    expenses.forEach(expense => {
      const monthKey = format(expense.date, 'yyyy-MM');

      if (!monthlyDataMap.has(monthKey)) {
        monthlyDataMap.set(monthKey, { income: 0, expense: 0 });
      }

      const monthSummary = monthlyDataMap.get(monthKey)!;

      if (expense.type === 'income') {
        monthSummary.income += expense.amount;
      } else {
        monthSummary.expense += expense.amount;
      }
    });

    const sortedKeys = Array.from(monthlyDataMap.keys()).sort();
    
    return sortedKeys.map(key => {
      const summary = monthlyDataMap.get(key)!;
      return {
        monthKey: key,
        monthLabel: format(createCorrectedDate(`${key}-01`), 'MMM/yy', { locale: ptBR }), 
        income: summary.income,
        expense: summary.expense,
        balance: summary.income - summary.expense,
      };
    });
  }, [expenses]);


  // --- Renderização de Modais ---

  const renderModal = () => {
    if (!isModalOpen) return null;
    
    const isEditing = modalFormData.id !== null;
    const modalTitle = isEditing ? 
        `Editar Lançamento: #${modalFormData.id}` : 
        `Novo Lançamento em ${format(selectedDate, "dd/MM/yyyy")}`;

    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 text-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          
          <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4 sticky top-0 bg-gray-900 z-10">
            <h3 className="text-xl text-white font-bold">{modalTitle}</h3>
            <SimpleButton 
              onClick={closeModal} 
              className="bg-transparent text-gray-400 hover:text-white p-1 h-auto w-auto focus:ring-gray-600"
            >
              <X className="w-5 h-5" />
            </SimpleButton>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Botões de Tipo */}
            <div>
              <label className="text-gray-300 mb-2 block font-medium">Tipo de Lançamento</label>
              <div className="flex gap-3">
                <SimpleButton 
                    type="button" 
                    onClick={() => updateFormData('type', 'expense')}
                    className={`flex-1 p-3 rounded-md border text-center ${
                        modalFormData.type === 'expense' 
                            ? "bg-red-700 border-red-700 text-white shadow-xl focus:ring-red-500" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                    <ArrowDown className="w-4 h-4 mr-2 inline-block"/> Despesa
                </SimpleButton>

                <SimpleButton 
                    type="button" 
                    onClick={() => updateFormData('type', 'income')}
                    className={`flex-1 p-3 rounded-md border text-center ${
                        modalFormData.type === 'income' 
                            ? "bg-green-700 border-green-700 text-white shadow-xl focus:ring-green-500" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                    <ArrowUp className="w-4 h-4 mr-2 inline-block"/> Receita
                </SimpleButton>
              </div>
            </div>
            
            {/* Valor e Descrição */}
            <div>
              <label htmlFor="amount" className="text-gray-300 font-medium">Valor (R$)</label>
              <input
                id="amount"
                type="text"
                value={modalFormData.amount}
                onChange={(e) => updateFormData('amount', e.target.value.replace(/[^0-9,.]/g, ''))} 
                className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-gray-300 font-medium">Descrição/Categoria</label>
              <input
                id="description"
                value={modalFormData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Aluguel, Salário, Uber"
              />
            </div>

            {/* Seletor de Cor Customizada */}
            <div>
              <label className="text-gray-300 mb-3 block font-medium">Cor de Destaque</label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => updateFormData('color', c.value)}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all shadow-md
                      ${c.value} 
                      ${modalFormData.color === c.value 
                        ? "border-white ring-2 ring-offset-2 ring-offset-gray-900" 
                        : "border-transparent opacity-60 hover:opacity-100"
                      }
                    `}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Data */}
            <div>
              <label htmlFor="date-input" className="text-gray-300 font-medium">Data</label>
              <div className="relative mt-1">
                <input
                    id="date-input"
                    type="date"
                    value={modalFormData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                />
                <CalendarIcon className="h-4 w-4 absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800 mt-4">
              <SimpleButton
                onClick={closeModal}
                className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 focus:ring-gray-600"
              >
                Cancelar
              </SimpleButton>
              <SimpleButton 
                onClick={handleSaveExpense} 
                className={`text-white focus:ring-blue-500 ${isEditing ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isEditing ? (
                    <><Edit className="w-4 h-4 mr-2 inline-block" /> Atualizar Lançamento</>
                ) : (
                    <><DollarSign className="w-4 h-4 mr-2 inline-block" /> Salvar Lançamento</>
                )}
              </SimpleButton>
            </div>
            
            {isEditing && (
                <div className='flex justify-start pt-2'>
                    <SimpleButton 
                        // Agora, chama handleDeleteExpense que abre o modal de confirmação
                        onClick={() => handleDeleteExpense(modalFormData.id!)} 
                        className='bg-red-900 border border-red-700 text-red-300 hover:bg-red-800 focus:ring-red-600'
                    >
                        <X className="w-4 h-4 mr-2 inline-block" /> Excluir permanentemente
                    </SimpleButton>
                </div>
            )}
            
          </div>
        </div>
      </div>
    );
  }

  const renderConfirmationModal = () => {
    if (!isConfirmModalOpen || expenseToDeleteId === null) return null;
    
    const expenseToConfirm = expenses.find(e => e.id === expenseToDeleteId);
    
    if (!expenseToConfirm) {
        closeConfirmModal(); // Se o ID não for encontrado, fecha o modal
        return null;
    }

    const { description, amount, type, date } = expenseToConfirm;

    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-700 text-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
          
          <div className="flex items-center text-red-400 mb-4">
            <X className="w-6 h-6 mr-2 bg-red-800/50 rounded-full p-1"/>
            <h3 className="text-xl font-bold">Confirmação de Exclusão</h3>
          </div>
          
          <p className="mb-4 text-gray-300">
            Você tem certeza que deseja **excluir** o seguinte lançamento? Esta ação não pode ser desfeita.
          </p>
          
          <div className="p-3 bg-gray-800 rounded-lg mb-6 border border-gray-700">
            <p className="font-semibold text-lg truncate mb-1">{description}</p>
            <p className={`text-sm font-medium ${type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {type === 'income' ? 'RECEITA' : 'DESPESA'}: R${amount.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
                Data: {format(date, 'dd/MM/yyyy')}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <SimpleButton
              onClick={closeConfirmModal}
              className="bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500"
            >
              Cancelar
            </SimpleButton>
            <SimpleButton 
              onClick={confirmDeletion} 
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              Sim, Excluir
            </SimpleButton>
          </div>
        </div>
      </div>
    );
  }

  // --- Renderização Principal ---

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-8 font-['Inter']">
      <div className="p-6 w-full shadow-2xl rounded-xl bg-gray-900 border border-gray-800 max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
            <h1 className="text-3xl font-extrabold text-white flex items-center mb-3 md:mb-0">
                <CalendarIcon className="w-7 h-7 mr-3 text-blue-500"/>
                Minhas Finanças Pro
            </h1>
            {/* NOVO BOTÃO DE EXPORTAR */}
            <SimpleButton 
                onClick={handleExportCSV} 
                className="bg-green-700 hover:bg-green-800 text-white focus:ring-green-500"
            >
                <Download className="w-4 h-4 mr-2 inline-block" /> Exportar para Planilha (.csv)
            </SimpleButton>
        </div>
        
        {/* Componente Modularizado de Resumo */}
        <TotalSummary summary={monthlySummary} />

        {/* Componente Modularizado do Gráfico */}
        <MonthlyAreaChart data={chartData} />
        
        {/* Componente Modularizado do Calendário */}
        <CalendarView 
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            expenses={expenses}
            setCurrentMonth={setCurrentMonth}
            setSelectedDate={setSelectedDate}
            handleDeleteExpense={handleDeleteExpense}
            openModalForDate={openModalForDate}
            openModalForEdit={openModalForEdit}
        />
        
        {/* Renderiza o Modal de Adição/Edição */}
        {renderModal()}
        
        {/* Renderiza o Modal de Confirmação de Exclusão */}
        {renderConfirmationModal()}
      </div>
    </div>
  )
}
