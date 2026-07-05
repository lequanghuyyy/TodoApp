package com.example.todoapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestExceptionController {
    @GetMapping("/test-exception")
    public String throwException() {
        throw new RuntimeException("test exception for 500");
    }
}
