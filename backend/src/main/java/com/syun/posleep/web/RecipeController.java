package com.syun.posleep.web;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.dto.request.RecipeForm;
import com.syun.posleep.dto.response.ApiResponse;
import com.syun.posleep.query.RecipeSheetRow;
import com.syun.posleep.service.CookingService;
import com.syun.posleep.service.RecipeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final CookingService cookingService;

    public RecipeController(RecipeService recipeService, CookingService cookingService) {
        this.recipeService = recipeService;
        this.cookingService = cookingService;
    }

    @GetMapping
    public ApiResponse<List<RecipeSheetRow>> getRecipes() {
        List<RecipeSheetRow> list = recipeService.findRecipeSheet();
        return ApiResponse.success(list);
    }

    @GetMapping("/pots")
    public ApiResponse<Pot> getPot() {
        Pot pot = recipeService.getSinglePotOrNull();
        return ApiResponse.success(pot);
    }

    @PostMapping(
            path = "/flags",
            consumes = "application/json"
    )
    public ResponseEntity<?> saveFlags(@RequestBody RecipeForm form) {
        int changed = recipeService.updateFlags(form);
        return ResponseEntity.ok(Map.of("changed", changed));
    }

    @PostMapping(
            path = "/pots",
            consumes = "application/json"
    )
    public ResponseEntity<?> savePot(@RequestBody Pot pot) {
        recipeService.updatePot(pot.getId(), pot.getCapacity(), pot.getIsCamping(), pot.getCategory());
        return ResponseEntity.ok().build();
    }

    @PostMapping(
            path = "/cook",
            consumes = "application/json"
    )
    public ResponseEntity<?> cook(@RequestBody Integer recipeId) {
        cookingService.runCooking(recipeId);
        return ResponseEntity.ok().build();
    }
}
