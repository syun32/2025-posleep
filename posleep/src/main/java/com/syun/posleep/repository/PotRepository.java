package com.syun.posleep.repository;

import com.syun.posleep.domain.Pot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PotRepository extends JpaRepository<Pot, Integer> {
    Optional<Pot> findFirstByOrderByIdAsc();
}
