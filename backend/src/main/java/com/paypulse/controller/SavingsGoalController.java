package com.paypulse.controller;

import com.paypulse.dto.SavingsGoalRequest;
import com.paypulse.dto.SavingsGoalResponse;
import com.paypulse.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> listGoals() {
        return ResponseEntity.ok(savingsGoalService.listGoals());
    }

    @PostMapping
    public ResponseEntity<SavingsGoalResponse> createGoal(@Valid @RequestBody SavingsGoalRequest request) {
        request.setId(null);
        return ResponseEntity.ok(savingsGoalService.saveGoal(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalResponse> updateGoal(@PathVariable UUID id,
                                                          @Valid @RequestBody SavingsGoalRequest request) {
        request.setId(id);
        return ResponseEntity.ok(savingsGoalService.saveGoal(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable UUID id) {
        savingsGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}

