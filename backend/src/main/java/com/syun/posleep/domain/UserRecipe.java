package com.syun.posleep.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "user_recipe",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "up_user_recipe",
                        columnNames = {"user_id", "recipe_id"}
                )
        }
)
@Getter
public class UserRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_recipe_user")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "recipe_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_recipe_recipe")
    )
    private Recipe recipe;

    @Column(name = "is_registered", nullable = false)
    private boolean isRegistered = false;

    @Column(name = "is_target", nullable = false)
    private boolean isTarget = false;

    protected UserRecipe() {}

    public UserRecipe(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
    }

    public void setRegistered(boolean registered) {
        isRegistered = registered;
    }

    public void setTarget(boolean target) {
        isTarget = target;
    }
}
