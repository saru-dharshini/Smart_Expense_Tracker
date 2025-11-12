package com.paypulse.controller;

import com.paypulse.dto.ExpenseRequest;
import com.paypulse.dto.ExpenseResponse;
import com.paypulse.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> listExpenses() {
        return ResponseEntity.ok(expenseService.listExpenses());
    }

    @GetMapping("/range")
    public ResponseEntity<List<ExpenseResponse>> listExpensesForRange(@RequestParam LocalDate start,
                                                                      @RequestParam LocalDate end) {
        return ResponseEntity.ok(expenseService.listExpensesForRange(start, end));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        request.setId(null);
        return ResponseEntity.ok(expenseService.saveExpense(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable UUID id,
                                                         @Valid @RequestBody ExpenseRequest request) {
        request.setId(id);
        return ResponseEntity.ok(expenseService.saveExpense(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}

