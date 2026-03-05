package com.expensetracker.backend.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record User(
        @Id
        Long userId,
        @NotBlank
        String username,
        @NotBlank
        @Email
        String email,
        @NotBlank
        String password,
        Role role,
        boolean enabled,
        @Version
        Integer version
) {
        public static User create(String username, String email, String password) {
                return new User(
                        null,
                        username,
                        email,
                        password,
                        Role.ROLE_USER,
                        true,
                        null
                );
        }
}
