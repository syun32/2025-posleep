package com.syun.posleep.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "pot")
public class Pot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Min(0)
    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "is_camping", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isCamping = false;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String category = "";

    protected Pot() {}

    public Pot(Integer capacity, boolean isCamping, String category) {
        this.capacity = capacity;
        this.isCamping = isCamping;
        this.category = category;
    }

    /* --- Getter / Setter --- */

    public Integer getId() {
        return id;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public boolean getIsCamping() {
        return isCamping;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setIsCamping(boolean isCamping) {
        this.isCamping = isCamping;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
