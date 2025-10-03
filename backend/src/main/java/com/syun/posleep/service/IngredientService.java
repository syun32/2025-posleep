package com.syun.posleep.service;

import com.syun.posleep.domain.Ingredient;
import com.syun.posleep.domain.RecipeIngredient;
import com.syun.posleep.dto.request.IngredientEditRow;
import com.syun.posleep.dto.request.IngredientForm;
import com.syun.posleep.query.IngredientSheetRow;
import com.syun.posleep.query.RecipeSheetRow;
import com.syun.posleep.repository.IngredientQueryRepository;
import com.syun.posleep.repository.IngredientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class IngredientService {
    private final IngredientRepository repo;
    private final IngredientQueryRepository queryRepository;
    public IngredientService(IngredientRepository repo, IngredientQueryRepository queryRepository) {
        this.repo = repo;
        this.queryRepository = queryRepository;
    }

    @Transactional(readOnly = true)
    public List<IngredientSheetRow> listAllOrdered() {
        List<IngredientSheetRow> result = queryRepository.findIngredientSheet();
        return result;
    }

    @Transactional
    public void update(IngredientForm form) {
        if (form.getRows() == null || form.getRows().isEmpty()) return;

        var ids = form.getRows().stream().map(IngredientEditRow::getId).toList();
        Map<Integer, Ingredient> map = repo.findAllById(ids).stream()
                .collect(Collectors.toMap(Ingredient::getId, Function.identity()));

        int changed = 0;
        for (IngredientEditRow r : form.getRows()) {
            Ingredient e = map.get(r.getId());
            if (e == null) {
                throw new EntityNotFoundException("Ingredient not found: id = " + r.getId());
            }
            if (e.getIsRegistered() != r.getIsRegistered() || e.getQuantity() != r.getQuantity()) {
                changed++;
            }
            e.setIsRegistered(r.getIsRegistered());
            e.setQuantity(r.getQuantity());
        }
        log.info("[IngredientService.update] {}건 업데이트 성공", changed);
    }

    @Transactional(readOnly = true)
    public void ensureAllEnough(List<RecipeIngredient> recipeIngredientList) {
        for (RecipeIngredient r : recipeIngredientList) {
            Ingredient i = repo.findFirstById(r.getIngredientId());
            if (i.getQuantity() < r.getQuantity()) {
                throw new IllegalStateException("식재료 부족: " + i.getName());
            }
        }
    }

    @Transactional
    public void decreaseByRecipe(List<RecipeIngredient> recipeIngredientList) {
        for (RecipeIngredient r : recipeIngredientList) {
            Ingredient i = repo.findFirstById(r.getIngredientId());
            i.decrease(r.getQuantity());
        }
    }
}
