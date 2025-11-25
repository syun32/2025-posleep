package com.syun.posleep.domain;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(
        name = "user_ingredient",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "ingredient_id"})
        }
)
@Getter
public class UserIngredient {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "is_registered", nullable = false)
    private Boolean isRegistered = false;

    protected UserIngredient() {}

    public UserIngredient(User user, Ingredient ingredient) {
        this.user = user;
        this.ingredient = ingredient;
        this.quantity = 0;
        this.isRegistered = false;
    }

    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setIsRegistered(Boolean isRegistered) { this.isRegistered = isRegistered; }
    public void decrease(Integer diff) {
        this.quantity -= diff;
    }
}
