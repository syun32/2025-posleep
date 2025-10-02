package com.syun.posleep.web;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.dto.RecipeForm;
import com.syun.posleep.query.RecipeSheetRow;
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

    private final RecipeService svc;

    public RecipeController(RecipeService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<RecipeSheetRow> getRecipes() {
        return svc.findRecipeSheet();
    }

    @GetMapping("/pots")
    public Pot getPot() {
        return svc.getSinglePotOrNull();
    }

    @PostMapping(
            path = "/flags",
            consumes = "application/json"
    )
    public ResponseEntity<?> saveFlags(@RequestBody RecipeForm form) {
        int changed = svc.updateFlags(form);
        return ResponseEntity.ok(Map.of("changed", changed));
    }

    @PostMapping(
            path = "/pots",
            consumes = "application/json"
    )
    public ResponseEntity<?> savePot(@RequestBody Pot pot) {
        svc.updatePot(pot.getId(), pot.getCapacity(), pot.getIsCamping(), pot.getCategory());
        return ResponseEntity.ok().build();
    }
}
