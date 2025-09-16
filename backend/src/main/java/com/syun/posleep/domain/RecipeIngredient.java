package com.syun.posleep.domain;


import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "recipe_ingredient",
        indexes = {
            @Index(name = "idx_recipe_pos", columnList = "recipe_id, position"),
            @Index(name = "idx_ingredient_id", columnList = "ingredient_id")
        }
)
public class RecipeIngredient {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "recipe_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "recipe_ingredient_ibfk_1")
    )
    private Recipe recipe;

    @Column(name = "ingredient_id", nullable = false)
    private Integer ingredientId;

    @Min(0)
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    @Min(1)
    @Column(name = "position", nullable = false)
    private Integer position = 1;

    protected RecipeIngredient() {}

    public RecipeIngredient(Integer id, Recipe recipe, Integer ingredientId, Integer quantity, Integer position) {
        this.id = id;
        this.recipe = recipe;
        this.ingredientId = ingredientId;
        this.quantity = quantity;
        this.position = position;
    }

    /* --- Getter / Setter --- */

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Integer getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Integer ingredientId) {
        this.ingredientId = ingredientId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = (quantity == null || quantity < 0) ? 0 : quantity;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = (position == null || position < 1) ? 1 : position;
    }
}
