package com.syun.posleep.dto.request;

import com.syun.posleep.domain.Ingredient;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class IngredientEditRow {
    @NotNull
    private Integer id;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    private boolean isRegistered;

    @NotNull
    @Min(0)
    private Integer quantity;

    public IngredientEditRow() {}
    public IngredientEditRow (Integer id, String name, boolean isRegistered, Integer quantity) {
        this.id = id;
        this.name = name;
        this.isRegistered = isRegistered;
        this.quantity = quantity;
    }

    /* --- Getter / Setter --- */

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean getIsRegistered() {
        return isRegistered;
    }

    public void setIsRegistered(boolean isRegistered) {
        this.isRegistered = isRegistered;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
