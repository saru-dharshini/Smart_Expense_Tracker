package com.paypulse.controller;

import com.paypulse.dto.BudgetRequest;
import com.paypulse.dto.BudgetResponse;
import com.paypulse.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> listBudgets() {
        return ResponseEntity.ok(budgetService.listBudgets());
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody BudgetRequest request) {
        request.setId(null);
        return ResponseEntity.ok(budgetService.saveBudget(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(@PathVariable UUID id,
                                                       @Valid @RequestBody BudgetRequest request) {
        request.setId(id);
        return ResponseEntity.ok(budgetService.saveBudget(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}

