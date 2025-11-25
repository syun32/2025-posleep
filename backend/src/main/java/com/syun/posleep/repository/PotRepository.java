package com.syun.posleep.repository;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PotRepository extends JpaRepository<Pot, Integer> {
    Optional<Pot> findFirstByUser(User user);

    Optional<Pot> findFirstByUserId(Integer userId);
}
