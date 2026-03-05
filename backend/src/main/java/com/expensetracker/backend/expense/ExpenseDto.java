package com.expensetracker.backend.expense;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseDto(
        @NotBlank String merchant,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate date,
        @NotBlank String category
) {
}
