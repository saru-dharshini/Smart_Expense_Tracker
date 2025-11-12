package com.paypulse.repository;

import com.paypulse.entity.Category;
import com.paypulse.entity.Expense;
import com.paypulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findAllByUserOrderByExpenseDateDesc(User user);

    List<Expense> findAllByUserAndExpenseDateBetweenOrderByExpenseDateDesc(User user, LocalDate start, LocalDate end);

    List<Expense> findAllByUserAndCategoryAndExpenseDateBetween(User user, Category category, LocalDate start, LocalDate end);

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.user = :user and e.expenseDate between :start and :end")
    BigDecimal sumByUserAndDateRange(@Param("user") User user, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.user = :user and e.expenseDate = :date")
    BigDecimal sumByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.user = :user and e.category = :category and e.expenseDate between :start and :end")
    BigDecimal sumByUserAndCategoryAndDateRange(@Param("user") User user,
                                                @Param("category") Category category,
                                                @Param("start") LocalDate start,
                                                @Param("end") LocalDate end);
}

