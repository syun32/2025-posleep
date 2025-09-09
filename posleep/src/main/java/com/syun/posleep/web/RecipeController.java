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
    public String sheet(@RequestParam(defaultValue = "false") boolean exceptRegistered,
                        @RequestParam(defaultValue = "false") boolean orderByTarget,
                        @RequestParam(defaultValue = "all") String selectedCategory,
                        Model model) {
        log.info("[GET] /recipes : Request Recieved (exceptRegistered={}, orderByTarget={}, selectedCategory={})", exceptRegistered, orderByTarget, selectedCategory);

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

        log.info("[GET] /recipes : Response Success (exceptRegistered={}, orderByTarget={}, selectedCategory={})", exceptRegistered, orderByTarget, selectedCategory);
        return "recipeList";
    }

    @PostMapping("/flags")
    public String saveFlags(@ModelAttribute("form") @Valid RecipeForm form,
                            BindingResult br,
                            RedirectAttributes ra) {
        log.info("[POST] /recipes/flags : Request Recieved");

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

        log.info("[POST] /recipes/flags : Response Success ({} recipes Saved", changed);
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
        log.info("[POST] /recipes/pots : Request Recieved (capacity={}, isCamping={})", capacity, isCamping);

        service.updatePot(id, capacity, isCamping);

        ra.addFlashAttribute("msg", "냄비 설정이 저장되었습니다.");
        ra.addAttribute("exceptRegistered", exceptRegistered);
        ra.addAttribute("orderByTarget", orderByTarget);
        ra.addAttribute("selectedCategory", selectedCategory);

        log.info("[POST] /recipes/pots : Response Success (capacity={}, isCamping={})", capacity, isCamping);
        return "redirect:/recipes";
    }
}
