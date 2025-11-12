package com.paypulse.repository;

import com.paypulse.entity.Budget;
import com.paypulse.entity.Category;
import com.paypulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findAllByUserOrderByStartDateDesc(User user);
    List<Budget> findAllByUserAndCategory(User user, Category category);
    List<Budget> findAllByUserAndStartDateLessThanEqualAndEndDateGreaterThanEqual(User user, LocalDate start, LocalDate end);
}

