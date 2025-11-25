package com.syun.posleep.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.awt.*;

@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false, unique = true)
    private String name;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 50, nullable = false)
    private String role = "ROLE_USER";

    public User(String name, String encodedPassword) {
        this.name = name;
        this.password = encodedPassword;
        this.role = "ROLE_USER";
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
