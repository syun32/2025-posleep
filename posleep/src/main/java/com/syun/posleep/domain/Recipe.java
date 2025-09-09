package com.syun.posleep.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "recipe")
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

    @Column(name = "is_registered", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isRegistered = false;

    @Min(0)
    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity = 0;

    @Column(name = "is_target", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isTarget = false;

    protected Recipe() {}

    public Recipe(String name, String category, boolean isRegistered, Integer totalQuantity, boolean isTarget) {
        this.name = name;
        this.category = category;
        this.isRegistered = isRegistered;
        this.totalQuantity = totalQuantity;
        this.isTarget = isTarget;
    }

    /* --- Getter / Setter --- */

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public boolean getIsRegistered() {
        return isRegistered;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public boolean getIsTarget() {
        return isTarget;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(String category) {
        this.category = (category == null) ? "" : category;
    }

    public void setIsRegistered(boolean isRegistered) {
        this.isRegistered = isRegistered;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = (totalQuantity == null || totalQuantity < 0) ? 0 : totalQuantity;
    }

    public void setIsTarget(boolean isTarget) {
        this.isTarget = isTarget;
    }
}
