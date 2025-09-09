package com.syun.posleep.web;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.dto.RecipeEditRow;
import com.syun.posleep.dto.RecipeForm;
import com.syun.posleep.query.RecipeSheetRow;
import com.syun.posleep.service.RecipeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Controller
@RequestMapping("/recipes")
public class RecipeController {

    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }

    @GetMapping
    public String getPage(@RequestParam(defaultValue = "false") boolean exceptRegistered,
                          @RequestParam(defaultValue = "false") boolean orderByTarget,
                          @RequestParam(defaultValue = "all") String selectedCategory,
                          Model model) {

        Pot pot = service.getSinglePotOrNull();

        List<RecipeSheetRow> rows = service.findRecipeSheet(exceptRegistered, orderByTarget, selectedCategory);

        RecipeForm form = new RecipeForm();
        form.setExceptRegistered(exceptRegistered);
        form.setOrderByTarget(orderByTarget);
        form.setSelectedCategory(selectedCategory);

        List<RecipeEditRow> edits = new ArrayList<>(rows.size());
        for (RecipeSheetRow r : rows) {
            RecipeEditRow e = new RecipeEditRow();
            e.setId(r.getId());
            e.setIsRegistered(r.getIsRegistered());
            e.setIsTarget(r.getIsTarget());
            edits.add(e);
        }
        form.setRows(edits);

        model.addAttribute("pot", pot);
        model.addAttribute("sheet", rows);
        model.addAttribute("form", form);
        model.addAttribute("exceptRegistered", exceptRegistered);
        model.addAttribute("orderByTarget", orderByTarget);
        model.addAttribute("selectedCategory", selectedCategory);

        return "recipeList";
    }

    @PostMapping("/flags")
    public String saveFlags(@ModelAttribute("form") @Valid RecipeForm form,
                            BindingResult br,
                            RedirectAttributes ra) {

        if (br.hasErrors()) {
            ra.addFlashAttribute("err", "입력값을 확인해주세요.");
            ra.addAttribute("exceptRegistered", form.isExceptRegistered());
            ra.addAttribute("orderByTarget", form.isOrderByTarget());
            ra.addAttribute("selectedCategory", form.getSelectedCategory());
            return "redirect:/recipes";
        }
        int changed = service.updateFlags(form);
        ra.addFlashAttribute("msg", changed + "건 저장되었습니다.");
        ra.addAttribute("exceptRegistered", form.isExceptRegistered());
        ra.addAttribute("orderByTarget", form.isOrderByTarget());
        ra.addAttribute("selectedCategory", form.getSelectedCategory());

        return "redirect:/recipes";
    }

    @PostMapping("/pots")
    public String savePot(@RequestParam(required = false) Integer id,
                          @RequestParam Integer capacity,
                          @RequestParam(defaultValue = "false") boolean isCamping,
                          @RequestParam(defaultValue = "false") boolean exceptRegistered,
                          @RequestParam(defaultValue = "false") boolean orderByTarget,
                          @RequestParam(defaultValue = "all") String selectedCategory,
                          RedirectAttributes ra) {

        service.updatePot(id, capacity, isCamping);

        ra.addFlashAttribute("msg", "냄비 설정이 저장되었습니다.");
        ra.addAttribute("exceptRegistered", exceptRegistered);
        ra.addAttribute("orderByTarget", orderByTarget);
        ra.addAttribute("selectedCategory", selectedCategory);

        return "redirect:/recipes";
    }
}
