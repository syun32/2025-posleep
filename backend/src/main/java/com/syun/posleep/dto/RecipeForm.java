package com.syun.posleep.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class RecipeForm {

    @Valid
    @NotNull
    private List<RecipeEditRow> rows = new ArrayList<>();

    public List<RecipeEditRow> getRows() {
        return rows;
    }

    public void setRows(List<RecipeEditRow> rows) {
        this.rows = rows;
    }
}
