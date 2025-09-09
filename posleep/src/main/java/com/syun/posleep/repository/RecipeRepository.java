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
            UPDATE recipe
            SET is_registered = :isRegistered,
                is_target = :isTarget
            WHERE id = :id
                AND (is_registered <> :isRegistered OR is_target <> :isTarget)
    """, nativeQuery = true)
    int updateFlags(@Param("id") Integer id,
                    @Param("isRegistered") boolean isRegistered,
                    @Param("isTarget") boolean isTarget);
}
