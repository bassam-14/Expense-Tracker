package com.expensetracker.backend.expense;

import java.util.Map;

public record ResultDto(
        String expenseId,
        Map<String, Object> extractedData // Holds Merchant, Total, Date, Category
) {
}
