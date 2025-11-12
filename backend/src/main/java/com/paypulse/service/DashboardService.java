package com.paypulse.service;

import com.paypulse.dto.DashboardSummaryDto;
import com.paypulse.dto.ExpenseResponse;
import com.paypulse.dto.SavingsGoalResponse;
import com.paypulse.entity.Category;
import com.paypulse.entity.User;
import com.paypulse.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final SavingsGoalService savingsGoalService;
    private final ExpenseService expenseService;
    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(SavingsGoalService savingsGoalService,
                            ExpenseService expenseService,
                            CategoryRepository categoryRepository,
                            CurrentUserService currentUserService) {
        this.savingsGoalService = savingsGoalService;
        this.expenseService = expenseService;
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
    }

    public DashboardSummaryDto getSummary() {
        BigDecimal totalSavings = savingsGoalService.totalSavings();
        LocalDate today = LocalDate.now();
        YearMonth yearMonth = YearMonth.from(today);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        BigDecimal totalSpentThisMonth = expenseService.sumForRange(monthStart, monthEnd);
        BigDecimal totalSpentToday = expenseService.sumForDate(today);

        List<SavingsGoalResponse> goals = savingsGoalService.listGoals();
        List<SavingsGoalResponse> goalsPreview = goals.stream()
                .limit(2)
                .collect(Collectors.toList());

        User user = currentUserService.getCurrentUser();

        Map<String, BigDecimal> spendingByCategory = new LinkedHashMap<>();
        List<Category> categories = categoryRepository.findAllByUserOrderByNameAsc(user);
        for (Category category : categories) {
            BigDecimal spent = expenseService.sumForCategoryAndRange(category, monthStart, monthEnd);
            if (spent.compareTo(BigDecimal.ZERO) > 0) {
                spendingByCategory.put(category.getName(), spent);
            }
        }

        List<ExpenseResponse> recentExpenses = expenseService.listExpenses().stream()
                .limit(5)
                .collect(Collectors.toList());

        return new DashboardSummaryDto(
                totalSavings,
                totalSpentThisMonth,
                totalSpentToday,
                goals.size(),
                goalsPreview,
                spendingByCategory,
                recentExpenses
        );
    }
}

