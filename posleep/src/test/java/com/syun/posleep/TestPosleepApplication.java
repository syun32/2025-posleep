package com.syun.posleep;

import org.springframework.boot.SpringApplication;

public class TestPosleepApplication {

    public static void main(String[] args) {
        SpringApplication.from(PosleepApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
