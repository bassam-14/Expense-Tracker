package com.expensetracker.backend.security;

import com.expensetracker.backend.user.User;
import com.expensetracker.backend.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserRepository repository;
    public CustomUserDetailsService(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.email())
                .password(user.password())
                .roles(user.role().name().replace("ROLE_", ""))
                .disabled(!user.enabled())
                .build();
    }
}
