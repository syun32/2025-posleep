package com.syun.posleep.dto.request;

import java.util.ArrayList;
import java.util.List;

public class IngredientForm {
    private List<IngredientEditRow> rows = new ArrayList<>();

    public List<IngredientEditRow> getRows() {
        return rows;
    }

    public void setRows(List<IngredientEditRow> rows) {
        this.rows = rows;
    }
}
