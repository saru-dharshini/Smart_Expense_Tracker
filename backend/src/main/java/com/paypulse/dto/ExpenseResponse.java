package com.paypulse.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ExpenseResponse {
    private UUID id;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String merchant;
    private String note;
    private UUID categoryId;
    private String categoryName;
    private String categoryColor;
    private UUID savingsGoalId;

    public ExpenseResponse(UUID id,
                           BigDecimal amount,
                           LocalDate expenseDate,
                           String merchant,
                           String note,
                           UUID categoryId,
                           String categoryName,
                           String categoryColor,
                           UUID savingsGoalId) {
        this.id = id;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.merchant = merchant;
        this.note = note;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryColor = categoryColor;
        this.savingsGoalId = savingsGoalId;
    }

    public UUID getId() {
        return id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public String getMerchant() {
        return merchant;
    }

    public String getNote() {
        return note;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getCategoryColor() {
        return categoryColor;
    }

    public UUID getSavingsGoalId() {
        return savingsGoalId;
    }
}

