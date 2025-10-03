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

    @Column(name = "is_registered", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isRegistered = false;

    @Min(0)
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    protected Ingredient() {}

    public Ingredient(String name, boolean isRegistered, Integer quantity) {
        this.name = name;
        this.isRegistered = isRegistered;
        this.quantity = quantity;
    }

    /* --- Getter & Setter --- */
    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean getIsRegistered() {
        return isRegistered;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setIsRegistered(boolean isRegistered) {
        this.isRegistered = isRegistered;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)  return true;
        if (!(o instanceof Ingredient other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public String toString() {
        return "Ingredient{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", isRegistered=" + isRegistered +
                ", quantity=" + quantity +
                '}';
    }

    public void decrease(Integer diff) {
        this.quantity -= diff;
    }
}
