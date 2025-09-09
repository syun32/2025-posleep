package com.syun.posleep.service;

import com.syun.posleep.domain.Ingredient;
import com.syun.posleep.dto.IngredientEditRow;
import com.syun.posleep.dto.IngredientForm;
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
    public IngredientService(IngredientRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Ingredient> listAllOrdered() {
        List<Ingredient> result = repo.findAllByOrderByIdAsc();
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
}
