package com.paypulse.service;

import com.paypulse.dto.CategoryDto;
import com.paypulse.entity.Category;
import com.paypulse.entity.User;
import com.paypulse.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    public CategoryService(CategoryRepository categoryRepository,
                           CurrentUserService currentUserService) {
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
    }

    public List<CategoryDto> listCategories() {
        User user = currentUserService.getCurrentUser();
        return categoryRepository.findAllByUserOrderByNameAsc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        User user = currentUserService.getCurrentUser();
        categoryRepository.findByUserAndNameIgnoreCase(user, dto.getName())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Category with the same name already exists");
                });
        Category category = new Category();
        category.setName(dto.getName());
        category.setColorHex(dto.getColorHex() != null ? dto.getColorHex() : "#4F46E5");
        category.setIconName(dto.getIconName() != null ? dto.getIconName() : "Receipt");
        category.setUser(user);
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, CategoryDto dto) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryRepository.findById(id)
                .filter(cat -> cat.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        category.setName(dto.getName());
        if (dto.getColorHex() != null) {
            category.setColorHex(dto.getColorHex());
        }
        if (dto.getIconName() != null) {
            category.setIconName(dto.getIconName());
        }
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryRepository.findById(id)
                .filter(cat -> cat.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        if (!category.getExpenses().isEmpty() || !category.getBudgets().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with linked expenses or budgets");
        }
        categoryRepository.delete(category);
    }

    public Category getCategoryForCurrentUser(UUID id) {
        User user = currentUserService.getCurrentUser();
        return categoryRepository.findById(id)
                .filter(cat -> cat.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
    }

    private CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setColorHex(category.getColorHex());
        dto.setIconName(category.getIconName());
        return dto;
    }
}

