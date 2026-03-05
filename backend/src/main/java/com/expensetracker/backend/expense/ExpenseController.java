package com.expensetracker.backend.expense;

import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseService expenseService,
                             UserRepository userRepository) {
        this.expenseService = expenseService;
        this.userRepository = userRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadReceipt(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Expense savedExpense = expenseService.processNewReceipt(user.userId(),
                file);

        return ResponseEntity.ok(savedExpense);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<?> getExpense(
            @PathVariable String expenseId,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Expense expense = expenseService.getExpenseByIdAndUserId(expenseId, user.userId());

        return ResponseEntity.ok(expense);
    }

    @PutMapping("/{expenseId}/confirm")
    public ResponseEntity<?> confirmExpense(
            @PathVariable String expenseId,
            @Valid @RequestBody ExpenseUpdateRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Expense confirmedExpense = expenseService.confirmExpense(expenseId, request, user.userId());

        return ResponseEntity.ok(confirmedExpense);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<Expense> expenses = expenseService.getAllExpensesForUser(user.userId());
        return ResponseEntity.ok(expenses);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable("expenseId") String expenseId,
                                           Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        expenseService.deleteExpense(expenseId, user.userId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<?> createExpense(@Valid @RequestBody ExpenseDto request,
                                           Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Expense newExpense = expenseService.createExpense(request, user.userId());
        return ResponseEntity.ok(newExpense);
    }
}
