package com.syun.posleep.repository;

import com.syun.posleep.domain.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {

    Ingredient findFirstById(Integer id);

    Optional<Ingredient> findByName(String name);

    @Modifying
    @Query(value = """
        INSERT INTO user_ingredient (user_id, ingredient_id, quantity, is_registered)
        SELECT  :userId,
                i.id,
                0,
                0
        FROM ingredient i
    """, nativeQuery = true)
    void initForUser(@Param("userId") Integer userId);
}
