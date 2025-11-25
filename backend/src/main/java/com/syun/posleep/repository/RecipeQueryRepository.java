package com.syun.posleep.repository;

import com.syun.posleep.domain.Recipe;
import com.syun.posleep.domain.RecipeIngredient;
import com.syun.posleep.query.RecipeSheetRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeQueryRepository extends JpaRepository<Recipe, Integer> {

    @Query(value = """
        SELECT
            r.id                        AS id,
            ur.is_target                AS isTarget,
            ur.is_registered            AS isRegistered,
            r.category                  AS category,
            r.name                      AS name,
        
            i1.name                     AS ingredient1,
            COALESCE(r.need1, 0)        AS need1,
            CASE
                WHEN i1.name IS NOT NULL AND r.need1 > ui1.quantity
                    THEN r.need1 - ui1.quantity
                ELSE 0
                END                     AS req1,
        
            i2.name                     AS ingredient2,
            COALESCE(r.need2, 0)        AS need2,
            CASE
                WHEN i2.name IS NOT NULL AND r.need2 > ui2.quantity
                    THEN r.need2 - ui2.quantity
                ELSE 0
                END                     AS req2,
        
            i3.name                     AS ingredient3,
            COALESCE(r.need3, 0)        AS need3,
            CASE
                WHEN i3.name IS NOT NULL AND r.need3 > ui3.quantity
                    THEN r.need3 - ui3.quantity
                ELSE 0
                END                     AS req3,
        
            i4.name                     AS ingredient4,
            COALESCE(r.need4, 0)        AS need4,
            CASE
                WHEN i4.name IS NOT NULL AND r.need4 > ui4.quantity
                    THEN r.need4 - ui4.quantity
                ELSE 0
                END                     AS req4,
        
            r.total_quantity            AS totalQuantity,
            r.energy                    AS energy
        FROM recipe r
                 LEFT JOIN user_ingredient  ui1     ON ui1.ingredient_id    = r.ingredient_id1      AND ui1.user_id = :userId
                 LEFT JOIN ingredient       i1      ON r.ingredient_id1     = i1.id
        
                 LEFT JOIN user_ingredient  ui2     ON ui2.ingredient_id    = r.ingredient_id2      AND ui2.user_id = :userId
                 LEFT JOIN ingredient       i2      ON r.ingredient_id2     = i2.id
        
                 LEFT JOIN user_ingredient  ui3     ON ui3.ingredient_id    = r.ingredient_id3      AND ui3.user_id = :userId
                 LEFT JOIN ingredient       i3      ON r.ingredient_id3     = i3.id
        
                 LEFT JOIN user_ingredient  ui4     ON ui4.ingredient_id    = r.ingredient_id4      AND ui4.user_id = :userId
                 LEFT JOIN ingredient       i4      ON r.ingredient_id4     = i4.id
        
                 LEFT JOIN user_recipe      ur      ON r.id = ur.recipe_id                          AND ur.user_id = :userId
        
        ORDER BY
            r.id
        """, nativeQuery = true)
    List<RecipeSheetRow> findRecipeSheet(Integer userId);

    @Query(value = """
        SELECT *
        FROM recipe_ingredient
        WHERE recipe_id = :recipeId
        """, nativeQuery = true)
    List<RecipeIngredient> findRecipeIngredient(@Param("recipeId") Integer recipeId);
}
