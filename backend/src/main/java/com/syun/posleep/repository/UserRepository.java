package com.syun.posleep.repository;

import com.syun.posleep.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByName(String name);

    Optional<User> findByName(String name);
}
