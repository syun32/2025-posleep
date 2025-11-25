package com.syun.posleep.service;

import com.syun.posleep.domain.Ingredient;
import com.syun.posleep.domain.RecipeIngredient;
import com.syun.posleep.domain.UserIngredient;
import com.syun.posleep.dto.request.IngredientEditRow;
import com.syun.posleep.dto.request.IngredientForm;
import com.syun.posleep.query.IngredientSheetRow;
import com.syun.posleep.query.RecipeSheetRow;
import com.syun.posleep.repository.IngredientQueryRepository;
import com.syun.posleep.repository.IngredientRepository;
import com.syun.posleep.repository.UserIngredientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class IngredientService {
//    private final IngredientRepository repo;
    private final UserIngredientRepository repo;
    private final IngredientQueryRepository queryRepository;
    public IngredientService(UserIngredientRepository repo, IngredientQueryRepository queryRepository) {
        this.repo = repo;
        this.queryRepository = queryRepository;
    }

    @Transactional(readOnly = true)
    public List<IngredientSheetRow> listAllOrdered(Integer userId) {
        List<IngredientSheetRow> result = queryRepository.findIngredientSheet(userId);
        return result;
    }

    @Transactional
    public void update(IngredientForm form, Integer userId) {
        if (form.getRows() == null || form.getRows().isEmpty()) return;

        Map<Integer, UserIngredient> map = repo.findByUserId(userId).stream()
                .collect(Collectors.toMap(ui -> ui.getIngredient().getId(), Function.identity()));

        int changed = 0;
        for (IngredientEditRow r : form.getRows()) {
            UserIngredient ui = map.get(r.getId());

            if (ui == null) {
                throw new EntityNotFoundException("Ingredient not found: id = " + r.getId());
            }

            if (ui.getIsRegistered() != r.getIsRegistered() || ui.getQuantity() != r.getQuantity()) {
                ui.setIsRegistered(r.getIsRegistered());
                ui.setQuantity(r.getQuantity());
                changed++;
            }
        }

        log.info("[IngredientService.update] {}건 업데이트 성공", changed);
    }

    @Transactional(readOnly = true)
    public void ensureAllEnough(List<RecipeIngredient> recipeIngredientList, Integer userId) {
        Map<Integer, UserIngredient> map = repo.findByUserId(userId).stream()
                .collect(Collectors.toMap(ui -> ui.getIngredient().getId(), Function.identity()));

        for (RecipeIngredient r : recipeIngredientList) {
            UserIngredient i = map.get(r.getIngredientId());
            if (i.getQuantity() < r.getQuantity()) {
                throw new IllegalStateException("식재료 부족: " + i.getIngredient().getName());
            }
        }
    }

    @Transactional
    public void decreaseByRecipe(List<RecipeIngredient> recipeIngredientList, Integer userId) {
        for (RecipeIngredient r : recipeIngredientList) {
            UserIngredient i = repo.findByUserIdAndIngredientId(userId, r.getIngredientId())
                    .orElseThrow(() -> new IllegalStateException("존재하지 않는 식재료 입니다: " + r.getIngredientId()));
            i.decrease(r.getQuantity());
        }
    }
}
