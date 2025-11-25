package com.syun.posleep.web;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.dto.request.RecipeForm;
import com.syun.posleep.dto.response.ApiResponse;
import com.syun.posleep.query.RecipeSheetRow;
import com.syun.posleep.security.jwt.CustomUserDetails;
import com.syun.posleep.service.CookingService;
import com.syun.posleep.service.RecipeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ApiResponse<List<RecipeSheetRow>> getRecipes(@AuthenticationPrincipal CustomUserDetails user) {
        Integer userId = user.getUserId();
        List<RecipeSheetRow> list = recipeService.findRecipeSheet(userId);
        return ApiResponse.success(list);
    }

    @GetMapping("/pots")
    public ApiResponse<Pot> getPot(@AuthenticationPrincipal CustomUserDetails user) {
        Pot pot = recipeService.getSinglePotOrNull(user.getUserId());
        return ApiResponse.success(pot);
    }

    @PostMapping(
            path = "/flags",
            consumes = "application/json"
    )
    public ResponseEntity<?> saveFlags(@RequestBody RecipeForm form, @AuthenticationPrincipal CustomUserDetails user) {
        Integer userId = user.getUserId();
        int changed = recipeService.updateFlags(form, userId);
        return ResponseEntity.ok(Map.of("changed", changed));
    }

    @PostMapping(
            path = "/pots",
            consumes = "application/json"
    )
    public ResponseEntity<?> savePot(@RequestBody Pot pot, @AuthenticationPrincipal CustomUserDetails user) {
        recipeService.updatePot(user.getUserId(), pot.getCapacity(), pot.getIsCamping(), pot.getCategory());
        return ResponseEntity.ok().build();
    }

    @PostMapping(
            path = "/cook",
            consumes = "application/json"
    )
    public ResponseEntity<?> cook(@RequestBody Integer recipeId, @AuthenticationPrincipal CustomUserDetails user) {
        Integer userId = user.getUserId();
        cookingService.runCooking(recipeId, userId);
        return ResponseEntity.ok().build();
    }
}
