package com.paypulse.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private BigDecimal totalSavings;
    private BigDecimal totalSpentThisMonth;
    private BigDecimal totalSpentToday;
    private int activeSavingsGoals;
    private List<SavingsGoalResponse> savingsGoalsPreview;
    private Map<String, BigDecimal> spendingByCategory;
    private List<ExpenseResponse> recentExpenses;

    public DashboardSummaryDto(BigDecimal totalSavings,
                               BigDecimal totalSpentThisMonth,
                               BigDecimal totalSpentToday,
                               int activeSavingsGoals,
                               List<SavingsGoalResponse> savingsGoalsPreview,
                               Map<String, BigDecimal> spendingByCategory,
                               List<ExpenseResponse> recentExpenses) {
        this.totalSavings = totalSavings;
        this.totalSpentThisMonth = totalSpentThisMonth;
        this.totalSpentToday = totalSpentToday;
        this.activeSavingsGoals = activeSavingsGoals;
        this.savingsGoalsPreview = savingsGoalsPreview;
        this.spendingByCategory = spendingByCategory;
        this.recentExpenses = recentExpenses;
    }

    public BigDecimal getTotalSavings() {
        return totalSavings;
    }

    public BigDecimal getTotalSpentThisMonth() {
        return totalSpentThisMonth;
    }

    public BigDecimal getTotalSpentToday() {
        return totalSpentToday;
    }

    public int getActiveSavingsGoals() {
        return activeSavingsGoals;
    }

    public List<SavingsGoalResponse> getSavingsGoalsPreview() {
        return savingsGoalsPreview;
    }

    public Map<String, BigDecimal> getSpendingByCategory() {
        return spendingByCategory;
    }

    public List<ExpenseResponse> getRecentExpenses() {
        return recentExpenses;
    }
}

