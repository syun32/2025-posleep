package com.syun.posleep.web;

import com.syun.posleep.domain.Ingredient;
import com.syun.posleep.dto.IngredientForm;
import com.syun.posleep.service.IngredientService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ingredients")
public class IngredientController {
    private final IngredientService svc;
    public IngredientController(IngredientService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<Ingredient> getPage(Model model) {
        return svc.listAllOrdered();
    }

    @PostMapping(
            path = "/update",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> update(@Valid @RequestBody IngredientForm form,
                                 BindingResult br) {

        if (br.hasErrors()) {
            return ResponseEntity.badRequest().body(br.getAllErrors());
        }

        svc.update(form);
        return ResponseEntity.ok().build();
    }
}
