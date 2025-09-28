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
import { Calendar as CalendarIcon, DollarSign, ArrowDown, ArrowUp, X } from 'lucide-react'

// --- 1. Tipagem e Configuração ---

type TransactionType = 'expense' | 'income';

interface Expense {
  id: number
  date: Date
  amount: number
  description: string
  type: TransactionType
  color: string // Cor dinâmica (ex: bg-red-600)
}

interface MonthlySummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    monthName: string;
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
  // Cria a data no fuso horário LOCAL, definindo a hora para 12h.
  const correctedDate = new Date(parts[0], parts[1] - 1, parts[2], 12); 
  return correctedDate;
}

// --- DADOS INICIAIS (Ficam em 2025, mas o app inicia no mês atual) ---
const initialExpenses: Expense[] = [
  // Outubro (Mês Principal para dados de teste)
  { id: 1, date: createCorrectedDate("2025-10-01"), amount: 600.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
  { id: 2, date: createCorrectedDate("2025-10-05"), amount: 5500.0, description: "Salário Mensal", type: 'income', color: "bg-green-600" },
  { id: 3, date: createCorrectedDate("2025-10-05"), amount: 150.0, description: "Supermercado", type: 'expense', color: "bg-yellow-600" },
  { id: 4, date: createCorrectedDate("2025-10-10"), amount: 55.50, description: "Cinema e Pipoca", type: 'expense', color: "bg-blue-600" },
  { id: 5, date: createCorrectedDate("2025-10-15"), amount: 300.0, description: "Venda Freelancer", type: 'income', color: "bg-purple-600" },
  { id: 6, date: createCorrectedDate("2025-10-15"), amount: 25.0, description: "Padaria", type: 'expense', color: "bg-red-600" },
  { id: 7, date: createCorrectedDate("2025-10-22"), amount: 120.0, description: "Plano de Saúde", type: 'expense', color: "bg-pink-600" },
  { id: 8, date: createCorrectedDate("2025-10-22"), amount: 450.0, description: "Consultoria", type: 'income', color: "bg-green-700" },
  { id: 9, date: createCorrectedDate("2025-10-28"), amount: 35.0, description: "Conta de Luz", type: 'expense', color: "bg-blue-800" },
  { id: 10, date: createCorrectedDate("2025-09-28"), amount: 200.0, description: "Reembolso", type: 'income', color: "bg-yellow-700" },
  { id: 11, date: createCorrectedDate("2025-09-01"), amount: 600.0, description: "Aluguel", type: 'expense', color: "bg-red-700" },
  { id: 12, date: createCorrectedDate("2025-09-05"), amount: 5500.0, description: "Salário Mensal", type: 'income', color: "bg-green-600" },
  { id: 13, date: createCorrectedDate("2025-10-05"), amount: 150.0, description: "Supermercado", type: 'expense', color: "bg-yellow-600" },
  { id: 14, date: createCorrectedDate("2025-10-10"), amount: 55.50, description: "Cinema e Pipoca", type: 'expense', color: "bg-blue-600" },
  { id: 15, date: createCorrectedDate("2025-10-15"), amount: 300.0, description: "Venda Freelancer", type: 'income', color: "bg-purple-600" },
  { id: 16, date: createCorrectedDate("2025-10-15"), amount: 25.0, description: "Padaria", type: 'expense', color: "bg-red-600" },
  { id: 17, date: createCorrectedDate("2025-10-22"), amount: 120.0, description: "Plano de Saúde", type: 'expense', color: "bg-pink-600" },
  { id: 18, date: createCorrectedDate("2025-10-22"), amount: 450.0, description: "Consultoria", type: 'income', color: "bg-green-700" },
  { id: 19, date: createCorrectedDate("2025-10-28"), amount: 35.0, description: "Conta de Luz", type: 'expense', color: "bg-blue-800" },
  { id: 20, date: createCorrectedDate("2025-10-28"), amount: 200.0, description: "Reembolso", type: 'income', color: "bg-yellow-700" },

  // Setembro (Mês Anterior)
  { id: 11, date: createCorrectedDate("2025-09-28"), amount: 75.0, description: "Jantar", type: 'expense', color: "bg-red-500" },
  
  // Novembro (Próximo Mês)
  { id: 12, date: createCorrectedDate("2025-11-01"), amount: 120.0, description: "Internet", type: 'expense', color: "bg-blue-500" },
];

// Componente Button Simples (Evitando dependências externas)
const SimpleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
  >
    {children}
  </button>
);

