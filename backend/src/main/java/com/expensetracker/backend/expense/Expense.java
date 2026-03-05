package com.expensetracker.backend.expense;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("expenses")
public record Expense(
    @Id
    String id,
    @NotNull
    Long userId,
    String merchant,
    @Positive
    BigDecimal amount,
    LocalDate date,
    String category,
    @NotNull
    ExpenseStatus status,
    @NotBlank
    String imageUrl,
    LocalDateTime createdAt,
    @Version
    Integer version
) {
    public static Expense createPending(Long userId, String imageUrl){
        return new Expense(
                UUID.randomUUID().toString(),
                userId,
                null,
                null,
                null,
                null,
                ExpenseStatus.PENDING,
                imageUrl,
                LocalDateTime.now(),
                null
        );
    }
    public Expense updateWithExtractedData(String merchant, BigDecimal amount, LocalDate date, String category) {
        return new Expense(
                this.id(),
                this.userId(),
                merchant,
                amount,
                date,
                category,
                this.status(),
                this.imageUrl(),
                this.createdAt(),
                this.version()
        );
    }
    public static Expense createCompleted(Long userId, String merchant, BigDecimal amount, LocalDate date, String category) {
        return new Expense(
                java.util.UUID.randomUUID().toString(),
                userId,
                merchant,
                amount,
                date,
                category,
                ExpenseStatus.COMPLETED,
                "MANUAL",
                java.time.LocalDateTime.now(),
                null
        );
    }
}
