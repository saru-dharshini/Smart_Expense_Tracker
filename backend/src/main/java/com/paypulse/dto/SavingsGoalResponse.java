package com.paypulse.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class SavingsGoalResponse {
    private UUID id;
    private String name;
    private String label;
    private BigDecimal targetAmount;
    private BigDecimal savedAmount;
    private BigDecimal remainingAmount;
    private int progressPercent;
    private LocalDate targetDate;
    private LocalDateTime createdAt;
    private long daysLeft;
    private BigDecimal dailyAmountNeeded;

    public SavingsGoalResponse(UUID id,
                               String name,
                               String label,
                               BigDecimal targetAmount,
                               BigDecimal savedAmount,
                               BigDecimal remainingAmount,
                               int progressPercent,
                               LocalDate targetDate,
                               LocalDateTime createdAt,
                               long daysLeft,
                               BigDecimal dailyAmountNeeded) {
        this.id = id;
        this.name = name;
        this.label = label;
        this.targetAmount = targetAmount;
        this.savedAmount = savedAmount;
        this.remainingAmount = remainingAmount;
        this.progressPercent = progressPercent;
        this.targetDate = targetDate;
        this.createdAt = createdAt;
        this.daysLeft = daysLeft;
        this.dailyAmountNeeded = dailyAmountNeeded;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public BigDecimal getSavedAmount() {
        return savedAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public long getDaysLeft() {
        return daysLeft;
    }

    public BigDecimal getDailyAmountNeeded() {
        return dailyAmountNeeded;
    }
}

