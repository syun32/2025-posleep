package com.syun.posleep.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class RecipeForm {

    @Valid
    @NotNull
    private List<RecipeEditRow> rows = new ArrayList<>();

    private boolean exceptRegistered;
    private boolean orderByTarget;

    private String selectedCategory;

    public List<RecipeEditRow> getRows() {
        return rows;
    }

    public void setRows(List<RecipeEditRow> rows) {
        this.rows = rows;
    }

    public boolean isExceptRegistered() {
        return exceptRegistered;
    }

    public void setExceptRegistered(boolean exceptRegistered) {
        this.exceptRegistered = exceptRegistered;
    }

    public boolean isOrderByTarget() {
        return orderByTarget;
    }

    public void setOrderByTarget(boolean orderByTarget) {
        this.orderByTarget = orderByTarget;
    }

    public String getSelectedCategory() {
        return selectedCategory;
    }

    public void setSelectedCategory(String selectedCategory) {
        this.selectedCategory = selectedCategory;
    }
}
