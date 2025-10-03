package com.syun.posleep.repository;

import com.syun.posleep.domain.Recipe;
import com.syun.posleep.query.IngredientSheetRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IngredientQueryRepository extends JpaRepository<Recipe, Integer> {

        @Query(value = """
        SELECT
            i.id                AS id,
            i.name              AS name,
            i.is_registered     AS isRegistered,
            i.quantity          AS quantity,
            t.sum_quantity      AS target_quantity
        FROM ingredient i
        LEFT OUTER JOIN (
                        SELECT
                            ri.ingredient_id	as ingredient_id,
                            SUM(quantity)		as sum_quantity
                        FROM recipe_ingredient ri
                        LEFT OUTER JOIN recipe r
                        ON ri.recipe_id = r.id
                        WHERE r.is_target
                            AND r.category = (SELECT category FROM pot WHERE id = 1)
                        GROUP BY ri.ingredient_id
                        ) AS t
        ON i.id = t.ingredient_id
        ORDER BY i.id
        """, nativeQuery = true)
        List<IngredientSheetRow> findIngredientSheet();
}
