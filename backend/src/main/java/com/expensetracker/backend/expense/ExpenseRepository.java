package com.expensetracker.backend.expense;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends ListCrudRepository<Expense, String> {

    // Find all expenses for a user, ordered by creation date descending
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find an expense by its ID and user ID to ensure it belongs to the user
    Optional<Expense> findByIdAndUserId(String id, Long userId);

    // Find all expenses for a user with a specific status, ordered by creation date descending
    List<Expense> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, ExpenseStatus status);

    // Find all expenses with specific status
    List<Expense> findByStatus(ExpenseStatus status);

}