// --- 2. Componente Resumo Total (Agora com filtro mensal) ---

const TotalSummary: React.FC<{ summary: MonthlySummary }> = ({ summary }) => {
  const { totalIncome, totalExpense, balance, monthName } = summary;

  const formatCurrency = (amount: number) => 
    `R$${amount.toFixed(2).replace('.', ',')}`;
    
  // Capitaliza a primeira letra do nome do mês para exibição
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


// --- 3. Componente Principal ---

export default function ExpenseCalendar(): React.ReactElement {
  // ATUALIZAÇÃO 1: Inicia no mês/dia atual
  const [currentMonth, setCurrentMonth] = useState(new Date()) 
  const [selectedDate, setSelectedDate] = useState(new Date()) 

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAmount, setNewAmount] = useState<string>("")
  const [newDescription, setNewDescription] = useState("")
  // Usa o formato 'yyyy-MM-dd' para o input type="date"
  const [newDate, setNewDate] = useState(format(selectedDate, "yyyy-MM-dd")) 
  const [newType, setNewType] = useState<TransactionType>('expense') 
  const [newColor, setNewColor] = useState(colorOptions[0].value) 
  
  // ATUALIZAÇÃO 2: Calcula o resumo financeiro APENAS para o mês atual
  const monthlySummary = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Filtra as despesas que estão DENTRO do mês atual, incluindo os limites do mês
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


  const handleAddExpense = () => {
    // Substitui vírgula por ponto para garantir que parseFloat funcione corretamente.
    const amountFloat = parseFloat(newAmount.replace(",", ".")) 
    
    // Simples feedback de erro no console
    if (newDescription.trim() === "" || isNaN(amountFloat) || amountFloat <= 0) {
      console.error("Erro: Por favor, insira um valor e uma descrição válidos.")
      return
    }

    const newExpense: Expense = {
      id: Date.now(),
      amount: amountFloat,
      description: newDescription,
      date: createCorrectedDate(newDate), 
      type: newType,
      color: newColor,
    }

    setExpenses((prev) => [...prev, newExpense])
    
    // Limpar e fechar
    setNewAmount("")
    setNewDescription("")
    setNewType('expense')
    setNewColor(colorOptions[0].value)
    setIsModalOpen(false)
  }
  
  const openModalForDate = (date: Date) => {
    setSelectedDate(date)
    setNewDate(format(date, "yyyy-MM-dd"))
    setNewType('expense') 
    setNewColor(colorOptions[0].value) 
    setIsModalOpen(true)
  }


  // --- Renderização do Cabeçalho do Calendário ---

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-2 pb-4 border-b border-gray-800 text-white">
      <div className="flex items-center gap-2">
        {/* Navegação Esquerda */}
        <SimpleButton
          className="h-8 w-8 text-gray-400 hover:bg-gray-700 bg-transparent hover:text-white p-0 focus:ring-gray-600"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          {"<"}
        </SimpleButton>
        <h2 className="text-xl font-medium w-48 text-left capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        {/* Navegação Direita */}
        <SimpleButton
          className="h-8 w-8 text-gray-400 hover:bg-gray-700 bg-transparent hover:text-white p-0 focus:ring-gray-600"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          {">"}
        </SimpleButton>
      </div>
      {/* Botão Novo Lançamento */}
      <SimpleButton 
        // Abre o modal para a data selecionada atualmente (ou hoje se for a primeira vez)
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
    // Começa no Domingo (0)
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
        
        // Filtra os lançamentos para o dia atual
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
            
            {/* Exibe as notas do dia como BLOCOS COLORIDOS - Com valor e sinal */}
            <div className="flex flex-col gap-1 w-full mt-1">
                {/* Mostra até 3 itens */}
                {dayExpenses.slice(0, 3).map((event, idx) => (
                    <div
                        key={idx}
                        className={`text-[11px] text-white px-1 py-[2px] rounded-sm truncate w-full shadow-md flex justify-between items-center ${event.color} transition-opacity hover:opacity-100 opacity-90`}
                        title={`${event.description} | ${event.type === 'income' ? 'Receita' : 'Despesa'}: R$${event.amount.toFixed(2).replace('.', ',')}`}
                    >
                        <span className="truncate">{event.description}</span>
                        {/* Exibe o valor com sinal */}
                        <span className="font-semibold ml-2 flex-shrink-0">
                            {event.type === 'income' ? '+' : '-'}R$ {event.amount.toFixed(2).replace('.', ',')}
                        </span>
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

  // --- 4. Modal de Adição (PURO REACT/TAILWIND) ---

  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      // Overlay do Modal (fixed inset-0)
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        {/* Conteúdo do Modal */}
        <div className="bg-gray-900 border border-gray-700 text-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          
          {/* Header do Modal */}
          <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4 sticky top-0 bg-gray-900 z-10">
            <h3 className="text-xl text-white font-bold">
              Novo Lançamento em {format(selectedDate, "dd/MM/yyyy")}
            </h3>
            <SimpleButton 
              onClick={() => setIsModalOpen(false)} 
              className="bg-transparent text-gray-400 hover:text-white p-1 h-auto w-auto focus:ring-gray-600"
            >
              <X className="w-5 h-5" />
            </SimpleButton>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Botões de Tipo: Receita/Despesa */}
            <div>
              <label className="text-gray-300 mb-2 block font-medium">
                Tipo de Lançamento
              </label>
              <div className="flex gap-3">
                
                {/* Botão de Despesa */}
                <SimpleButton 
                    type="button" 
                    onClick={() => setNewType('expense')}
                    className={`flex-1 p-3 rounded-md border text-center ${
                        newType === 'expense' 
                            ? "bg-red-700 border-red-700 text-white shadow-xl focus:ring-red-500" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                    <ArrowDown className="w-4 h-4 mr-2 inline-block"/> Despesa
                </SimpleButton>

                {/* Botão de Receita */}
                <SimpleButton 
                    type="button" 
                    onClick={() => setNewType('income')}
                    className={`flex-1 p-3 rounded-md border text-center ${
                        newType === 'income' 
                            ? "bg-green-700 border-green-700 text-white shadow-xl focus:ring-green-500" 
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                    <ArrowUp className="w-4 h-4 mr-2 inline-block"/> Receita
                </SimpleButton>
              </div>
            </div>
            
            {/* Valor e Descrição (Input com estilo Tailwind) */}
            <div>
              <label htmlFor="amount" className="text-gray-300 font-medium">Valor (R$)</label>
              <input
                id="amount"
                type="text"
                value={newAmount}
                // Permite apenas números, vírgulas ou pontos
                onChange={(e) => setNewAmount(e.target.value.replace(/[^0-9,.]/g, ''))} 
                className="w-full mt-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-gray-300 font-medium">Descrição/Categoria</label>
              <input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
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
                    onClick={() => setNewColor(c.value)}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all shadow-md
                      ${c.value} 
                      ${newColor === c.value 
                        ? "border-white ring-2 ring-offset-2 ring-offset-gray-900" 
                        : "border-transparent opacity-60 hover:opacity-100"
                      }
                    `}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Data (Input com estilo Tailwind) */}
            <div>
              <label htmlFor="date-input" className="text-gray-300 font-medium">Data</label>
              <div className="relative mt-1">
                <input
                    id="date-input"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                />
                <CalendarIcon className="h-4 w-4 absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800 mt-4">
              <SimpleButton
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 focus:ring-gray-600"
              >
                Cancelar
              </SimpleButton>
              <SimpleButton onClick={handleAddExpense} className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500">
                <DollarSign className="w-4 h-4 mr-2 inline-block" /> Salvar Lançamento
              </SimpleButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Renderização Principal ---

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-8 font-['Inter']">
      {/* Div Principal com estilo de Card */}
      <div className="p-6 w-full shadow-2xl rounded-xl bg-gray-900 border border-gray-800 max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-extrabold text-white mb-6 flex items-center">
            <CalendarIcon className="w-7 h-7 mr-3 text-blue-500"/>
            Minhas Finanças
        </h1>
        
        {/* Adiciona o Resumo Total, agora filtrado pelo mês */}
        <TotalSummary summary={monthlySummary} />
        
        {/* Renderiza o Calendário */}
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        
        {/* Renderiza o Modal */}
        {renderModal()}
      </div>
    </div>
  )
}
