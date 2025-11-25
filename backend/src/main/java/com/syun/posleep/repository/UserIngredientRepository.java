package com.syun.posleep.repository;

import com.syun.posleep.domain.Ingredient;
import com.syun.posleep.domain.User;
import com.syun.posleep.domain.UserIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserIngredientRepository extends JpaRepository<UserIngredient, Integer> {

    Optional<UserIngredient> findByUserAndIngredient(User user, Ingredient ingredient);

    List<UserIngredient> findByUser(User user);

    List<UserIngredient> findByUserId(Integer userId);

    Optional<UserIngredient> findByUserIdAndIngredientId(Integer userId, Integer ingredientId);
}
