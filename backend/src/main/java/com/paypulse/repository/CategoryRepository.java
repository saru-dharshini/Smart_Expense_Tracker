package com.paypulse.repository;

import com.paypulse.entity.Category;
import com.paypulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByUserOrderByNameAsc(User user);
    Optional<Category> findByUserAndNameIgnoreCase(User user, String name);
}

