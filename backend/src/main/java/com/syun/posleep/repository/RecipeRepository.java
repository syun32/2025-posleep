package com.syun.posleep.repository;

import com.syun.posleep.domain.Recipe;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface RecipeRepository extends CrudRepository<Recipe, Integer> {

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE user_recipe
            SET is_registered = :isRegistered,
                is_target = :isTarget
            WHERE id = :id
                AND (is_registered <> :isRegistered OR is_target <> :isTarget)
                AND user_id = :userId
    """, nativeQuery = true)
    int updateFlags(@Param("id") Integer id,
                    @Param("isRegistered") boolean isRegistered,
                    @Param("isTarget") boolean isTarget,
                    @Param("userId") Integer userId);

    @Modifying
    @Query(value = """
            INSERT INTO user_recipe (user_id, recipe_id, is_registered, is_target)
            SELECT :userId,
                    r.id,
                    0,
                    0
            FROM recipe r
    """, nativeQuery = true)
    void initForUser(@Param("userId") Integer userId);
}
