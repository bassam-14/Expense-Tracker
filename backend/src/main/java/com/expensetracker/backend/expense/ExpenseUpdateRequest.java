package com.expensetracker.backend.expense;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseUpdateRequest(
        @NotBlank(message = "Merchant name is required")
        String merchant,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Date is required")
        LocalDate date,

        @NotBlank(message = "Category is required")
        String category
){}