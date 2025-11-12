package com.paypulse.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class BudgetResponse {
    private UUID id;
    private String name;
    private BigDecimal totalAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean recurringMonthly;
    private UUID categoryId;
    private String categoryName;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal dailyBudget;
    private int completionPercent;

    public BudgetResponse(UUID id,
                          String name,
                          BigDecimal totalAmount,
                          LocalDate startDate,
                          LocalDate endDate,
                          boolean recurringMonthly,
                          UUID categoryId,
                          String categoryName,
                          BigDecimal spentAmount,
                          BigDecimal remainingAmount,
                          BigDecimal dailyBudget,
                          int completionPercent) {
        this.id = id;
        this.name = name;
        this.totalAmount = totalAmount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.recurringMonthly = recurringMonthly;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.dailyBudget = dailyBudget;
        this.completionPercent = completionPercent;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public boolean isRecurringMonthly() {
        return recurringMonthly;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public BigDecimal getDailyBudget() {
        return dailyBudget;
    }

    public int getCompletionPercent() {
        return completionPercent;
    }
}

