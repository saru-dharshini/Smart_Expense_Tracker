package com.paypulse.service;

import com.paypulse.dto.BudgetRequest;
import com.paypulse.dto.BudgetResponse;
import com.paypulse.entity.Budget;
import com.paypulse.entity.Category;
import com.paypulse.entity.User;
import com.paypulse.repository.BudgetRepository;
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
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CurrentUserService currentUserService;
    private final CategoryService categoryService;
    private final ExpenseService expenseService;

    public BudgetService(BudgetRepository budgetRepository,
                         CurrentUserService currentUserService,
                         CategoryService categoryService,
                         ExpenseService expenseService) {
        this.budgetRepository = budgetRepository;
        this.currentUserService = currentUserService;
        this.categoryService = categoryService;
        this.expenseService = expenseService;
    }

    public List<BudgetResponse> listBudgets() {
        User user = currentUserService.getCurrentUser();
        return budgetRepository.findAllByUserOrderByStartDateDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse saveBudget(BudgetRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.getCategoryForCurrentUser(request.getCategoryId());
        Budget budget = request.getId() != null
                ? budgetRepository.findById(request.getId())
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Budget not found"))
                : new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setName(request.getName());
        budget.setTotalAmount(request.getTotalAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setRecurringMonthly(request.isRecurringMonthly());
        return toDto(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(UUID id) {
        User user = currentUserService.getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponse toDto(Budget budget) {
        LocalDate today = LocalDate.now();
        LocalDate start = budget.getStartDate();
        LocalDate end = budget.getEndDate();
        if (today.isBefore(start)) {
            today = start;
        }
        if (today.isAfter(end)) {
            today = end;
        }
        BigDecimal spent = expenseService.sumForCategoryAndRange(
                budget.getCategory(),
                budget.getStartDate(),
                budget.getEndDate()
        );
        BigDecimal remaining = budget.getTotalAmount().subtract(spent).max(BigDecimal.ZERO);
        long daysLeft = ChronoUnit.DAYS.between(today, budget.getEndDate()) + 1;
        if (daysLeft < 1) {
            daysLeft = 1;
        }
        BigDecimal dailyBudget = remaining.divide(BigDecimal.valueOf(daysLeft), 3, RoundingMode.HALF_UP);
        int completion = budget.getTotalAmount().compareTo(BigDecimal.ZERO) == 0
                ? 0
                : spent.multiply(BigDecimal.valueOf(100))
                .divide(budget.getTotalAmount(), 0, RoundingMode.HALF_UP)
                .intValue();

        return new BudgetResponse(
                budget.getId(),
                budget.getName(),
                budget.getTotalAmount(),
                budget.getStartDate(),
                budget.getEndDate(),
                budget.isRecurringMonthly(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                spent,
                remaining,
                dailyBudget,
                completion
        );
    }
}

