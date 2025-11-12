package com.paypulse.repository;

import com.paypulse.entity.SavingsGoal;
import com.paypulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    List<SavingsGoal> findAllByUserOrderByCreatedAtDesc(User user);
}

