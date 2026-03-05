package com.expensetracker.backend.expense;

import jakarta.validation.constraints.NotBlank;

public record ExpenseMessage(
        @NotBlank String expenseId,
        @NotBlank String imageUrl
) {
}
