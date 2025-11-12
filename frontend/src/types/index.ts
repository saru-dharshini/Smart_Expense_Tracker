export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
}

export interface Category {
  id: string;
  name: string;
  colorHex?: string | null;
  iconName?: string | null;
}

export interface Expense {
  id: string;
  amount: number;
  expenseDate: string;
  merchant?: string | null;
  note?: string | null;
  categoryId: string;
  categoryName: string;
  categoryColor?: string | null;
  savingsGoalId?: string | null;
}

export interface ExpenseRequestPayload {
  id?: string;
  amount: number;
  expenseDate: string;
  merchant?: string;
  note?: string;
  categoryId: string;
  savingsGoalId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  label?: string | null;
  targetAmount: number;
  savedAmount: number;
  remainingAmount: number;
  progressPercent: number;
  targetDate?: string | null;
  createdAt: string;
  daysLeft: number;
  dailyAmountNeeded: number;
}

export interface SavingsGoalPayload {
  id?: string;
  name: string;
  label?: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string | null;
}

export interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  recurringMonthly: boolean;
  categoryId: string;
  categoryName: string;
  spentAmount: number;
  remainingAmount: number;
  dailyBudget: number;
  completionPercent: number;
}

export interface BudgetPayload {
  id?: string;
  name: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  recurringMonthly: boolean;
  categoryId: string;
}

export interface DashboardSummary {
  totalSavings: number;
  totalSpentThisMonth: number;
  totalSpentToday: number;
  activeSavingsGoals: number;
  savingsGoalsPreview: SavingsGoal[];
  spendingByCategory: Record<string, number>;
  recentExpenses: Expense[];
}

export interface Settings {
  baseCurrency: string;
  pinSet: boolean;
}

export interface SettingsUpdatePayload {
  baseCurrency: string;
  newPin?: string;
}

