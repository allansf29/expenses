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
  isRecurrence: boolean;
  frequency: 'monthly' | 'weekly' | 'daily';
  installments: string;
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: Date | string;
  goalId: string;
  createdAt: Date | string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | string;
  isCompleted: boolean;
  createdAt: Date | string;
  contributions: GoalContribution[];
}

export interface GoalFormData {
  name: string;
  targetAmount: number | string;
  targetDate: Date;
}

export const colorOptions: { value: string; label: string; className: string }[] = [
  { value: "bg-red-600", label: "Vermelho", className: "bg-red-600" },
  { value: "bg-green-600", label: "Verde", className: "bg-green-600" },
  { value: "bg-yellow-600", label: "Amarelo", className: "bg-yellow-600" },
  { value: "bg-blue-600", label: "Azul", className: "bg-blue-600" },
  { value: "bg-purple-600", label: "Roxo", className: "bg-purple-600" },
  { value: "bg-pink-600", label: "Rosa", className: "bg-pink-600" },
];