package com.syun.posleep.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

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

    protected Pot() {}

    public Pot(Integer capacity, boolean isCamping) {
        this.capacity = capacity;
        this.isCamping = isCamping;
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

}
