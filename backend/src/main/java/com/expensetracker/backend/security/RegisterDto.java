package com.expensetracker.backend.security;

import jakarta.validation.constraints.NotBlank;

public record RegisterDto(
        @NotBlank String username,
        @NotBlank String email,
        @NotBlank String password
) {
}
