package com.syun.posleep.service;

import com.syun.posleep.domain.RecipeIngredient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class CookingService {

    private final RecipeService recipeService;
    private final IngredientService ingredientService;

    public CookingService(RecipeService recipeService, IngredientService ingredientService) {
        this.recipeService = recipeService;
        this.ingredientService = ingredientService;
    }

    @Transactional
    public void runCooking(Integer recipeId) {
        List<RecipeIngredient> recipeIngredientList = recipeService.findRecipeIngredient(recipeId);
        // 식재료 수량 확인 (부족 시 예외)
        ingredientService.ensureAllEnough(recipeIngredientList);
        // 식재료 차감
        ingredientService.decreaseByRecipe(recipeIngredientList);
    }
}
