package com.syun.posleep.repository;

import com.syun.posleep.domain.Recipe;
import com.syun.posleep.query.RecipeSheetRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeQueryRepository extends JpaRepository<Recipe, Integer> {

    @Query(value = """
        SELECT
            r.id                       AS id,
            r.is_target                AS isTarget,
            r.is_registered            AS isRegistered,
            r.category                 AS category,
            r.name                     AS name,

            i1.name                    AS ingredient1,
            COALESCE(ri1.quantity, 0)  AS need1,
            CASE
                WHEN i1.name IS NOT NULL AND ri1.quantity > i1.quantity
                THEN ri1.quantity - i1.quantity
                ELSE 0
            END AS req1,

            i2.name                    AS ingredient2,
            COALESCE(ri2.quantity, 0)  AS need2,
            CASE
                WHEN i2.name IS NOT NULL AND ri2.quantity > i2.quantity
                THEN ri2.quantity - i2.quantity
                ELSE 0
            END AS req2,

            i3.name                    AS ingredient3,
            COALESCE(ri3.quantity, 0)  AS need3,
            CASE
                WHEN i3.name IS NOT NULL AND ri3.quantity > i3.quantity
                THEN ri3.quantity - i3.quantity
                ELSE 0
            END AS req3,

            i4.name                    AS ingredient4,
            COALESCE(ri4.quantity, 0)  AS need4,
            CASE
                WHEN i4.name IS NOT NULL AND ri4.quantity > i4.quantity
                THEN ri4.quantity - i4.quantity
                ELSE 0
            END AS req4,

            r.total_quantity           AS totalQuantity
        FROM recipe r
        LEFT JOIN recipe_ingredient ri1 ON ri1.recipe_id = r.id AND ri1.position = 1
        LEFT JOIN ingredient        i1  ON i1.id          = ri1.ingredient_id

        LEFT JOIN recipe_ingredient ri2 ON ri2.recipe_id = r.id AND ri2.position = 2
        LEFT JOIN ingredient        i2  ON i2.id          = ri2.ingredient_id

        LEFT JOIN recipe_ingredient ri3 ON ri3.recipe_id = r.id AND ri3.position = 3
        LEFT JOIN ingredient        i3  ON i3.id          = ri3.ingredient_id

        LEFT JOIN recipe_ingredient ri4 ON ri4.recipe_id = r.id AND ri4.position = 4
        LEFT JOIN ingredient        i4  ON i4.id          = ri4.ingredient_id

        WHERE 
            (
                (:exceptRegistered = TRUE AND :orderByTarget = FALSE AND r.is_registered = 0)
                OR (:exceptRegistered = TRUE AND :orderByTarget = TRUE AND (r.is_registered = 0 or r.is_target = 1))
                OR (:exceptRegistered = FALSE)
            )
            AND (
                :selectedCategory IS NULL
                OR LOWER(:selectedCategory) = 'all'
                OR r.category = :selectedCategory
            )
        ORDER BY
            IF (:orderByTarget,    r.is_target,    0)  DESC,
            r.id
        """, nativeQuery = true)
    List<RecipeSheetRow> findRecipeSheet(
            @Param("exceptRegistered") boolean exceptRegistered,
            @Param("orderByTarget") boolean orderByTarget,
            @Param("selectedCategory")  String selectedCategory
    );
}
