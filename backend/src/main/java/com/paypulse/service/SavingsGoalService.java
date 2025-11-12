package com.paypulse.service;

import com.paypulse.dto.SavingsGoalRequest;
import com.paypulse.dto.SavingsGoalResponse;
import com.paypulse.entity.SavingsGoal;
import com.paypulse.entity.User;
import com.paypulse.repository.SavingsGoalRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final CurrentUserService currentUserService;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository,
                              CurrentUserService currentUserService) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.currentUserService = currentUserService;
    }

    public List<SavingsGoalResponse> listGoals() {
        User user = currentUserService.getCurrentUser();
        return savingsGoalRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavingsGoalResponse saveGoal(SavingsGoalRequest request) {
        User user = currentUserService.getCurrentUser();
        SavingsGoal goal = request.getId() != null
                ? savingsGoalRepository.findById(request.getId())
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"))
                : new SavingsGoal();
        goal.setUser(user);
        goal.setName(request.getName());
        goal.setLabel(request.getLabel());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setSavedAmount(request.getSavedAmount());
        goal.setTargetDate(request.getTargetDate());
        return toDto(savingsGoalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(UUID id) {
        User user = currentUserService.getCurrentUser();
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .filter(g -> g.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        savingsGoalRepository.delete(goal);
    }

    public BigDecimal totalSavings() {
        return listGoals().stream()
                .map(SavingsGoalResponse::getSavedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public SavingsGoal getGoalForCurrentUser(UUID id) {
        User user = currentUserService.getCurrentUser();
        return savingsGoalRepository.findById(id)
                .filter(goal -> goal.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
    }

    @Transactional
    public void adjustSavedAmount(UUID goalId, BigDecimal delta) {
        if (delta == null || delta.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        SavingsGoal goal = getGoalForCurrentUser(goalId);
        BigDecimal updated = goal.getSavedAmount().add(delta);
        if (updated.compareTo(BigDecimal.ZERO) < 0) {
            updated = BigDecimal.ZERO;
        }
        goal.setSavedAmount(updated);
        savingsGoalRepository.save(goal);
    }

    private SavingsGoalResponse toDto(SavingsGoal goal) {
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getSavedAmount()).max(BigDecimal.ZERO);
        int progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) == 0
                ? 0
                : goal.getSavedAmount()
                .multiply(BigDecimal.valueOf(100))
                .divide(goal.getTargetAmount(), 0, RoundingMode.HALF_UP)
                .intValue();
        LocalDate today = LocalDate.now();
        long daysLeft = goal.getTargetDate() != null && goal.getTargetDate().isAfter(today)
                ? ChronoUnit.DAYS.between(today, goal.getTargetDate())
                : 0;
        BigDecimal dailyNeeded = (daysLeft > 0 && remaining.compareTo(BigDecimal.ZERO) > 0)
                ? remaining.divide(BigDecimal.valueOf(daysLeft), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new SavingsGoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getLabel(),
                goal.getTargetAmount(),
                goal.getSavedAmount(),
                remaining,
                progress,
                goal.getTargetDate(),
                goal.getCreatedAt(),
                daysLeft,
                dailyNeeded
        );
    }
}

