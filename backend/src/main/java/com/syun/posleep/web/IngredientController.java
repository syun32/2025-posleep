package com.syun.posleep.web;

import com.syun.posleep.dto.response.ApiResponse;
import com.syun.posleep.dto.request.IngredientForm;
import com.syun.posleep.query.IngredientSheetRow;
import com.syun.posleep.security.jwt.CustomUserDetails;
import com.syun.posleep.service.IngredientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ApiResponse<List<IngredientSheetRow>> getPage(@AuthenticationPrincipal CustomUserDetails user) {
        Integer userId = user.getUserId();
        List<IngredientSheetRow> list = svc.listAllOrdered(userId);
        return ApiResponse.success(list);
    }

    @PostMapping(
            path = "/update",
            consumes = "application/json"
    )
    public ResponseEntity<?> update(@Valid @RequestBody IngredientForm form,
                                 BindingResult br, @AuthenticationPrincipal CustomUserDetails user) {

        if (br.hasErrors()) {
            return ResponseEntity.badRequest().body(br.getAllErrors());
        }

        Integer userId = user.getUserId();

        svc.update(form, userId);

        return ResponseEntity.ok().build();
    }
}
