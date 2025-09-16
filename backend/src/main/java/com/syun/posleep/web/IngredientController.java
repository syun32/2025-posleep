package com.syun.posleep.web;

import com.syun.posleep.domain.Ingredient;
import com.syun.posleep.dto.IngredientEditRow;
import com.syun.posleep.dto.IngredientForm;
import com.syun.posleep.service.IngredientService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/ingredients")
public class IngredientController {
    private final IngredientService svc;
    public IngredientController(IngredientService svc) {
        this.svc = svc;
    }

    @GetMapping
    public String getPage(Model model) {

        var list = svc.listAllOrdered();

        IngredientForm form = new IngredientForm();
        for (Ingredient e : list) {
            form.getRows().add(new IngredientEditRow(
                    e.getId(),
                    e.getName(),
                    e.getIsRegistered(),
                    e.getQuantity()
            ));
        }

        model.addAttribute("ingredients", list);
        model.addAttribute("form", form);

        return "ingredientList";
    }

    @PostMapping("/update")
    public String update(@Valid @ModelAttribute("form") IngredientForm form,
                         BindingResult br,
                         RedirectAttributes ra,
                         Model model) {

        if (br.hasErrors()) {
            model.addAttribute("ingredients", svc.listAllOrdered());
            return "ingredientList";
        }
        svc.update(form);
        ra.addFlashAttribute("msg", "저장되었습니다.");

        return "redirect:/ingredients";
    }
}
