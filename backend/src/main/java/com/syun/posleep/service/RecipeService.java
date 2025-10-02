package com.syun.posleep.service;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.dto.RecipeEditRow;
import com.syun.posleep.dto.RecipeForm;
import com.syun.posleep.query.RecipeSheetRow;
import com.syun.posleep.repository.PotRepository;
import com.syun.posleep.repository.RecipeQueryRepository;
import com.syun.posleep.repository.RecipeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class RecipeService {
    private final RecipeQueryRepository queryRepository;
    private final RecipeRepository recipeRepository;
    private final PotRepository potRepository;

    public RecipeService(RecipeQueryRepository queryRepository,
                         RecipeRepository recipeRepository,
                         PotRepository potRepository) {
        this.queryRepository = queryRepository;
        this.recipeRepository = recipeRepository;
        this.potRepository = potRepository;
    }

    @Transactional(readOnly = true)
    public Pot getSinglePotOrNull() {
        Pot result = potRepository.findFirstByOrderByIdAsc().orElse(null);
        return result;
    }

    @Transactional
    public void updatePot(Integer potId, Integer capacity, boolean isCamping, String category) {
        Pot pot = (potId != null)
                ? potRepository.findById(potId).orElseThrow(() -> new IllegalArgumentException("Pot not found: " + potId))
                : potRepository.findFirstByOrderByIdAsc().orElseThrow(() -> new IllegalArgumentException("Pot row not found"));

        int cap = (capacity == null || capacity < 0) ? 0 : capacity;
        pot.setCapacity(cap);
        pot.setIsCamping(isCamping);
        pot.setCategory(category);
    }

    @Transactional(readOnly = true)
    public List<RecipeSheetRow> findRecipeSheet() {
        List<RecipeSheetRow> result = queryRepository.findRecipeSheet();
        return result;
    }

    @Transactional
    public int updateFlags(RecipeForm form) {
        int changed = 0;
        for (RecipeEditRow row : form.getRows()) {
            boolean isRegistered = row.getIsRegistered();
            boolean isTarget = row.getIsTarget();
            changed += recipeRepository.updateFlags(row.getId(), isRegistered, isTarget);
        }
        log.info("[RecipeService.updateFlags] {}건 업데이트", changed);
        return changed;
    }
}
