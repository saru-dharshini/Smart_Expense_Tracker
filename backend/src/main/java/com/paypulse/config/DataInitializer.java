package com.paypulse.config;

import com.paypulse.entity.Budget;
import com.paypulse.entity.Category;
import com.paypulse.entity.Expense;
import com.paypulse.entity.SavingsGoal;
import com.paypulse.entity.User;
import com.paypulse.repository.BudgetRepository;
import com.paypulse.repository.CategoryRepository;
import com.paypulse.repository.ExpenseRepository;
import com.paypulse.repository.SavingsGoalRepository;
import com.paypulse.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDatabase(UserRepository userRepository,
                                   CategoryRepository categoryRepository,
                                   ExpenseRepository expenseRepository,
                                   SavingsGoalRepository savingsGoalRepository,
                                   BudgetRepository budgetRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmailIgnoreCase("saru.dharsh@gmail.com").isPresent()) {
                return;
            }

            User user = new User();
            user.setEmail("saru.dharsh@gmail.com");
            user.setFullName("saru.dharsh");
            user.setBaseCurrency("INR");
            user.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(user);

            Category bills = new Category();
            bills.setName("Bills");
            bills.setColorHex("#2563EB");
            bills.setIconName("Bill");
            bills.setUser(user);

            Category food = new Category();
            food.setName("Food");
            food.setColorHex("#F87171");
            food.setIconName("Food");
            food.setUser(user);

            categoryRepository.save(bills);
            categoryRepository.save(food);

            Expense expense1 = new Expense();
            expense1.setUser(user);
            expense1.setCategory(bills);
            expense1.setAmount(new BigDecimal("20000.00"));
            expense1.setExpenseDate(LocalDate.of(2025, 11, 2));
            expense1.setNote("-");

            Expense expense2 = new Expense();
            expense2.setUser(user);
            expense2.setCategory(bills);
            expense2.setAmount(new BigDecimal("120000.00"));
            expense2.setExpenseDate(LocalDate.of(2025, 10, 31));
            expense2.setNote("-");

            Expense expense3 = new Expense();
            expense3.setUser(user);
            expense3.setCategory(food);
            expense3.setAmount(new BigDecimal("20000.00"));
            expense3.setExpenseDate(LocalDate.of(2025, 10, 31));
            expense3.setNote("-");

            expenseRepository.save(expense1);
            expenseRepository.save(expense2);
            expenseRepository.save(expense3);

            SavingsGoal trip = new SavingsGoal();
            trip.setUser(user);
            trip.setName("trip");
            trip.setLabel("Vacation");
            trip.setTargetAmount(new BigDecimal("50000.00"));
            trip.setSavedAmount(new BigDecimal("15000.00"));
            trip.setTargetDate(LocalDate.of(2026, 10, 31));

            SavingsGoal clothes = new SavingsGoal();
            clothes.setUser(user);
            clothes.setName("clothes");
            clothes.setLabel("Other");
            clothes.setTargetAmount(new BigDecimal("10000.00"));
            clothes.setSavedAmount(new BigDecimal("7000.00"));
            clothes.setTargetDate(LocalDate.of(2025, 11, 8));

            savingsGoalRepository.save(trip);
            savingsGoalRepository.save(clothes);

            Budget foodBudget = new Budget();
            foodBudget.setUser(user);
            foodBudget.setCategory(food);
            foodBudget.setName("Food");
            foodBudget.setTotalAmount(new BigDecimal("10000.00"));
            foodBudget.setStartDate(LocalDate.of(2025, 11, 1));
            foodBudget.setEndDate(LocalDate.of(2025, 11, 30));
            foodBudget.setRecurringMonthly(true);

            budgetRepository.save(foodBudget);
        };
    }
}

