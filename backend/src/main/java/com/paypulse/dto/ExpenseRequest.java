package com.paypulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ExpenseRequest {

    private UUID id;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private LocalDate expenseDate;

    private String merchant;

    private String note;

    @NotNull
    private UUID categoryId;

    private UUID savingsGoalId;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getSavingsGoalId() {
        return savingsGoalId;
    }

    public void setSavingsGoalId(UUID savingsGoalId) {
        this.savingsGoalId = savingsGoalId;
    }
}

