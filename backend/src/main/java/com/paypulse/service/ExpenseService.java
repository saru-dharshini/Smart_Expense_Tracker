package com.paypulse.service;

import com.paypulse.dto.ExpenseRequest;
import com.paypulse.dto.ExpenseResponse;
import com.paypulse.entity.Category;
import com.paypulse.entity.Expense;
import com.paypulse.entity.SavingsGoal;
import com.paypulse.entity.User;
import com.paypulse.repository.ExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CurrentUserService currentUserService;
    private final CategoryService categoryService;
    private final SavingsGoalService savingsGoalService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CurrentUserService currentUserService,
                          CategoryService categoryService,
                          SavingsGoalService savingsGoalService) {
        this.expenseRepository = expenseRepository;
        this.currentUserService = currentUserService;
        this.categoryService = categoryService;
        this.savingsGoalService = savingsGoalService;
    }

    public List<ExpenseResponse> listExpenses() {
        User user = currentUserService.getCurrentUser();
        return expenseRepository.findAllByUserOrderByExpenseDateDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse saveExpense(ExpenseRequest request) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryService.getCategoryForCurrentUser(request.getCategoryId());
        Expense expense = request.getId() != null
                ? expenseRepository.findById(request.getId())
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"))
                : new Expense();

        BigDecimal previousAmount = expense.getAmount() == null ? BigDecimal.ZERO : expense.getAmount();
        SavingsGoal previousGoal = expense.getSavingsGoal();
        SavingsGoal newGoal = null;
        if (request.getSavingsGoalId() != null) {
            newGoal = savingsGoalService.getGoalForCurrentUser(request.getSavingsGoalId());
        }

        expense.setUser(user);
        expense.setCategory(category);
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setMerchant(request.getMerchant());
        expense.setNote(request.getNote());
        expense.setSavingsGoal(newGoal);

        Expense savedExpense = expenseRepository.save(expense);

        if (previousGoal != null && (newGoal == null || !previousGoal.getId().equals(newGoal.getId()))) {
            savingsGoalService.adjustSavedAmount(previousGoal.getId(), previousAmount.negate());
        }
        if (newGoal != null) {
            BigDecimal delta = request.getAmount();
            if (previousGoal != null && previousGoal.getId().equals(newGoal.getId())) {
                delta = request.getAmount().subtract(previousAmount);
            }
            if (delta.compareTo(BigDecimal.ZERO) != 0) {
                savingsGoalService.adjustSavedAmount(newGoal.getId(), delta);
            }
        }

        return toDto(savedExpense);
    }

    @Transactional
    public void deleteExpense(UUID id) {
        User user = currentUserService.getCurrentUser();
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        SavingsGoal savingsGoal = expense.getSavingsGoal();
        BigDecimal amount = expense.getAmount();
        expenseRepository.delete(expense);
        if (savingsGoal != null && amount != null) {
            savingsGoalService.adjustSavedAmount(savingsGoal.getId(), amount.negate());
        }
    }

    public BigDecimal sumForRange(LocalDate start, LocalDate end) {
        User user = currentUserService.getCurrentUser();
        return expenseRepository.sumByUserAndDateRange(user, start, end);
    }

    public BigDecimal sumForDate(LocalDate date) {
        User user = currentUserService.getCurrentUser();
        return expenseRepository.sumByUserAndDate(user, date);
    }

    public BigDecimal sumForCategoryAndRange(Category category, LocalDate start, LocalDate end) {
        User user = currentUserService.getCurrentUser();
        return expenseRepository.sumByUserAndCategoryAndDateRange(user, category, start, end);
    }

    public List<ExpenseResponse> listExpensesForRange(LocalDate start, LocalDate end) {
        User user = currentUserService.getCurrentUser();
        return expenseRepository.findAllByUserAndExpenseDateBetweenOrderByExpenseDateDesc(user, start, end)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ExpenseResponse toDto(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getExpenseDate(),
                expense.getMerchant(),
                expense.getNote(),
                expense.getCategory().getId(),
                expense.getCategory().getName(),
                expense.getCategory().getColorHex(),
                expense.getSavingsGoal() != null ? expense.getSavingsGoal().getId() : null
        );
    }
}

