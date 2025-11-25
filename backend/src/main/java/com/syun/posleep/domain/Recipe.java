package com.syun.posleep.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Entity
@Table(name = "recipe")
@Getter
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String name;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String category = "";

    @Min(0)
    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity = 0;

    @Column(name = "energy")
    private Integer energy;

    @Column(name = "ingredient_id1")
    private Integer ingredientId1;

    @Column(name = "need1")
    private Integer need1;

    @Column(name = "ingredient_id2")
    private Integer ingredientId2;

    @Column(name = "need2")
    private Integer need2;

    @Column(name = "ingredient_id3")
    private Integer ingredientId3;

    @Column(name = "need3")
    private Integer need3;

    @Column(name = "ingredient_id4")
    private Integer ingredientId4;

    @Column(name = "need4")
    private Integer need4;

    protected Recipe() {}

    public Recipe(String name, String category, Integer totalQuantity, Integer energy) {
        this.name = name;
        this.category = category;
        this.totalQuantity = totalQuantity;
        this.energy = energy;
    }

    /* --- Setter --- */

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(String category) {
        this.category = (category == null) ? "" : category;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = (totalQuantity == null || totalQuantity < 0) ? 0 : totalQuantity;
    }

    public void setEnergy(Integer energy) {
        this.energy = energy;
    }

}
