package com.syun.posleep.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(
        name = "ingredient",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ingredient_name", columnNames = "name")
        }
)
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    protected Ingredient() {}

    public Ingredient(String name) {
        this.name = name;
    }

    /* --- Getter & Setter --- */
    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
