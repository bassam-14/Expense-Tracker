package com.expensetracker.backend.user;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends ListCrudRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);
}
