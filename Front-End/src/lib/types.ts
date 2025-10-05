export type TransactionType = "expense" | "income";

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: TransactionType;
  color: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthName: string;
}

export interface ChartData {
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ExpenseFormData {
  id: string | null;
  amount: string;
  description: string;
  date: string; // yyyy-MM-dd
  type: TransactionType;
  color: string;
}