import { useState, useMemo, useEffect, useCallback } from "react";
import { addMonths, subMonths, startOfMonth, isSameMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import axios from "axios";
import type { Expense } from "../lib/types.ts";
import { API_URL } from "../lib/constants.ts";
import { createLocalDayDate } from "../lib/dateUtils.ts";

export interface FinanceData {
  currentMonth: Date;
  selectedDate: Date;
  expenses: Expense[];
  monthlySummary: { totalIncome: number; totalExpense: number; balance: number; monthName: string };
  chartData: any[];

  // Setters e Funções de navegação para o componente CalendarView
  setSelectedDate: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  
  // Funções da API (expostas para uso no hook de formulário)
  fetchExpensesFromServer: () => Promise<Expense[]>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export function useFinanceData(): FinanceData {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date())); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // 1. API Helpers
  const fetchExpensesFromServer = useCallback(async (): Promise<Expense[]> => {
    const resp = await axios.get(API_URL);
    return resp.data.map((e: any) => ({
      id: e.id,
      date: createLocalDayDate(e.date), 
      amount: e.amount,
      description: e.description,
      type: e.type,
      color: e.color,
    }));
  }, []);

  // 2. Efeito de Carregamento Inicial
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchExpensesFromServer();
        if (mounted) {
          setExpenses(data);
        }
      } catch (err) {
        console.error("Erro ao carregar despesas:", err);
      }
    })();
    return () => { mounted = false; };
  }, [fetchExpensesFromServer]);

  // 3. Funções de Navegação (Agora usam useCallback para performance)
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  }, []);


  // 4. Aggregations (usando useMemo)
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

  return {
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
  };
}